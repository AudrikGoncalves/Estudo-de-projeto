'use client'

import { useStore } from '@/lib/store'
import { TIPOLOGIAS, SETORES } from '@/lib/tipos'

export default function RelatorioPage() {
  const { projetoAtivo } = useStore()

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const p = projetoAtivo
  const areaPrograma = p.analise.briefing.ambientes.reduce((s, a) => s + a.areaMinima * a.quantidade, 0)

  function imprimir() {
    window.print()
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Relatório do Estudo Preliminar</h2>
        <button
          onClick={imprimir}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 print:hidden"
        >
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Capa */}
      <section className="bg-blue-700 text-white rounded-xl p-8 mb-6">
        <p className="text-blue-200 text-sm font-medium uppercase tracking-wide mb-2">Estudo Preliminar</p>
        <h1 className="text-3xl font-bold mb-2">{p.nome}</h1>
        <p className="text-blue-200">{TIPOLOGIAS[p.tipologia]} · {p.cidade}</p>
        <p className="text-blue-300 text-sm mt-2">Elaborado em {new Date(p.criadoEm).toLocaleDateString('pt-BR')}</p>
      </section>

      {/* ① Análise */}
      <SecaoRelatorio titulo="① Análise" cor="blue">
        <SubSecao titulo="Briefing e Programa de Necessidades">
          {p.analise.briefing.cliente && <InfoRow label="Cliente" valor={p.analise.briefing.cliente} />}
          {p.analise.briefing.usuarios && <InfoRow label="Usuários" valor={p.analise.briefing.usuarios} />}
          {p.analise.briefing.atividades && <InfoRow label="Atividades" valor={p.analise.briefing.atividades} />}
          {p.analise.briefing.prioridades && <InfoRow label="Prioridades" valor={p.analise.briefing.prioridades} />}

          {p.analise.briefing.ambientes.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Programa de ambientes</p>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 text-left">
                  <th className="py-1 font-medium text-slate-600">Ambiente</th>
                  <th className="py-1 font-medium text-slate-600">Setor</th>
                  <th className="py-1 font-medium text-slate-600 text-right">Qtd.</th>
                  <th className="py-1 font-medium text-slate-600 text-right">Área mín.</th>
                </tr></thead>
                <tbody>
                  {p.analise.briefing.ambientes.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="py-1">{a.nome}</td>
                      <td className="py-1">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: SETORES[a.setor].cor + '22', color: SETORES[a.setor].cor }}>
                          {SETORES[a.setor].label}
                        </span>
                      </td>
                      <td className="py-1 text-right">{a.quantidade}</td>
                      <td className="py-1 text-right">{(a.areaMinima * a.quantidade).toFixed(0)} m²</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="border-t-2 border-slate-300">
                  <td colSpan={3} className="py-1 font-semibold">Total</td>
                  <td className="py-1 text-right font-bold">{areaPrograma.toFixed(0)} m²</td>
                </tr></tfoot>
              </table>
            </div>
          )}
        </SubSecao>

        <SubSecao titulo="Análise do Terreno">
          {p.analise.terreno.endereco && <InfoRow label="Endereço" valor={p.analise.terreno.endereco} />}
          {p.analise.terreno.areaTotal > 0 && <InfoRow label="Área total" valor={`${p.analise.terreno.areaTotal.toFixed(0)} m²`} />}
          <InfoRow label="Topografia" valor={p.analise.terreno.topografia} />
          {p.analise.terreno.orientacaoNorte !== undefined && <InfoRow label="Orientação Norte" valor={`${p.analise.terreno.orientacaoNorte}°`} />}
          {p.analise.terreno.entornoImediato && <InfoRow label="Entorno" valor={p.analise.terreno.entornoImediato} />}
          {p.analise.terreno.acessos && <InfoRow label="Acessos" valor={p.analise.terreno.acessos} />}
        </SubSecao>

        <SubSecao titulo="Condicionantes Legais">
          {p.analise.condicionantes.zona && <InfoRow label="Zona" valor={p.analise.condicionantes.zona} />}
          {p.analise.condicionantes.coefAproveitamentoMaximo > 0 && (
            <>
              <InfoRow label="CA Básico/Máximo" valor={`${p.analise.condicionantes.coefAproveitamentoBasico} / ${p.analise.condicionantes.coefAproveitamentoMaximo}`} />
              <InfoRow label="Taxa de Ocupação" valor={`${(p.analise.condicionantes.taxaOcupacao * 100).toFixed(0)}%`} />
              <InfoRow label="Taxa de Permeabilidade" valor={`${(p.analise.condicionantes.taxaPermeabilidade * 100).toFixed(0)}%`} />
              <InfoRow label="Recuos (frente/lateral/fundos)" valor={`${p.analise.condicionantes.recuos.frontal}m / ${p.analise.condicionantes.recuos.lateral}m / ${p.analise.condicionantes.recuos.fundos}m`} />
            </>
          )}
        </SubSecao>

        {p.analise.referencias.length > 0 && (
          <SubSecao titulo="Referências Projetuais">
            {p.analise.referencias.map((r) => (
              <div key={r.id} className="mb-2">
                <p className="font-medium text-sm">{r.titulo} ({r.arquiteto}, {r.ano})</p>
                {r.principiosAplicaveis && <p className="text-sm text-slate-500 mt-0.5">{r.principiosAplicaveis}</p>}
              </div>
            ))}
          </SubSecao>
        )}
      </SecaoRelatorio>

      {/* ② Síntese */}
      <SecaoRelatorio titulo="② Síntese" cor="orange">
        {p.sintese.partido.conceitoGerador && (
          <SubSecao titulo="Partido Arquitetônico">
            {p.sintese.partido.conceitoGerador && <InfoRow label="Conceito gerador" valor={p.sintese.partido.conceitoGerador} />}
            {p.sintese.partido.intencoesProjetuais && <InfoRow label="Intenções projetuais" valor={p.sintese.partido.intencoesProjetuais} />}
            {p.sintese.partido.estrategias && <InfoRow label="Estratégias" valor={p.sintese.partido.estrategias} />}
            {p.sintese.partido.relacaoComLugar && <InfoRow label="Relação com o lugar" valor={p.sintese.partido.relacaoComLugar} />}
          </SubSecao>
        )}

        {(p.sintese.implantacao.posicionamento || p.sintese.implantacao.aproveitamentoSolar) && (
          <SubSecao titulo="Implantação">
            {p.sintese.implantacao.posicionamento && <InfoRow label="Posicionamento" valor={p.sintese.implantacao.posicionamento} />}
            {p.sintese.implantacao.aproveitamentoSolar && <InfoRow label="Insolação e ventilação" valor={p.sintese.implantacao.aproveitamentoSolar} />}
            {p.sintese.implantacao.areasLivres && <InfoRow label="Áreas livres" valor={p.sintese.implantacao.areasLivres} />}
          </SubSecao>
        )}

        {p.sintese.preDimensionamento.areaConstruidaEstimada > 0 && (
          <SubSecao titulo="Pré-dimensionamento">
            <InfoRow label="Área estimada" valor={`${p.sintese.preDimensionamento.areaConstruidaEstimada.toFixed(0)} m²`} />
            <InfoRow label="Área máxima legal" valor={`${p.sintese.preDimensionamento.areaMaximaLegal.toFixed(0)} m²`} />
            <InfoRow label="Pavimentos previstos" valor={p.sintese.preDimensionamento.pavimentos.toString()} />
          </SubSecao>
        )}
      </SecaoRelatorio>

      {/* ③ Avaliação */}
      <SecaoRelatorio titulo="③ Avaliação" cor="green">
        <SubSecao titulo="Checklist de Conformidade">
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(p.avaliacao.checklistConformidade).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span>{val ? '✅' : '⬜'}</span>
                <span className={val ? 'text-green-700' : 'text-slate-500'}>{key}</span>
              </div>
            ))}
          </div>
        </SubSecao>

        {p.avaliacao.conflitos.length > 0 && (
          <SubSecao titulo="Conflitos e Pontos de Atenção">
            <ul className="space-y-1">
              {p.avaliacao.conflitos.map((c, i) => <li key={i} className="text-sm text-slate-700">⚠️ {c}</li>)}
            </ul>
          </SubSecao>
        )}

        {p.avaliacao.proximosPassos.length > 0 && (
          <SubSecao titulo="Próximos Passos">
            <ol className="space-y-1 list-decimal list-inside">
              {p.avaliacao.proximosPassos.map((passo, i) => (
                <li key={i} className="text-sm text-slate-700">{passo}</li>
              ))}
            </ol>
          </SubSecao>
        )}
      </SecaoRelatorio>
    </div>
  )
}

function SecaoRelatorio({ titulo, cor, children }: { titulo: string; cor: 'blue' | 'orange' | 'green'; children: React.ReactNode }) {
  const cores = { blue: 'border-blue-300 bg-blue-700', orange: 'border-orange-300 bg-orange-600', green: 'border-green-300 bg-green-700' }
  return (
    <section className="border border-slate-200 rounded-xl overflow-hidden mb-6">
      <div className={`${cores[cor]} text-white px-5 py-3`}>
        <h2 className="font-bold text-base">{titulo}</h2>
      </div>
      <div className="p-5 space-y-5 bg-white">{children}</div>
    </section>
  )
}

function SubSecao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-700 text-sm mb-2 pb-1 border-b border-slate-100">{titulo}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function InfoRow({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-400 min-w-36 flex-shrink-0">{label}:</span>
      <span className="text-slate-700 whitespace-pre-wrap">{valor}</span>
    </div>
  )
}
