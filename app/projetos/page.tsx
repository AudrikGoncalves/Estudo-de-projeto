'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import db from '@/lib/db'
import type { Projeto } from '@/lib/tipos'
import { TIPOLOGIAS } from '@/lib/tipos'

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([])

  useEffect(() => {
    db.projetos.orderBy('atualizadoEm').reverse().toArray().then(setProjetos)
  }, [])

  async function excluir(id: string) {
    if (!confirm('Excluir este projeto?')) return
    await db.projetos.delete(id)
    setProjetos((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">EP</span>
            </div>
            <span className="font-semibold text-slate-900">Estudo de Projeto</span>
          </Link>
          <Link
            href="/projetos/novo"
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            + Novo Projeto
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Meus Projetos</h1>

        {projetos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📐</div>
            <p className="text-slate-500 mb-6">Nenhum projeto ainda.</p>
            <Link
              href="/projetos/novo"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              Criar primeiro projeto
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projetos.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 truncate">{p.nome}</h3>
                    <p className="text-sm text-slate-500">{TIPOLOGIAS[p.tipologia]}</p>
                  </div>
                  <FaseBadge fase={p.faseAtual} />
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  {p.cidade} · Atualizado em {new Date(p.atualizadoEm).toLocaleDateString('pt-BR')}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/projetos/${p.id}`}
                    className="flex-1 bg-blue-700 text-white text-sm font-medium text-center py-2 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Abrir
                  </Link>
                  <button
                    onClick={() => excluir(p.id)}
                    className="px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function FaseBadge({ fase }: { fase: string }) {
  const config = {
    analise: { label: 'Análise', bg: 'bg-blue-100 text-blue-700' },
    sintese: { label: 'Síntese', bg: 'bg-orange-100 text-orange-700' },
    avaliacao: { label: 'Avaliação', bg: 'bg-green-100 text-green-700' },
  }
  const c = config[fase as keyof typeof config] ?? { label: fase, bg: 'bg-slate-100 text-slate-700' }
  return <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.bg}`}>{c.label}</span>
}
