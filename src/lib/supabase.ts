import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton para o cliente Supabase
let supabaseInstance: SupabaseClient | null = null

// Função para obter o cliente Supabase (lazy initialization)
function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Durante o build, retorna um cliente placeholder
    // que será substituído em runtime
    console.warn('Supabase credentials not found, using placeholder')
    supabaseInstance = createClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
    )
  } else {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// Export como objeto com getter para lazy evaluation
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})

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
