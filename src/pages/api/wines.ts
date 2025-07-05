import { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Wine } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { data: wines, error } = await supabase
          .from('wines')
          .select('*')
          .order('name', { ascending: true })

        if (error) {
          return res.status(400).json({ error: error.message })
        }

        return res.status(200).json(wines)
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch wines' })
      }

    case 'POST':
      try {
        const { name, type, vintage, region, price, description } = req.body

        if (!name || !type) {
          return res.status(400).json({ error: 'Name and type are required' })
        }

        const { data: wine, error } = await supabase
          .from('wines')
          .insert([
            {
              name,
              type,
              vintage,
              region,
              price,
              description,
              is_86d: false
            }
          ])
          .select()
          .single()

        if (error) {
          return res.status(400).json({ error: error.message })
        }

        return res.status(201).json(wine)
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create wine' })
      }

    case 'PUT':
      try {
        const { id, ...updateData } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Wine ID is required' })
        }

        const { data: wine, error } = await supabase
          .from('wines')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          return res.status(400).json({ error: error.message })
        }

        return res.status(200).json(wine)
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update wine' })
      }

    case 'DELETE':
      try {
        const { id } = req.body

        if (!id) {
          return res.status(400).json({ error: 'Wine ID is required' })
        }

        const { error } = await supabase
          .from('wines')
          .delete()
          .eq('id', id)

        if (error) {
          return res.status(400).json({ error: error.message })
        }

        return res.status(200).json({ message: 'Wine deleted successfully' })
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete wine' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}

