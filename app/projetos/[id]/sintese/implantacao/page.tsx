'use client'

import dynamic from 'next/dynamic'
import { useStore } from '@/lib/store'
import { getCidadePorNome } from '@/lib/dados/cidades-brasil'
import { getZona } from '@/lib/dados/zonas-bioclimaticas'

const CartaSolar = dynamic(() => import('@/components/sintese/CartaSolar'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">Carregando carta solar...</div>,
})

export default function ImplantacaoPage() {
  const { projetoAtivo, atualizarSintese, modo } = useStore()

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const { implantacao } = projetoAtivo.sintese
  const i = implantacao
  const cidade = getCidadePorNome(projetoAtivo.cidade)
  const zona = cidade ? getZona(cidade.zona) : null

  function update(campo: string, valor: string) {
    atualizarSintese({ implantacao: { ...i, [campo]: valor } })
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Implantação</h2>
        {modo === 'didatico' && (
          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
            <strong>② Síntese — Implantação</strong><br />
            Defina o posicionamento da edificação no lote: aproveite a orientação solar, os ventos dominantes, a topografia e as vistas. A carta solar ao lado mostra as trajetórias solares para a cidade do projeto.
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="space-y-4">
              <CampoTexto label="Posicionamento no lote" valor={i.posicionamento} onChange={(v) => update('posicionamento', v)} placeholder="Onde a edificação se posiciona? Alinhada à rua, recuada, central, compacta, espalhada..." />
              <CampoTexto label="Aproveitamento solar e ventilação" valor={i.aproveitamentoSolar} onChange={(v) => update('aproveitamentoSolar', v)} placeholder="Quais fachadas recebem sol da manhã? Da tarde? Como posicionar as aberturas? Ventilação cruzada viável?" />
              <CampoTexto label="Áreas livres e relação com entorno" valor={i.areasLivres} onChange={(v) => update('areasLivres', v)} placeholder="Jardins, pátios, recuos aproveitados, relação com vizinhos e rua..." />
              <CampoTexto label="Paisagismo" valor={i.paisagismo} onChange={(v) => update('paisagismo', v)} placeholder="Vegetação para sombreamento, permeabilidade, uso das áreas externas..." />
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {zona && (
            <section className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Zona Bioclimática {zona.numero}</h3>
              <p className="text-sm text-slate-600 mb-3">{zona.descricao}</p>
              <p className="text-xs font-medium text-orange-700 mb-2">Estratégias recomendadas:</p>
              <ul className="space-y-1">
                {zona.estrategias.map((e) => (
                  <li key={e} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-orange-400 mt-0.5">•</span> {e}
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  <strong>Orientação recomendada:</strong> {zona.orientacaoFachadaPrincipal}
                </p>
              </div>
            </section>
          )}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 mb-3">
              Carta Solar — {projetoAtivo.cidade}
              {cidade && <span className="text-slate-400 font-normal text-xs ml-1">({cidade.lat.toFixed(1)}°)</span>}
            </h3>
            {cidade ? (
              <CartaSolar lat={cidade.lat} lng={cidade.lng} />
            ) : (
              <p className="text-sm text-slate-400">Cidade não encontrada na base de dados. Defina a cidade ao criar o projeto.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function CampoTexto({ label, valor, onChange, placeholder }: { label: string; valor: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <textarea
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none h-20"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
