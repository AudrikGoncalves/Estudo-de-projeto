'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Referencia } from '@/lib/tipos'

export default function ReferenciasPage() {
  const { projetoAtivo, atualizarAnalise, modo } = useStore()
  const [editando, setEditando] = useState<string | null>(null)
  const [nova, setNova] = useState(false)
  const [form, setForm] = useState<Omit<Referencia, 'id'>>({
    titulo: '', arquiteto: '', ano: new Date().getFullYear(), url: '', principiosAplicaveis: '',
  })

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const { referencias } = projetoAtivo.analise

  function salvar() {
    if (!form.titulo.trim()) return
    const novaRef: Referencia = { id: `ref-${Date.now()}`, ...form }
    atualizarAnalise({ referencias: [...referencias, novaRef] })
    resetForm()
  }

  function atualizar(id: string) {
    atualizarAnalise({
      referencias: referencias.map((r) => (r.id === id ? { id, ...form } : r)),
    })
    resetForm()
  }

  function remover(id: string) {
    atualizarAnalise({ referencias: referencias.filter((r) => r.id !== id) })
  }

  function editarRef(ref: Referencia) {
    setForm({ titulo: ref.titulo, arquiteto: ref.arquiteto, ano: ref.ano, url: ref.url, principiosAplicaveis: ref.principiosAplicaveis })
    setEditando(ref.id)
    setNova(false)
  }

  function resetForm() {
    setForm({ titulo: '', arquiteto: '', ano: new Date().getFullYear(), url: '', principiosAplicaveis: '' })
    setEditando(null)
    setNova(false)
  }

  const mostrando = nova || editando !== null

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Referências Projetuais</h2>
          {modo === 'didatico' && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>① Análise — Referências</strong><br />
              Identifique projetos de referência pertinentes ao programa. Extraia princípios formais, funcionais e técnicos que podem ser aplicados ao seu projeto.
            </div>
          )}
        </div>
        {!mostrando && (
          <button
            onClick={() => setNova(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 ml-4 flex-shrink-0"
          >
            + Adicionar
          </button>
        )}
      </div>

      {mostrando && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">
            {editando ? 'Editar referência' : 'Nova referência'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Título do projeto *</label>
              <input className={INPUT} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Villa Savoye, Escola de Ensino Médio..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Arquiteto(a) / Escritório</label>
              <input className={INPUT} value={form.arquiteto} onChange={(e) => setForm({ ...form, arquiteto: e.target.value })} placeholder="Le Corbusier, Lina Bo Bardi..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Ano</label>
              <input type="number" className={INPUT} value={form.ano} onChange={(e) => setForm({ ...form, ano: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">URL (opcional)</label>
              <input className={INPUT} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Princípios aplicáveis ao meu projeto</label>
              <textarea className={`${INPUT} h-20 resize-none`} value={form.principiosAplicaveis} onChange={(e) => setForm({ ...form, principiosAplicaveis: e.target.value })} placeholder="O que posso extrair dessa referência? Circulação central, integração com paisagem, planta livre..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => editando ? atualizar(editando) : salvar()}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
            >
              {editando ? 'Salvar alterações' : 'Adicionar'}
            </button>
            <button onClick={resetForm} className="text-slate-500 px-4 py-2 rounded-lg text-sm hover:bg-slate-100">Cancelar</button>
          </div>
        </div>
      )}

      {referencias.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-3">📚</div>
          <p>Nenhuma referência adicionada ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {referencias.map((ref) => (
            <div key={ref.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{ref.titulo}</h3>
                  <p className="text-sm text-slate-500">
                    {ref.arquiteto && <>{ref.arquiteto} · </>}{ref.ano}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editarRef(ref)} className="text-xs text-blue-600 hover:text-blue-800">Editar</button>
                  <button onClick={() => remover(ref.id)} className="text-xs text-red-400 hover:text-red-600">Remover</button>
                </div>
              </div>
              {ref.url && (
                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline block mb-2 truncate">
                  {ref.url}
                </a>
              )}
              {ref.principiosAplicaveis && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-amber-700 mb-1">Princípios aplicáveis:</p>
                  <p className="text-sm text-amber-800">{ref.principiosAplicaveis}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const INPUT = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
