'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { 
  FaHorse, 
  FaDog, 
  FaSignOutAlt, 
  FaCalendarAlt, 
  FaEuroSign,
  FaBullseye,
  FaChartLine,
  FaPlus,
  FaCheck,
  FaTimes,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarDay
} from 'react-icons/fa'

interface Meta {
  id?: string
  user_id: string
  mes: number
  ano: number
  meta_mensal: number
  dias_operacao: number
  entradas_por_dia: number
  stake_por_entrada: number
}

interface Entrada {
  id?: string
  user_id: string
  data: string
  tipo: 'cavalo' | 'galgo'
  odd_original: number
  odd_lay: number
  stake_ganho: number
  risco: number
  resultado: 'green' | 'red' | 'pendente'
  lucro_prejuizo: number
  observacao?: string
  created_at?: string
}

export default function Dashboard({ user }: { user: User }) {
  // Estado para mês/ano selecionado (permite navegar entre meses)
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1)
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())
  
  const [meta, setMeta] = useState<Meta>({
    user_id: user.id,
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    meta_mensal: 500,
    dias_operacao: 20,
    entradas_por_dia: 5,
    stake_por_entrada: 5,
  })
  
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [novaEntrada, setNovaEntrada] = useState<Partial<Entrada>>({
    tipo: 'cavalo',
    odd_original: 0,
    stake_ganho: 0, // Será preenchido com o valor calculado
    observacao: '',
  })
  const [loading, setLoading] = useState(true)
  const [showAddEntry, setShowAddEntry] = useState(false)

  // Verificar se é o mês atual
  const isMesAtual = mesSelecionado === new Date().getMonth() + 1 && anoSelecionado === new Date().getFullYear()

  // Carregar dados ao iniciar e quando mudar o mês
  useEffect(() => {
    loadData()
  }, [mesSelecionado, anoSelecionado])

  // Navegar para mês anterior
  const mesAnterior = () => {
    if (mesSelecionado === 1) {
      setMesSelecionado(12)
      setAnoSelecionado(anoSelecionado - 1)
    } else {
      setMesSelecionado(mesSelecionado - 1)
    }
  }

  // Navegar para próximo mês
  const proximoMes = () => {
    if (mesSelecionado === 12) {
      setMesSelecionado(1)
      setAnoSelecionado(anoSelecionado + 1)
    } else {
      setMesSelecionado(mesSelecionado + 1)
    }
  }

  // Voltar para mês atual
  const irParaMesAtual = () => {
    setMesSelecionado(new Date().getMonth() + 1)
    setAnoSelecionado(new Date().getFullYear())
  }

  const loadData = async () => {
    setLoading(true)
    
    // Carregar meta do mês selecionado
    const { data: metaData } = await supabase
      .from('metas')
      .select('*')
      .eq('user_id', user.id)
      .eq('mes', mesSelecionado)
      .eq('ano', anoSelecionado)
      .single()

    if (metaData) {
      setMeta(metaData)
    } else {
      // Se não existe meta para o mês, criar uma nova com valores padrão
      setMeta({
        user_id: user.id,
        mes: mesSelecionado,
        ano: anoSelecionado,
        meta_mensal: 500,
        dias_operacao: 20,
        entradas_por_dia: 5,
        stake_por_entrada: 5,
      })
    }

    // Carregar entradas do mês selecionado
    const inicioMes = new Date(anoSelecionado, mesSelecionado - 1, 1).toISOString().split('T')[0]
    const fimMes = new Date(anoSelecionado, mesSelecionado, 0).toISOString().split('T')[0]

    const { data: entradasData } = await supabase
      .from('entradas')
      .select('*')
      .eq('user_id', user.id)
      .gte('data', inicioMes)
      .lte('data', fimMes)
      .order('created_at', { ascending: false })

    if (entradasData) {
      setEntradas(entradasData)
    } else {
      setEntradas([])
    }

    setLoading(false)
  }

  const saveMeta = async () => {
    const { data, error } = await supabase
      .from('metas')
      .upsert({
        ...meta,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,mes,ano'
      })
      .select()
      .single()

    if (!error && data) {
      setMeta(data)
    }
  }

  // Calcular stake por entrada baseado na meta
  const calcularStakePorEntrada = () => {
    const totalEntradas = meta.dias_operacao * meta.entradas_por_dia
    return totalEntradas > 0 ? meta.meta_mensal / totalEntradas : 0
  }

  // Calcular odd LAY (odd original - 1)
  const calcularOddLay = (oddOriginal: number) => {
    return Math.max(oddOriginal - 1, 1)
  }

  // Calcular risco/liability (stake * (odd_lay - 1))
  const calcularRisco = (stakeGanho: number, oddLay: number) => {
    return stakeGanho * (oddLay - 1)
  }

  // Adicionar nova entrada
  const adicionarEntrada = async () => {
    if (!novaEntrada.odd_original || novaEntrada.odd_original <= 1) {
      alert('A odd original deve ser maior que 1')
      return
    }

    const oddLay = calcularOddLay(novaEntrada.odd_original!)
    const stakeGanho = novaEntrada.stake_ganho || meta.stake_por_entrada || 5
    const risco = calcularRisco(stakeGanho, oddLay)

    const entrada: Entrada = {
      user_id: user.id,
      data: new Date().toISOString().split('T')[0],
      tipo: novaEntrada.tipo || 'cavalo',
      odd_original: novaEntrada.odd_original!,
      odd_lay: oddLay,
      stake_ganho: stakeGanho,
      risco: risco,
      resultado: 'pendente',
      lucro_prejuizo: 0,
      observacao: novaEntrada.observacao,
    }

    const { data, error } = await supabase
      .from('entradas')
      .insert(entrada)
      .select()
      .single()

    if (!error && data) {
      setEntradas([data, ...entradas])
      setNovaEntrada({
        tipo: 'cavalo',
        odd_original: 0,
        stake_ganho: meta.stake_por_entrada || 5,
        observacao: '',
      })
      setShowAddEntry(false)
    }
  }

  // Atualizar resultado da entrada
  const atualizarResultado = async (id: string, resultado: 'green' | 'red') => {
    const entrada = entradas.find(e => e.id === id)
    if (!entrada) return

    const lucro_prejuizo = resultado === 'green' 
      ? entrada.stake_ganho 
      : -entrada.risco

    const { error } = await supabase
      .from('entradas')
      .update({ resultado, lucro_prejuizo })
      .eq('id', id)

    if (!error) {
      setEntradas(entradas.map(e => 
        e.id === id ? { ...e, resultado, lucro_prejuizo } : e
      ))
    }
  }

  // Deletar entrada
  const deletarEntrada = async (id: string) => {
    const { error } = await supabase
      .from('entradas')
      .delete()
      .eq('id', id)

    if (!error) {
      setEntradas(entradas.filter(e => e.id !== id))
    }
  }

  // Calcular estatísticas
  const estatisticas = {
    totalEntradas: entradas.length,
    greens: entradas.filter(e => e.resultado === 'green').length,
    reds: entradas.filter(e => e.resultado === 'red').length,
    pendentes: entradas.filter(e => e.resultado === 'pendente').length,
    lucroTotal: entradas.reduce((acc, e) => acc + (e.lucro_prejuizo || 0), 0),
    entradasHoje: entradas.filter(e => e.data === new Date().toISOString().split('T')[0]).length,
  }

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <FaHorse className="text-3xl text-primary-500" />
          <FaDog className="text-2xl text-primary-400" />
          <h1 className="text-2xl font-bold gradient-text">Gestão LAY</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">
            Olá, {user.user_metadata?.name || user.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            Sair
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Meta do Mês */}
        <div className="lg:col-span-1 bg-dark-100/50 backdrop-blur-sm rounded-2xl p-6 card-glow border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaBullseye className="text-2xl text-primary-500" />
              <h2 className="text-xl font-semibold">Meta do Mês</h2>
            </div>
            {!isMesAtual && (
              <button
                onClick={irParaMesAtual}
                className="flex items-center gap-1 text-xs bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 px-2 py-1 rounded transition-colors"
              >
                <FaCalendarDay />
                Atual
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Navegação de Mês */}
            <div className="flex items-center justify-between p-4 bg-dark-200/50 rounded-xl">
              <button
                onClick={mesAnterior}
                className="p-2 hover:bg-dark-100 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <FaChevronLeft />
              </button>
              <div className="text-center">
                <p className={`text-lg font-semibold ${isMesAtual ? 'text-primary-400' : 'text-gray-300'}`}>
                  {meses[mesSelecionado - 1]}
                </p>
                <p className="text-gray-500 text-sm">{anoSelecionado}</p>
              </div>
              <button
                onClick={proximoMes}
                className="p-2 hover:bg-dark-100 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <FaChevronRight />
              </button>
            </div>

            {/* Meta em Euros */}
            <div className="text-center p-4 bg-dark-200/50 rounded-xl">
              <p className="text-gray-400 text-sm mb-2">Meta Mensal</p>
              <div className="flex items-center justify-center gap-2">
                <FaEuroSign className="text-primary-500 text-xl" />
                <input
                  type="number"
                  value={meta.meta_mensal}
                  onChange={(e) => setMeta({ ...meta, meta_mensal: Number(e.target.value), mes: mesSelecionado, ano: anoSelecionado })}
                  onBlur={saveMeta}
                  className="bg-transparent text-3xl font-bold text-center w-32 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-200/50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <FaCalendarAlt />
                  Dias
                </div>
                <input
                  type="number"
                  value={meta.dias_operacao}
                  onChange={(e) => setMeta({ ...meta, dias_operacao: Number(e.target.value), mes: mesSelecionado, ano: anoSelecionado })}
                  onBlur={saveMeta}
                  className="bg-transparent text-2xl font-bold w-full focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                />
              </div>

              <div className="p-4 bg-dark-200/50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <FaChartLine />
                  Entradas/dia
                </div>
                <input
                  type="number"
                  value={meta.entradas_por_dia}
                  onChange={(e) => setMeta({ ...meta, entradas_por_dia: Number(e.target.value), mes: mesSelecionado, ano: anoSelecionado })}
                  onBlur={saveMeta}
                  className="bg-transparent text-2xl font-bold w-full focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                />
              </div>
            </div>

            <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Stake por entrada</p>
              <div className="flex items-center gap-2">
                <FaEuroSign className="text-primary-500" />
                <span className="text-2xl font-bold text-primary-400">
                  {calcularStakePorEntrada().toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Meta ÷ (Dias × Entradas/dia)
              </p>
            </div>
          </div>
        </div>

        {/* Card Estatísticas e Entradas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-100/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <p className="text-gray-400 text-sm">
                {isMesAtual ? 'Entradas Hoje' : 'Total Entradas'}
              </p>
              <p className="text-2xl font-bold">
                {isMesAtual 
                  ? `${estatisticas.entradasHoje}/${meta.entradas_por_dia}`
                  : estatisticas.totalEntradas
                }
              </p>
            </div>
            <div className="bg-dark-100/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
              <p className="text-gray-400 text-sm">Greens</p>
              <p className="text-2xl font-bold text-green-400">{estatisticas.greens}</p>
            </div>
            <div className="bg-dark-100/50 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <p className="text-gray-400 text-sm">Reds</p>
              <p className="text-2xl font-bold text-red-400">{estatisticas.reds}</p>
            </div>
            <div className={`bg-dark-100/50 backdrop-blur-sm rounded-xl p-4 border ${estatisticas.lucroTotal >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
              <p className="text-gray-400 text-sm">Lucro/Prejuízo</p>
              <div className="flex items-center gap-1">
                <FaEuroSign className={estatisticas.lucroTotal >= 0 ? 'text-green-400' : 'text-red-400'} />
                <p className={`text-2xl font-bold ${estatisticas.lucroTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {estatisticas.lucroTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Formulário Nova Entrada - só aparece no mês atual */}
          {isMesAtual ? (
          <div className="bg-dark-100/50 backdrop-blur-sm rounded-2xl p-6 card-glow border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Nova Entrada LAY</h2>
              <button
                onClick={() => setShowAddEntry(!showAddEntry)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showAddEntry 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                <FaPlus className={showAddEntry ? 'rotate-45 transition-transform' : ''} />
                {showAddEntry ? 'Cancelar' : 'Adicionar'}
              </button>
            </div>

            {showAddEntry && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Tipo */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNovaEntrada({ ...novaEntrada, tipo: 'cavalo' })}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                          novaEntrada.tipo === 'cavalo'
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
                        }`}
                      >
                        <FaHorse />
                        Cavalo
                      </button>
                      <button
                        onClick={() => setNovaEntrada({ ...novaEntrada, tipo: 'galgo' })}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                          novaEntrada.tipo === 'galgo'
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
                        }`}
                      >
                        <FaDog />
                        Galgo
                      </button>
                    </div>
                  </div>

                  {/* Odd Original */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Odd Original</label>
                    <input
                      type="number"
                      step="0.01"
                      value={novaEntrada.odd_original || ''}
                      onChange={(e) => setNovaEntrada({ ...novaEntrada, odd_original: Number(e.target.value) })}
                      className="w-full bg-dark-200 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:border-primary-500"
                      placeholder="Ex: 25.00"
                    />
                  </div>

                  {/* Odd LAY (calculada) */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Odd LAY (auto)</label>
                    <div className="bg-dark-200/50 border border-primary-500/30 rounded-lg py-3 px-4 text-primary-400 font-bold">
                      {novaEntrada.odd_original && novaEntrada.odd_original > 1 
                        ? calcularOddLay(novaEntrada.odd_original).toFixed(2)
                        : '—'}
                    </div>
                  </div>

                  {/* Stake para ganhar */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Stake/Ganho (€)
                      <span className="text-xs text-gray-500 ml-1">(editável)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={novaEntrada.stake_ganho || calcularStakePorEntrada()}
                      onChange={(e) => setNovaEntrada({ ...novaEntrada, stake_ganho: Number(e.target.value) })}
                      className="w-full bg-dark-200 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:border-primary-500"
                      placeholder={`${calcularStakePorEntrada().toFixed(2)}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Sugerido: €{calcularStakePorEntrada().toFixed(2)} (baseado na meta)
                    </p>
                  </div>
                </div>

                {/* Cálculo do Risco */}
                {novaEntrada.odd_original && novaEntrada.odd_original > 1 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Risco (Liability)</p>
                        <p className="text-xs text-gray-500">
                          Stake × (Odd LAY - 1) = {novaEntrada.stake_ganho || calcularStakePorEntrada().toFixed(2)} × {(calcularOddLay(novaEntrada.odd_original) - 1).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-red-400">
                        <FaEuroSign />
                        <span className="text-2xl font-bold">
                          {calcularRisco(
                            novaEntrada.stake_ganho || calcularStakePorEntrada(),
                            calcularOddLay(novaEntrada.odd_original)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observação */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Observação (opcional)</label>
                  <input
                    type="text"
                    value={novaEntrada.observacao || ''}
                    onChange={(e) => setNovaEntrada({ ...novaEntrada, observacao: e.target.value })}
                    className="w-full bg-dark-200 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:border-primary-500"
                    placeholder="Nome do evento, corrida, etc."
                  />
                </div>

                <button
                  onClick={adicionarEntrada}
                  className="w-full bg-primary-600 hover:bg-primary-700 py-3 rounded-lg font-semibold transition-colors"
                >
                  Registrar Entrada
                </button>
              </div>
            )}
          </div>
          ) : (
            <div className="bg-dark-100/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 text-center">
              <p className="text-yellow-400">
                Visualizando mês anterior. Para adicionar entradas, volte ao mês atual.
              </p>
            </div>
          )}

          {/* Lista de Entradas */}
          <div className="bg-dark-100/50 backdrop-blur-sm rounded-2xl p-6 card-glow border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4">
              Entradas - {meses[mesSelecionado - 1]} {anoSelecionado}
              {!isMesAtual && <span className="text-sm text-gray-500 ml-2">(histórico)</span>}
            </h2>
            
            {entradas.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Nenhuma entrada registrada ainda.
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {entradas.map((entrada) => (
                  <div
                    key={entrada.id}
                    className={`p-4 rounded-xl border ${
                      entrada.resultado === 'green'
                        ? 'bg-green-500/5 border-green-500/30'
                        : entrada.resultado === 'red'
                        ? 'bg-red-500/5 border-red-500/30'
                        : 'bg-dark-200/50 border-gray-700/50'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          entrada.tipo === 'cavalo' ? 'bg-primary-500/20' : 'bg-blue-500/20'
                        }`}>
                          {entrada.tipo === 'cavalo' ? (
                            <FaHorse className="text-primary-400" />
                          ) : (
                            <FaDog className="text-blue-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">{entrada.data}</span>
                            <span className="text-xs bg-dark-200 px-2 py-0.5 rounded">
                              Odd: {entrada.odd_original} → {entrada.odd_lay}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-green-400">
                              Ganho: €{entrada.stake_ganho.toFixed(2)}
                            </span>
                            <span className="text-red-400">
                              Risco: €{entrada.risco.toFixed(2)}
                            </span>
                          </div>
                          {entrada.observacao && (
                            <p className="text-xs text-gray-500 mt-1">{entrada.observacao}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {entrada.resultado === 'pendente' ? (
                          <>
                            <button
                              onClick={() => atualizarResultado(entrada.id!, 'green')}
                              className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded-lg transition-colors"
                            >
                              <FaCheck />
                              Green
                            </button>
                            <button
                              onClick={() => atualizarResultado(entrada.id!, 'red')}
                              className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg transition-colors"
                            >
                              <FaTimes />
                              Red
                            </button>
                          </>
                        ) : (
                          <div className={`px-3 py-2 rounded-lg font-semibold ${
                            entrada.resultado === 'green'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {entrada.resultado === 'green' ? '+' : ''}€{entrada.lucro_prejuizo.toFixed(2)}
                          </div>
                        )}
                        <button
                          onClick={() => deletarEntrada(entrada.id!)}
                          className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
