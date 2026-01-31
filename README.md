# Gestão LAY - Cavalos & Galgos

Sistema de gestão de apostas LAY para cavalos e galgos com autenticação de usuários.

## Funcionalidades

- **Sistema de Login**: Duas ou mais pessoas podem usar com contas separadas
- **Meta Mensal**: Configure sua meta em euros para o mês
- **Dias de Operação**: Quantos dias pretende operar
- **Entradas por Dia**: Meta de entradas diárias (padrão: 5)
- **Cálculo Automático de Stake**: Sistema calcula quanto entrar por aposta
- **Registro de Entradas**: Cavalo ou Galgo com odds
- **Cálculo LAY Automático**: 
  - Odd LAY = Odd Original - 1
  - Risco = Stake × (Odd LAY - 1)
- **Acompanhamento**: Marque resultados como Green ou Red
- **Estatísticas**: Acompanhe lucro/prejuízo em tempo real

## Como Funciona o LAY

No LAY betting, você está apostando CONTRA um resultado acontecer.

**Exemplo:**
- Odd Original: 25.00
- Odd LAY (entrada): 24.00 (25 - 1)
- Se quiser ganhar: €5.00
- Risco (Liability): €5.00 × (24 - 1) = €5.00 × 23 = €115.00

Se o cavalo/galgo NÃO vencer: Você ganha €5.00
Se o cavalo/galgo vencer: Você perde €115.00

## Configuração

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote a **URL** e **anon key** (em Settings > API)

### 2. Configurar Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Copie e cole o conteúdo do arquivo `supabase-setup.sql`
3. Execute o SQL

### 3. Configurar Autenticação

1. No Supabase, vá em **Authentication > URL Configuration**
2. Em **Site URL**: `http://localhost:3000`
3. Em **Redirect URLs**: adicione `http://localhost:3000`

### 4. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.local.example` para `.env.local`
2. Preencha com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 5. Instalar e Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Criar Usuários

1. Na tela de login, clique em "Não tem conta? Criar uma"
2. Crie a primeira conta
3. Repita para a segunda pessoa

## Tecnologias

- **Next.js 14** - Framework React
- **Supabase** - Banco de dados e autenticação
- **Tailwind CSS** - Estilização
- **TypeScript** - Tipagem

## Estrutura do Projeto

```
cavalo/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   └── Login.tsx
│   └── lib/
│       └── supabase.ts
├── supabase-setup.sql
├── .env.local.example
├── package.json
└── README.md
```

## Moeda

O sistema usa **Euros (€)** como moeda padrão.
