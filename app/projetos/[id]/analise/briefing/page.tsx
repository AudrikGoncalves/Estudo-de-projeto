'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { type Ambiente, type Setor, SETORES } from '@/lib/tipos'
import { gerarAmbientesIniciais } from '@/lib/dados/ambientes-padrao'

export default function BriefingPage() {
  const { projetoAtivo, atualizarAnalise, modo } = useStore()
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const { briefing } = projetoAtivo.analise
  const ambientes = briefing.ambientes

  function update(campo: string, valor: string) {
    atualizarAnalise({ briefing: { ...briefing, [campo]: valor } })
  }

  function updateAmbiente(id: string, campo: keyof Ambiente, valor: string | number) {
    atualizarAnalise({
      briefing: {
        ...briefing,
        ambientes: ambientes.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)),
      },
    })
  }

  function adicionarAmbiente() {
    const novo: Ambiente = {
      id: `amb-${Date.now()}`,
      nome: '',
      setor: 'social',
      areaMinima: 0,
      quantidade: 1,
    }
    atualizarAnalise({ briefing: { ...briefing, ambientes: [...ambientes, novo] } })
  }

  function removerAmbiente(id: string) {
    atualizarAnalise({
      briefing: { ...briefing, ambientes: ambientes.filter((a) => a.id !== id) },
    })
  }

  function carregarSugestoes() {
    const sugeridos = gerarAmbientesIniciais(projetoAtivo!.tipologia)
    atualizarAnalise({ briefing: { ...briefing, ambientes: sugeridos } })
    setMostrarSugestoes(false)
  }

  const areaTotal = ambientes.reduce((s, a) => s + a.areaMinima * a.quantidade, 0)

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Briefing / Programa de Necessidades</h2>
        {modo === 'didatico' && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>① Análise — Briefing</strong><br />
            O briefing responde: Quem usa? Como usa? Quando usa? O que precisa? O programa de necessidades lista todos os ambientes com suas áreas mínimas e relações funcionais, servindo de base para toda a síntese.
          </div>
        )}
      </div>

      {/* Dados do cliente */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <h3 className="font-semibold text-slate-800 mb-4">Dados do cliente e usuários</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Campo label="Cliente / Contratante">
            <input className={INPUT} value={briefing.cliente} onChange={(e) => update('cliente', e.target.value)} placeholder="Nome ou empresa" />
          </Campo>
          <Campo label="Usuários">
            <input className={INPUT} value={briefing.usuarios} onChange={(e) => update('usuarios', e.target.value)} placeholder="Ex: família de 4 pessoas, 50 funcionários..." />
          </Campo>
          <Campo label="Atividades principais" className="md:col-span-2">
            <textarea className={`${INPUT} h-16 resize-none`} value={briefing.atividades} onChange={(e) => update('atividades', e.target.value)} placeholder="Descreva as principais atividades que ocorrem no espaço..." />
          </Campo>
          <Campo label="Prioridades e requisitos especiais" className="md:col-span-2">
            <textarea className={`${INPUT} h-16 resize-none`} value={briefing.prioridades} onChange={(e) => update('prioridades', e.target.value)} placeholder="Acessibilidade, sustentabilidade, estilo, orçamento, prazos..." />
          </Campo>
        </div>
      </section>

      {/* Programa de ambientes */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800">Programa de Ambientes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Área total estimada: <strong>{areaTotal.toFixed(0)} m²</strong></p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarSugestoes(true)}
              className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100"
            >
              Sugerir ambientes
            </button>
            <button
              onClick={adicionarAmbiente}
              className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700"
            >
              + Adicionar
            </button>
          </div>
        </div>

        {mostrarSugestoes && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <p className="text-amber-800 font-medium mb-2">Carregar ambientes padrão para {projetoAtivo.tipologia}?</p>
            <p className="text-amber-700 text-xs mb-3">Isso substituirá os ambientes atuais por uma lista sugerida baseada na tipologia.</p>
            <div className="flex gap-2">
              <button onClick={carregarSugestoes} className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-amber-700">Sim, carregar</button>
              <button onClick={() => setMostrarSugestoes(false)} className="text-amber-700 px-3 py-1.5 rounded-lg text-xs hover:bg-amber-100">Cancelar</button>
            </div>
          </div>
        )}

        {ambientes.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">Nenhum ambiente adicionado. Use "Sugerir ambientes" ou "Adicionar".</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-medium text-slate-600">Ambiente</th>
                  <th className="text-left py-2 font-medium text-slate-600">Setor</th>
                  <th className="text-right py-2 font-medium text-slate-600">Área mín. (m²)</th>
                  <th className="text-right py-2 font-medium text-slate-600">Qtd.</th>
                  <th className="text-right py-2 font-medium text-slate-600">Total (m²)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ambientes.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-1.5 pr-2">
                      <input
                        className="border border-slate-200 rounded px-2 py-1 w-full text-sm focus:outline-none focus:border-blue-400"
                        value={a.nome}
                        onChange={(e) => updateAmbiente(a.id, 'nome', e.target.value)}
                        placeholder="Nome do ambiente"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <select
                        className="border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400"
                        value={a.setor}
                        onChange={(e) => updateAmbiente(a.id, 'setor', e.target.value as Setor)}
                      >
                        {Object.entries(SETORES).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      <input
                        type="number"
                        className="border border-slate-200 rounded px-2 py-1 w-20 text-right text-sm focus:outline-none focus:border-blue-400"
                        value={a.areaMinima || ''}
                        onChange={(e) => updateAmbiente(a.id, 'areaMinima', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      <input
                        type="number"
                        min={1}
                        className="border border-slate-200 rounded px-2 py-1 w-14 text-right text-sm focus:outline-none focus:border-blue-400"
                        value={a.quantidade}
                        onChange={(e) => updateAmbiente(a.id, 'quantidade', parseInt(e.target.value) || 1)}
                      />
                    </td>
                    <td className="py-1.5 pr-2 text-right text-slate-500 text-xs">
                      {(a.areaMinima * a.quantidade).toFixed(0)}
                    </td>
                    <td className="py-1.5">
                      <button
                        onClick={() => removerAmbiente(a.id)}
                        className="text-slate-300 hover:text-red-500 px-1"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300">
                  <td colSpan={4} className="py-2 font-semibold text-slate-700 text-sm">Total do programa</td>
                  <td className="py-2 text-right font-bold text-slate-900">{areaTotal.toFixed(0)} m²</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

const INPUT = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500'

function Campo({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
