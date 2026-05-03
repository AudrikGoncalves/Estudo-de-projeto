'use client'

import { useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'

const NAV = [
  {
    fase: 'analise',
    label: '① Análise',
    cor: 'blue',
    itens: [
      { href: 'analise/briefing', label: 'Briefing / Programa' },
      { href: 'analise/terreno', label: 'Terreno' },
      { href: 'analise/condicionantes', label: 'Condicionantes Legais' },
      { href: 'analise/referencias', label: 'Referências' },
    ],
  },
  {
    fase: 'sintese',
    label: '② Síntese',
    cor: 'orange',
    itens: [
      { href: 'sintese/partido', label: 'Partido Arquitetônico' },
      { href: 'sintese/fluxograma', label: 'Fluxograma / Setorização' },
      { href: 'sintese/implantacao', label: 'Implantação' },
      { href: 'sintese/predimensionamento', label: 'Pré-dimensionamento' },
    ],
  },
  {
    fase: 'avaliacao',
    label: '③ Avaliação',
    cor: 'green',
    itens: [
      { href: 'avaliacao/checklist', label: 'Checklist de Conformidade' },
      { href: 'avaliacao/conflitos', label: 'Conflitos / Pontos de Atenção' },
      { href: 'avaliacao/proximos-passos', label: 'Próximos Passos' },
    ],
  },
]

const COR_MAP: Record<string, { ativo: string; hover: string; grupo: string }> = {
  blue: { ativo: 'bg-blue-100 text-blue-800 font-medium', hover: 'hover:bg-blue-50 text-slate-600', grupo: 'text-blue-700' },
  orange: { ativo: 'bg-orange-100 text-orange-800 font-medium', hover: 'hover:bg-orange-50 text-slate-600', grupo: 'text-orange-700' },
  green: { ativo: 'bg-green-100 text-green-800 font-medium', hover: 'hover:bg-green-50 text-slate-600', grupo: 'text-green-700' },
}

export default function ProjetoLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>()
  const pathname = usePathname()
  const { projetoAtivo, carregarProjeto, modo, setModo } = useStore()

  useEffect(() => {
    if (params.id) carregarProjeto(params.id)
  }, [params.id, carregarProjeto])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/projetos" className="text-slate-400 hover:text-slate-600">
            <span className="text-sm">← Projetos</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-900 truncate max-w-40">
            {projetoAtivo?.nome ?? '...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModo(modo === 'didatico' ? 'profissional' : 'didatico')}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              modo === 'didatico'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            {modo === 'didatico' ? '📖 Didático' : '⚡ Profissional'}
          </button>
          <Link
            href={`/projetos/${params.id}/relatorio`}
            className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-full font-medium hover:bg-slate-700"
          >
            Relatório
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-slate-200 flex-shrink-0 hidden md:block">
          <nav className="py-4 px-2">
            {NAV.map((grupo) => {
              const c = COR_MAP[grupo.cor]
              return (
                <div key={grupo.fase} className="mb-4">
                  <p className={`text-xs font-bold px-3 py-1 uppercase tracking-wide ${c.grupo}`}>
                    {grupo.label}
                  </p>
                  {grupo.itens.map((item) => {
                    const href = `/projetos/${params.id}/${item.href}`
                    const ativo = pathname === href
                    return (
                      <Link
                        key={item.href}
                        href={href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors my-0.5 ${
                          ativo ? c.ativo : `${c.hover} text-slate-600`
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
