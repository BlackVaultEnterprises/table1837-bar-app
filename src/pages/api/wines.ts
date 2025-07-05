import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { data: wines, error: supabaseError } = await supabase
          .from('wines')
          .select('*')
          .order('name', { ascending: true })

        if (supabaseError) {
          return res.status(400).json({ error: supabaseError.message })
        }

        return res.status(200).json(wines)
      } catch (error: unknown) {
        return res.status(500).json({ error: (error as Error).message || 'Failed to fetch wines' })
      }

    case 'POST':
      try {
        const { name, vintage, region, price, type } = req.body

        if (!name || !price) {
          return res.status(400).json({ error: 'Name and price are required' })
        }

        const { data: wine, error: supabaseError } = await supabase
          .from('wines')
          .insert([
            {
              name,
              vintage,
              region,
              price,
              type,
              is_86d: false
            }
          ])
          .select()
          .single()

        if (supabaseError) {
          return res.status(400).json({ error: supabaseError.message })
        }

        return res.status(201).json(wine)
      } catch (error: unknown) {
        return res.status(500).json({ error: (error as Error).message || 'Failed to create wine' })
      }

    case 'PUT':
      try {
        const { id, ...updateData } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Wine ID is required' })
        }

        const { data: wine, error: supabaseError } = await supabase
          .from('wines')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (supabaseError) {
          return res.status(400).json({ error: supabaseError.message })
        }

        return res.status(200).json(wine)
      } catch (error: unknown) {
        return res.status(500).json({ error: (error as Error).message || 'Failed to update wine' })
      }

    case 'DELETE':
      try {
        const { id } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Wine ID is required' })
        }

        const { error: supabaseError } = await supabase
          .from('wines')
          .delete()
          .eq('id', id)

        if (supabaseError) {
          return res.status(400).json({ error: supabaseError.message })
        }

        return res.status(200).json({ message: 'Wine deleted successfully' })
      } catch (error: unknown) {
        return res.status(500).json({ error: (error as Error).message || 'Failed to delete wine' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}(`Method ${method} Not Allowed`)
  }
}

