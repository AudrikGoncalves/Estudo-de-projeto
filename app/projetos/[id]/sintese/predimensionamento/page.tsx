'use client'

import { useStore } from '@/lib/store'
import { calcularIndices } from '@/lib/calculos/indices-urbanisticos'

export default function PreDimensionamentoPage() {
  const { projetoAtivo, atualizarSintese, modo } = useStore()

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const { preDimensionamento } = projetoAtivo.sintese
  const { terreno, condicionantes, briefing } = projetoAtivo.analise
  const pd = preDimensionamento

  function update(campo: string, valor: number | string) {
    atualizarSintese({ preDimensionamento: { ...pd, [campo]: valor } })
  }

  const areaPrograma = briefing.ambientes.reduce((s, a) => s + a.areaMinima * a.quantidade, 0)
  const resultado =
    terreno.areaTotal > 0 && condicionantes.coefAproveitamentoMaximo > 0
      ? calcularIndices({
          areaTerreno: terreno.areaTotal,
          ca: condicionantes.coefAproveitamentoMaximo,
          to: condicionantes.taxaOcupacao,
          tp: condicionantes.taxaPermeabilidade,
          areaPrograma,
          pavimentos: pd.pavimentos || 1,
        })
      : null

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Pré-dimensionamento</h2>
        {modo === 'didatico' && (
          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
            <strong>② Síntese — Pré-dimensionamento</strong><br />
            Verifique a viabilidade legal do programa em relação ao terreno. Se a área do programa exceder os índices permitidos, ajuste o número de pavimentos ou reduza ambientes.
          </div>
        )}
      </div>

      {resultado && resultado.alertas.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl space-y-1">
          {resultado.alertas.map((a, i) => <p key={i} className="text-sm text-red-700">⚠️ {a}</p>)}
        </div>
      )}
      {resultado && resultado.viabilLegal && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-700 font-medium">✅ Programa compatível com os índices urbanísticos.</p>
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <h3 className="font-semibold text-slate-800 mb-4">Parâmetros do Estudo</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Área construída estimada (m²)</label>
            <input type="number" className={INPUT} value={pd.areaConstruidaEstimada || areaPrograma || ''} onChange={(e) => update('areaConstruidaEstimada', parseFloat(e.target.value) || 0)} />
            {areaPrograma > 0 && <p className="text-xs text-slate-400 mt-1">Programa: {areaPrograma.toFixed(0)} m²</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Número de pavimentos</label>
            <input type="number" min={1} className={INPUT} value={pd.pavimentos || 1} onChange={(e) => update('pavimentos', parseInt(e.target.value) || 1)} />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">Observações</label>
          <textarea className={`${INPUT} h-20 resize-none`} value={pd.observacoes} onChange={(e) => update('observacoes', e.target.value)} placeholder="Justificativas de partido, limitações, adaptações..." />
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Comparativo com Índices Legais</h3>
        {!resultado ? (
          <p className="text-sm text-slate-400">Preencha os dados de Terreno e Condicionantes Legais para ver o comparativo.</p>
        ) : (
          <div className="space-y-3">
            <ComparativoRow
              label="Área máxima de construção (CA)"
              permitido={resultado.areaMaximaConstrucao}
              estimado={pd.areaConstruidaEstimada || areaPrograma}
            />
            <ComparativoRow
              label="Área máxima de projeção (TO)"
              permitido={resultado.areaMaximaOcupacao}
              estimado={pd.pavimentos > 1 ? (pd.areaConstruidaEstimada || areaPrograma) / pd.pavimentos : (pd.areaConstruidaEstimada || areaPrograma)}
            />
            <ComparativoRow
              label="Área permeável mínima (TP)"
              permitido={resultado.areaPermeavelMinima}
              estimado={terreno.areaTotal - resultado.areaMaximaOcupacao}
              inverso
            />
            <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
              <InfoSmall titulo="Terreno" valor={`${terreno.areaTotal.toFixed(0)} m²`} />
              <InfoSmall titulo="CA Máx." valor={condicionantes.coefAproveitamentoMaximo.toString()} />
              <InfoSmall titulo="TO" valor={`${(condicionantes.taxaOcupacao * 100).toFixed(0)}%`} />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

const INPUT = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400'

function ComparativoRow({ label, permitido, estimado, inverso = false }: { label: string; permitido: number; estimado: number; inverso?: boolean }) {
  const ok = inverso ? estimado >= permitido : estimado <= permitido
  const pct = permitido > 0 ? Math.min((estimado / permitido) * 100, 150) : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span className={ok ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {estimado.toFixed(0)} / {permitido.toFixed(0)} m²
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${ok ? 'bg-green-400' : 'bg-red-400'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

function InfoSmall({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2">
      <p className="text-xs text-slate-400">{titulo}</p>
      <p className="font-semibold text-slate-800 text-sm">{valor}</p>
    </div>
  )
}
