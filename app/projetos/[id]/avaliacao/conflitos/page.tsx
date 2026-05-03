'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'

export default function ConflitosPage() {
  const { projetoAtivo, atualizarAvaliacao, modo } = useStore()
  const [novoConflito, setNovoConflito] = useState('')
  const [novoPonto, setNovoPonto] = useState('')

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const { conflitos, pontosEmAberto } = projetoAtivo.avaliacao

  function adicionarConflito() {
    if (!novoConflito.trim()) return
    atualizarAvaliacao({ conflitos: [...conflitos, novoConflito.trim()] })
    setNovoConflito('')
  }

  function removerConflito(i: number) {
    atualizarAvaliacao({ conflitos: conflitos.filter((_, idx) => idx !== i) })
  }

  function adicionarPonto() {
    if (!novoPonto.trim()) return
    atualizarAvaliacao({ pontosEmAberto: [...pontosEmAberto, novoPonto.trim()] })
    setNovoPonto('')
  }

  function removerPonto(i: number) {
    atualizarAvaliacao({ pontosEmAberto: pontosEmAberto.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Conflitos e Pontos de Atenção</h2>
        {modo === 'didatico' && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            <strong>③ Avaliação — Conflitos</strong><br />
            Registre conflitos funcionais ou formais identificados e decisões que precisam de validação do cliente antes de avançar.
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ListaEditavel
          titulo="Conflitos Identificados"
          descricao="Incompatibilidades entre setores, fluxos problemáticos, incoerências formais..."
          cor="red"
          itens={conflitos}
          novoItem={novoConflito}
          onNovoChange={setNovoConflito}
          onAdicionar={adicionarConflito}
          onRemover={removerConflito}
          placeholder="Ex: Garagem bloqueia acesso social, dormitórios voltados para Oeste..."
        />

        <ListaEditavel
          titulo="Pontos em Aberto"
          descricao="Questões não resolvidas que precisam de decisão do cliente ou mais estudo..."
          cor="amber"
          itens={pontosEmAberto}
          novoItem={novoPonto}
          onNovoChange={setNovoPonto}
          onAdicionar={adicionarPonto}
          onRemover={removerPonto}
          placeholder="Ex: Validar número de vagas, definir se haverá subsolo..."
        />
      </div>
    </div>
  )
}

function ListaEditavel({
  titulo, descricao, cor, itens, novoItem, onNovoChange, onAdicionar, onRemover, placeholder,
}: {
  titulo: string
  descricao: string
  cor: 'red' | 'amber'
  itens: string[]
  novoItem: string
  onNovoChange: (v: string) => void
  onAdicionar: () => void
  onRemover: (i: number) => void
  placeholder: string
}) {
  const cores = {
    red: { card: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700', item: 'text-red-600', hover: 'hover:text-red-800' },
    amber: { card: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700', item: 'text-amber-600', hover: 'hover:text-amber-800' },
  }
  const c = cores[cor]
  return (
    <section className={`border rounded-xl p-5 ${c.card}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800 text-sm">{titulo}</h3>
        {itens.length > 0 && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{itens.length}</span>}
      </div>
      <p className="text-xs text-slate-500 mb-3">{descricao}</p>

      <div className="space-y-2 mb-3">
        {itens.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum item adicionado.</p>}
        {itens.map((item, i) => (
          <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-white/50">
            <span className={`text-sm mt-0.5 ${c.item}`}>•</span>
            <span className="text-sm text-slate-700 flex-1">{item}</span>
            <button onClick={() => onRemover(i)} className="text-slate-300 hover:text-red-400 text-xs flex-shrink-0">✕</button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <textarea
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-400 resize-none h-14 bg-white"
          value={novoItem}
          onChange={(e) => onNovoChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAdicionar() } }}
        />
        <button onClick={onAdicionar} className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-slate-700 self-end">
          +
        </button>
      </div>
    </section>
  )
}
