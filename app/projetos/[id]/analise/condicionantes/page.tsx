'use client'

import { useStore } from '@/lib/store'
import { calcularIndices } from '@/lib/calculos/indices-urbanisticos'

const CHECKLIST_ITEMS = [
  { key: 'zona', label: 'Zoneamento municipal verificado (zona, uso permitido)' },
  { key: 'ca', label: 'Coeficiente de Aproveitamento (CA) básico e máximo' },
  { key: 'to', label: 'Taxa de Ocupação (TO)' },
  { key: 'tp', label: 'Taxa de Permeabilidade (TP)' },
  { key: 'recuos', label: 'Recuos obrigatórios (frente, fundos, laterais)' },
  { key: 'gabarito', label: 'Gabarito máximo (pavimentos ou altura)' },
  { key: 'vagas', label: 'Vagas de estacionamento exigidas' },
  { key: 'nbr9050', label: 'NBR 9050 — Acessibilidade (quando aplicável)' },
  { key: 'codigo', label: 'Código de Obras municipal consultado' },
  { key: 'tombamento', label: 'Tombamentos ou restrições patrimoniais verificados' },
]

export default function CondicionantesPage() {
  const { projetoAtivo, atualizarAnalise, modo } = useStore()

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const { condicionantes, briefing, terreno } = projetoAtivo.analise
  const c = condicionantes

  function update(campo: string, valor: string | number | boolean) {
    atualizarAnalise({ condicionantes: { ...c, [campo]: valor } })
  }

  function updateRecuo(lado: string, valor: number) {
    atualizarAnalise({ condicionantes: { ...c, recuos: { ...c.recuos, [lado]: valor } } })
  }

  function toggleChecklist(key: string) {
    atualizarAnalise({
      condicionantes: {
        ...c,
        checklistCompleto: { ...c.checklistCompleto, [key]: !c.checklistCompleto[key] },
      },
    })
  }

  const areaPrograma = briefing.ambientes.reduce((s, a) => s + a.areaMinima * a.quantidade, 0)
  const resultado =
    terreno.areaTotal > 0 && c.coefAproveitamentoMaximo > 0
      ? calcularIndices({
          areaTerreno: terreno.areaTotal,
          ca: c.coefAproveitamentoMaximo,
          to: c.taxaOcupacao,
          tp: c.taxaPermeabilidade,
          areaPrograma,
          pavimentos: projetoAtivo.sintese.preDimensionamento.pavimentos || 1,
        })
      : null

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Condicionantes Legais</h2>
        {modo === 'didatico' && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>① Análise — Condicionantes Legais</strong><br />
            Verifique os índices urbanísticos na Prefeitura ou Portal de Legislação do município. Os dados aqui alimentam o pré-dimensionamento da fase Síntese.
          </div>
        )}
      </div>

      {/* Alertas */}
      {resultado && resultado.alertas.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          {resultado.alertas.map((alerta, i) => (
            <p key={i} className="text-sm text-red-700 font-medium">⚠️ {alerta}</p>
          ))}
        </div>
      )}
      {resultado && resultado.viabilLegal && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-700 font-medium">✅ Programa compatível com os índices urbanísticos informados.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Zoneamento */}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Zoneamento</h3>
          <div className="space-y-3">
            <Campo label="Zona">
              <input className={INPUT} value={c.zona} onChange={(e) => update('zona', e.target.value)} placeholder="Ex: ZR-1, ZM, ZC..." />
            </Campo>
            <Campo label="Uso Permitido">
              <input className={INPUT} value={c.usoPermitido} onChange={(e) => update('usoPermitido', e.target.value)} placeholder="Ex: Residencial, Misto, Comercial..." />
            </Campo>
          </div>
        </section>

        {/* Índices */}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Índices Urbanísticos</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Campo label="CA Básico">
                <input type="number" step="0.1" className={INPUT} value={c.coefAproveitamentoBasico || ''} onChange={(e) => update('coefAproveitamentoBasico', parseFloat(e.target.value) || 0)} />
              </Campo>
              <Campo label="CA Máximo">
                <input type="number" step="0.1" className={INPUT} value={c.coefAproveitamentoMaximo || ''} onChange={(e) => update('coefAproveitamentoMaximo', parseFloat(e.target.value) || 0)} />
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Taxa de Ocupação (%)">
                <input type="number" step="1" min="0" max="100" className={INPUT} value={c.taxaOcupacao ? (c.taxaOcupacao * 100).toFixed(0) : ''} onChange={(e) => update('taxaOcupacao', (parseFloat(e.target.value) || 0) / 100)} />
              </Campo>
              <Campo label="Taxa de Permeabilidade (%)">
                <input type="number" step="1" min="0" max="100" className={INPUT} value={c.taxaPermeabilidade ? (c.taxaPermeabilidade * 100).toFixed(0) : ''} onChange={(e) => update('taxaPermeabilidade', (parseFloat(e.target.value) || 0) / 100)} />
              </Campo>
            </div>
          </div>
        </section>

        {/* Recuos */}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Recuos Obrigatórios (m)</h3>
          <div className="grid grid-cols-3 gap-3">
            <Campo label="Frontal">
              <input type="number" step="0.5" className={INPUT} value={c.recuos.frontal || ''} onChange={(e) => updateRecuo('frontal', parseFloat(e.target.value) || 0)} />
            </Campo>
            <Campo label="Lateral">
              <input type="number" step="0.5" className={INPUT} value={c.recuos.lateral || ''} onChange={(e) => updateRecuo('lateral', parseFloat(e.target.value) || 0)} />
            </Campo>
            <Campo label="Fundos">
              <input type="number" step="0.5" className={INPUT} value={c.recuos.fundos || ''} onChange={(e) => updateRecuo('fundos', parseFloat(e.target.value) || 0)} />
            </Campo>
          </div>
        </section>

        {/* Outros */}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Outros Parâmetros</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Gabarito máx. (m)">
                <input type="number" className={INPUT} value={c.gabaritoAltura || ''} onChange={(e) => update('gabaritoAltura', parseFloat(e.target.value) || 0)} />
              </Campo>
              <Campo label="Vagas exigidas">
                <input type="number" className={INPUT} value={c.vagasExigidas || ''} onChange={(e) => update('vagasExigidas', parseInt(e.target.value) || 0)} />
              </Campo>
            </div>
            <Campo label="Observações">
              <textarea className={`${INPUT} h-16 resize-none`} value={c.observacoes} onChange={(e) => update('observacoes', e.target.value)} />
            </Campo>
          </div>
        </section>
      </div>

      {/* Resumo de cálculos */}
      {resultado && terreno.areaTotal > 0 && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 mt-4">
          <h3 className="font-semibold text-slate-800 mb-4">Resumo de Índices Calculados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <IndiceCard titulo="Área programa" valor={areaPrograma.toFixed(0)} unidade="m²" />
            <IndiceCard titulo="Área máx. construção" valor={resultado.areaMaximaConstrucao.toFixed(0)} unidade="m²" />
            <IndiceCard titulo="Área máx. projeção" valor={resultado.areaMaximaOcupacao.toFixed(0)} unidade="m²" />
            <IndiceCard titulo="Área permeável mín." valor={resultado.areaPermeavelMinima.toFixed(0)} unidade="m²" />
          </div>
        </section>
      )}

      {/* Checklist */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 mt-4">
        <h3 className="font-semibold text-slate-800 mb-4">Checklist de Levantamento</h3>
        <div className="space-y-2">
          {CHECKLIST_ITEMS.map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg">
              <input
                type="checkbox"
                checked={!!c.checklistCompleto[item.key]}
                onChange={() => toggleChecklist(item.key)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className={`text-sm ${c.checklistCompleto[item.key] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          {Object.values(c.checklistCompleto).filter(Boolean).length}/{CHECKLIST_ITEMS.length} itens verificados
        </p>
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

function IndiceCard({ titulo, valor, unidade }: { titulo: string; valor: string; unidade: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-xs text-slate-400 mb-1">{titulo}</p>
      <p className="text-xl font-bold text-slate-900">{valor}</p>
      <p className="text-xs text-slate-400">{unidade}</p>
    </div>
  )
}
