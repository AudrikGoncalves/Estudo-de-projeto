'use client'

import { useStore } from '@/lib/store'

const CHECKLIST = [
  { key: 'programa', label: 'O programa foi atendido integralmente?' },
  { key: 'recuos', label: 'Os recuos e índices urbanísticos estão respeitados?' },
  { key: 'acessibilidade', label: 'A acessibilidade foi considerada (NBR 9050)?' },
  { key: 'solar', label: 'A orientação solar e ventilação natural foram aproveitadas?' },
  { key: 'conceito', label: 'O conceito está coerente com a forma proposta?' },
  { key: 'fluxos', label: 'Os fluxos e setores estão funcionando bem?' },
  { key: 'cliente', label: 'O cliente/usuário foi considerado nas decisões?' },
  { key: 'topografia', label: 'A topografia do terreno foi considerada na implantação?' },
  { key: 'referencias', label: 'As referências projetuais foram assimiladas?' },
  { key: 'legislacao', label: 'Toda a legislação pertinente foi verificada?' },
  { key: 'bioclimatico', label: 'As estratégias bioclimáticas da zona foram consideradas?' },
]

export default function ChecklistPage() {
  const { projetoAtivo, atualizarAvaliacao, modo } = useStore()

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const { checklistConformidade } = projetoAtivo.avaliacao

  function toggle(key: string) {
    atualizarAvaliacao({
      checklistConformidade: { ...checklistConformidade, [key]: !checklistConformidade[key] },
    })
  }

  const concluidos = Object.values(checklistConformidade).filter(Boolean).length

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Checklist de Conformidade</h2>
        {modo === 'didatico' && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            <strong>③ Avaliação — Checklist</strong><br />
            Revise criticamente o estudo antes de avançar para o anteprojeto. Cada item não verificado é uma decisão que precisa ser tomada ou revisada.
          </div>
        )}
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Itens de conformidade</h3>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${concluidos === CHECKLIST.length ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
            {concluidos}/{CHECKLIST.length}
          </span>
        </div>

        {concluidos === CHECKLIST.length && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">✅ Todos os itens verificados! O EP está pronto para avançar ao anteprojeto.</p>
          </div>
        )}

        <div className="space-y-2">
          {CHECKLIST.map((item) => (
            <label
              key={item.key}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${checklistConformidade[item.key] ? 'bg-green-50 border border-green-200' : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <input
                type="checkbox"
                checked={!!checklistConformidade[item.key]}
                onChange={() => toggle(item.key)}
                className="w-5 h-5 mt-0.5 rounded accent-green-600 flex-shrink-0"
              />
              <span className={`text-sm ${checklistConformidade[item.key] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}
