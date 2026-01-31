import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      metas: {
        Row: {
          id: string
          user_id: string
          mes: number
          ano: number
          meta_mensal: number
          dias_operacao: number
          entradas_por_dia: number
          stake_por_entrada: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mes: number
          ano: number
          meta_mensal: number
          dias_operacao: number
          entradas_por_dia: number
          stake_por_entrada: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mes?: number
          ano?: number
          meta_mensal?: number
          dias_operacao?: number
          entradas_por_dia?: number
          stake_por_entrada?: number
          created_at?: string
          updated_at?: string
        }
      }
      entradas: {
        Row: {
          id: string
          user_id: string
          data: string
          tipo: 'cavalo' | 'galgo'
          odd_original: number
          odd_lay: number
          stake_ganho: number
          risco: number
          resultado: 'green' | 'red' | 'pendente'
          lucro_prejuizo: number
          observacao: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: string
          tipo: 'cavalo' | 'galgo'
          odd_original: number
          odd_lay: number
          stake_ganho: number
          risco: number
          resultado?: 'green' | 'red' | 'pendente'
          lucro_prejuizo?: number
          observacao?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: string
          tipo?: 'cavalo' | 'galgo'
          odd_original?: number
          odd_lay?: number
          stake_ganho?: number
          risco?: number
          resultado?: 'green' | 'red' | 'pendente'
          lucro_prejuizo?: number
          observacao?: string | null
          created_at?: string
        }
      }
    }
  }
}
