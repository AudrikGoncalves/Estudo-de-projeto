'use client'

import { useStore } from '@/lib/store'
import dynamic from 'next/dynamic'

const MapaTerreno = dynamic(() => import('@/components/analise/MapaTerreno'), { ssr: false, loading: () => <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">Carregando mapa...</div> })

const CHECKLIST_ENTORNO = [
  'Edificações lindeiras (gabarito, uso)',
  'Ruídos e fontes de poluição',
  'Vistas privilegiadas',
  'Vistas indesejadas',
  'Infraestrutura urbana (água, esgoto, energia)',
  'Transporte público próximo',
  'Equipamentos urbanos (escola, hospital, parque)',
]

export default function TerrenoPage() {
  const { projetoAtivo, atualizarAnalise, modo } = useStore()

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const { terreno } = projetoAtivo.analise
  const t = terreno

  function update(campo: string, valor: string | number) {
    atualizarAnalise({ terreno: { ...t, [campo]: valor } })
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Análise do Terreno</h2>
        {modo === 'didatico' && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>① Análise — Terreno</strong><br />
            Levante dimensões, topografia, orientação solar, ventos dominantes, edificações lindeiras, acessos, vegetação e corpos d&apos;água. Esses dados condicionam diretamente o partido arquitetônico.
          </div>
        )}
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <h3 className="font-semibold text-slate-800 mb-4">Localização</h3>
        <Campo label="Endereço / Descrição">
          <input className={INPUT} value={t.endereco} onChange={(e) => update('endereco', e.target.value)} placeholder="Rua, número, bairro, cidade..." />
        </Campo>
        <p className="text-xs text-slate-400 mt-2">
          Use o mapa abaixo para localizar e desenhar o polígono do lote.
        </p>
        <div className="mt-3">
          <MapaTerreno />
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Dimensões e Topografia</h3>
          <div className="space-y-3">
            <Campo label="Área total (m²)">
              <input type="number" className={INPUT} value={t.areaTotal || ''} onChange={(e) => update('areaTotal', parseFloat(e.target.value) || 0)} placeholder="0" />
            </Campo>
            <Campo label="Topografia">
              <select className={INPUT} value={t.topografia} onChange={(e) => update('topografia', e.target.value)}>
                <option value="plano">Plano</option>
                <option value="aclive">Aclive</option>
                <option value="declive">Declive</option>
              </select>
            </Campo>
            {t.topografia !== 'plano' && (
              <Campo label="Inclinação (%)">
                <input type="number" className={INPUT} value={t.inclinacao || ''} onChange={(e) => update('inclinacao', parseFloat(e.target.value) || 0)} />
              </Campo>
            )}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Orientação Solar e Vento</h3>
          <div className="space-y-3">
            <Campo label="Orientação Norte (°) — 0=Topo, 90=Direita">
              <input type="number" min="0" max="360" className={INPUT} value={t.orientacaoNorte || 0} onChange={(e) => update('orientacaoNorte', parseFloat(e.target.value) || 0)} />
            </Campo>
            <Campo label="Vento dominante (°) — 0=Norte, 90=Leste">
              <input type="number" min="0" max="360" className={INPUT} value={t.ventoDominante ?? ''} onChange={(e) => update('ventoDominante', parseFloat(e.target.value) || 0)} />
            </Campo>
          </div>
          <BussolaSimples norte={t.orientacaoNorte} vento={t.ventoDominante} />
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Características Naturais</h3>
          <div className="space-y-3">
            <Campo label="Vegetação existente">
              <textarea className={`${INPUT} h-16 resize-none`} value={t.vegetacao} onChange={(e) => update('vegetacao', e.target.value)} placeholder="Árvores, gramado, mata..." />
            </Campo>
            <Campo label="Corpos d'água">
              <textarea className={`${INPUT} h-16 resize-none`} value={t.corposDAqua} onChange={(e) => update('corposDAqua', e.target.value)} placeholder="Rios, nascentes, alagamentos..." />
            </Campo>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Entorno e Acessos</h3>
          <div className="space-y-3">
            <Campo label="Entorno imediato">
              <textarea className={`${INPUT} h-16 resize-none`} value={t.entornoImediato} onChange={(e) => update('entornoImediato', e.target.value)} placeholder="Tipo de ocupação, gabaritos vizinhos..." />
            </Campo>
            <Campo label="Acessos">
              <textarea className={`${INPUT} h-16 resize-none`} value={t.acessos} onChange={(e) => update('acessos', e.target.value)} placeholder="Ruas, larguras, sentidos, pedestre/veicular..." />
            </Campo>
          </div>
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-5 mt-4">
        <h3 className="font-semibold text-slate-800 mb-3">Checklist de Levantamento do Entorno</h3>
        <div className="grid md:grid-cols-2 gap-1">
          {CHECKLIST_ENTORNO.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm text-slate-600 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-blue-600" />
              {item}
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}

const INPUT = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500'

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

function BussolaSimples({ norte, vento }: { norte: number; vento?: number }) {
  const norteRad = (norte * Math.PI) / 180
  const nx = 40 + 28 * Math.sin(norteRad)
  const ny = 40 - 28 * Math.cos(norteRad)

  return (
    <div className="mt-3 flex justify-center">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
        <text x="40" y="10" textAnchor="middle" fontSize="8" fill="#64748b">N</text>
        <text x="40" y="75" textAnchor="middle" fontSize="8" fill="#64748b">S</text>
        <text x="8" y="43" textAnchor="middle" fontSize="8" fill="#64748b">O</text>
        <text x="72" y="43" textAnchor="middle" fontSize="8" fill="#64748b">L</text>
        <line x1="40" y1="40" x2={nx} y2={ny} stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
        <circle cx={nx} cy={ny} r="3" fill="#1d4ed8" />
        {vento !== undefined && (
          <>
            <line
              x1="40" y1="40"
              x2={40 + 22 * Math.sin((vento * Math.PI) / 180)}
              y2={40 - 22 * Math.cos((vento * Math.PI) / 180)}
              stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3,2" strokeLinecap="round"
            />
          </>
        )}
        <circle cx="40" cy="40" r="3" fill="#475569" />
      </svg>
    </div>
  )
}
