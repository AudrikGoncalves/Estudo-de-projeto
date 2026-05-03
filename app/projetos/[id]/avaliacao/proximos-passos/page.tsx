'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'

const SUGESTOES_PASSOS = [
  'Elaborar plantas baixas esquemáticas',
  'Produzir cortes esquemáticos',
  'Desenvolver estudo volumétrico (maquete ou 3D)',
  'Validar o programa com o cliente',
  'Apresentar o partido arquitetônico ao cliente',
  'Verificar compatibilidade com legislação municipal',
  'Consultar profissional de estrutura sobre viabilidade',
  'Elaborar memorial descritivo do Estudo Preliminar',
  'Definir cronograma para o anteprojeto',
]

export default function ProximosPassosPage() {
  const { projetoAtivo, atualizarAvaliacao, modo } = useStore()
  const [novoPasso, setNovoPasso] = useState('')

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const { proximosPassos } = projetoAtivo.avaliacao

  function adicionar(texto?: string) {
    const passo = (texto ?? novoPasso).trim()
    if (!passo || proximosPassos.includes(passo)) return
    atualizarAvaliacao({ proximosPassos: [...proximosPassos, passo] })
    if (!texto) setNovoPasso('')
  }

  function remover(i: number) {
    atualizarAvaliacao({ proximosPassos: proximosPassos.filter((_, idx) => idx !== i) })
  }

  function mover(i: number, dir: -1 | 1) {
    const novos = [...proximosPassos]
    const tmp = novos[i]
    novos[i] = novos[i + dir]
    novos[i + dir] = tmp
    atualizarAvaliacao({ proximosPassos: novos })
  }

  const checklistOk = Object.values(projetoAtivo.avaliacao.checklistConformidade).filter(Boolean).length
  const checklistTotal = 11
  const conflitosAbertos = projetoAtivo.avaliacao.conflitos.length

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Próximos Passos</h2>
        {modo === 'didatico' && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            <strong>③ Avaliação — Próximos Passos</strong><br />
            Liste o que falta concluir o EP e o que deve ser produzido para o anteprojeto. O EP está completo quando todos os itens do checklist estão marcados e os conflitos resolvidos.
          </div>
        )}
      </div>

      {/* Status resumo */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatusCard
          label="Checklist"
          valor={`${checklistOk}/${checklistTotal}`}
          ok={checklistOk === checklistTotal}
        />
        <StatusCard
          label="Conflitos em aberto"
          valor={conflitosAbertos.toString()}
          ok={conflitosAbertos === 0}
          invertido
        />
        <StatusCard
          label="Próximos passos"
          valor={proximosPassos.length.toString()}
          ok={proximosPassos.length > 0}
        />
      </div>

      {checklistOk === checklistTotal && conflitosAbertos === 0 && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800 font-semibold text-sm">🎉 Estudo Preliminar concluído!</p>
          <p className="text-green-700 text-sm mt-1">Todos os itens foram verificados e não há conflitos abertos. Você pode avançar para o Anteprojeto.</p>
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <h3 className="font-semibold text-slate-800 mb-4">Lista de próximos passos</h3>

        {proximosPassos.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Nenhum passo adicionado.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {proximosPassos.map((passo, i) => (
              <div key={i} className="flex items-center gap-2 p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                <span className="text-xs text-slate-300 font-mono w-5">{i + 1}</span>
                <span className="flex-1 text-sm text-slate-700">{passo}</span>
                <div className="flex gap-1">
                  {i > 0 && <button onClick={() => mover(i, -1)} className="text-slate-300 hover:text-slate-600 text-xs px-1">↑</button>}
                  {i < proximosPassos.length - 1 && <button onClick={() => mover(i, 1)} className="text-slate-300 hover:text-slate-600 text-xs px-1">↓</button>}
                  <button onClick={() => remover(i)} className="text-slate-300 hover:text-red-400 text-xs px-1">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            value={novoPasso}
            onChange={(e) => setNovoPasso(e.target.value)}
            placeholder="Adicionar próximo passo..."
            onKeyDown={(e) => { if (e.key === 'Enter') adicionar() }}
          />
          <button onClick={() => adicionar()} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700">
            +
          </button>
        </div>
      </section>

      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-700 text-sm mb-3">Sugestões rápidas</h3>
        <div className="flex flex-wrap gap-2">
          {SUGESTOES_PASSOS.filter((s) => !proximosPassos.includes(s)).map((s) => (
            <button
              key={s}
              onClick={() => adicionar(s)}
              className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:border-slate-300 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatusCard({ label, valor, ok, invertido = false }: { label: string; valor: string; ok: boolean; invertido?: boolean }) {
  const cor = (invertido ? !ok : ok) ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-600'
  return (
    <div className={`border rounded-xl p-3 text-center ${cor}`}>
      <p className="text-2xl font-bold">{valor}</p>
      <p className="text-xs mt-0.5">{label}</p>
    </div>
  )
}
