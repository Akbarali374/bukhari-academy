import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// Demo rejimda .env bo'lmasa URL yo'q — client yaratmaymiz.
// Type-checkni soddalashtirish uchun bu yerda any sifatida eksport qilamiz.
export const supabase: any =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
