-- =====================================================
-- GESTÃO LAY - CAVALOS & GALGOS
-- Execute este SQL no Editor SQL do Supabase
-- =====================================================

-- Tabela de Metas Mensais
CREATE TABLE IF NOT EXISTS metas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2020),
  meta_mensal DECIMAL(10,2) NOT NULL DEFAULT 500,
  dias_operacao INTEGER NOT NULL DEFAULT 20 CHECK (dias_operacao >= 1 AND dias_operacao <= 31),
  entradas_por_dia INTEGER NOT NULL DEFAULT 5 CHECK (entradas_por_dia >= 1),
  stake_por_entrada DECIMAL(10,2) NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Cada usuário só pode ter uma meta por mês/ano
  UNIQUE(user_id, mes, ano)
);

-- Tabela de Entradas (apostas LAY)
CREATE TABLE IF NOT EXISTS entradas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('cavalo', 'galgo')),
  odd_original DECIMAL(8,2) NOT NULL CHECK (odd_original > 1),
  odd_lay DECIMAL(8,2) NOT NULL CHECK (odd_lay >= 1),
  stake_ganho DECIMAL(10,2) NOT NULL CHECK (stake_ganho > 0),
  risco DECIMAL(10,2) NOT NULL CHECK (risco > 0),
  resultado VARCHAR(10) NOT NULL DEFAULT 'pendente' CHECK (resultado IN ('green', 'red', 'pendente')),
  lucro_prejuizo DECIMAL(10,2) NOT NULL DEFAULT 0,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_metas_user_mes_ano ON metas(user_id, mes, ano);
CREATE INDEX IF NOT EXISTS idx_entradas_user_data ON entradas(user_id, data);
CREATE INDEX IF NOT EXISTS idx_entradas_created_at ON entradas(created_at DESC);

-- RLS (Row Level Security) - Cada usuário só vê seus próprios dados
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE entradas ENABLE ROW LEVEL SECURITY;

-- Políticas para Metas
CREATE POLICY "Usuários podem ver suas próprias metas"
  ON metas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias metas"
  ON metas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias metas"
  ON metas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias metas"
  ON metas FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para Entradas
CREATE POLICY "Usuários podem ver suas próprias entradas"
  ON entradas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias entradas"
  ON entradas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias entradas"
  ON entradas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias entradas"
  ON entradas FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PRONTO! Agora configure a autenticação no Supabase:
-- 1. Vá em Authentication > Settings
-- 2. Em "Site URL" coloque: http://localhost:3000
-- 3. Em "Redirect URLs" adicione: http://localhost:3000
-- =====================================================
