import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Wine {
  id: string
  name: string
  type: string
  vintage?: number
  region?: string
  price?: number
  description?: string
  is_86d: boolean
  created_at: string
  updated_at: string
}

export interface Cocktail {
  id: string
  name: string
  ingredients: string
  recipe?: string
  price?: number
  type?: string
  is_signature: boolean
  is_86d: boolean
  created_at: string
  updated_at: string
}

export interface Special {
  id: string
  name: string
  description?: string
  price?: number
  type?: string
  start_date?: string
  end_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EightySixedItem {
  id: string
  item_name: string
  item_type: string
  item_id?: string
  timestamp: string
  created_at: string
}

export interface Menu {
  id: string
  title: string
  image_url: string
  ocr_raw_text?: string
  ocr_processed_text?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  password_hash: string
  role: string
  created_at: string
  updated_at: string
}

