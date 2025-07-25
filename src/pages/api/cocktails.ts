import { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Cocktail } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { data: cocktails, error: supabaseError } = await supabase
          .from('cocktails')
          .select('*')
          .order('name', { ascending: true })

        if (supabaseError) {
          return res.status(400).json({ error: supabaseError.message })
        }

        return res.status(200).json(cocktails)
      } catch (error: unknown) {
        return res.status(500).json({ error: (error as Error).message || 'Failed to fetch cocktails' })
      }

    case 'POST':
      try {
        const { name, ingredients, recipe, price, type, is_signature } = req.body

        if (!name || !ingredients) {
          return res.status(400).json({ error: 'Name and ingredients are required' })
        }

        const { data: cocktail, error: supabaseError } = await supabase
          .from('cocktails')
          .insert([
            {
              name,
              ingredients,
              recipe,
              price,
              type,
              is_signature: is_signature || false,
              is_86d: false
            }
          ])
          .select()
          .single()

        if (supabaseError) {
          return res.status(400).json({ error: supabaseError.message })
        }

        return res.status(201).json(cocktail)
      } catch (error: unknown) {
        return res.status(500).json({ error: (error as Error).message || 'Failed to create cocktail' })
      }

    case 'PUT':
      try {
        const { id, ...updateData } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Cocktail ID is required' })
        }

        const { data: cocktail, error: supabaseError } = await supabase
          .from('cocktails')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (supabaseError) {
          return res.status(400).json({ error: supabaseError.message })
        }

        return res.status(200).json(cocktail)
      } catch (error: unknown) {
        return res.status(500).json({ error: (error as Error).message || 'Failed to update cocktail' })
      }

    case 'DELETE':
      try {
        const { id } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Cocktail ID is required' })
        }

        const { error: supabaseError } = await supabase
          .from('cocktails')
          .delete()
          .eq('id', id)

        if (supabaseError) {
          return res.status(400).json({ error: supabaseError.message })
        }

        return res.status(200).json({ message: 'Cocktail deleted successfully' })
      } catch (error: unknown) {
        return res.status(500).json({ error: (error as Error).message || 'Failed to delete cocktail' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}

