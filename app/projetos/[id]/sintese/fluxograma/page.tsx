'use client'

import dynamic from 'next/dynamic'

const EditorFluxograma = dynamic(
  () => import('@/components/sintese/EditorFluxograma'),
  { ssr: false, loading: () => <div className="h-96 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">Carregando editor...</div> }
)

export default function FluxogramaPage() {
  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">Fluxograma e Setorização</h2>
      </div>
      <EditorFluxograma />
    </div>
  )
}
