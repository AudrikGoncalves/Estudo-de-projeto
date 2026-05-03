'use client'

import { useStore } from '@/lib/store'

export default function PartidoPage() {
  const { projetoAtivo, atualizarSintese, modo } = useStore()

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const { partido } = projetoAtivo.sintese
  const p = partido

  function update(campo: string, valor: string) {
    atualizarSintese({ partido: { ...p, [campo]: valor } })
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Partido Arquitetônico</h2>
        {modo === 'didatico' && (
          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
            <strong>② Síntese — Partido</strong><br />
            O partido é a ideia central que orienta todas as decisões formais e espaciais. Ele emerge da análise: as condicionantes do terreno, o programa, o contexto e as referências se transformam em conceito. Registre aqui a intenção projetual antes de avançar para o fluxograma.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <CampoTexto
            label="Conceito Gerador"
            valor={p.conceitoGerador}
            onChange={(v) => update('conceitoGerador', v)}
            placeholder="A ideia central que origina o projeto. Ex: 'A casa como extensão da paisagem', 'Percurso como elemento organizador'..."
            altura="h-28"
            dica={modo === 'didatico' ? 'O conceito deve ser capaz de justificar todas as decisões de projeto. Evite clichês. Parta dos dados coletados na Análise.' : undefined}
          />
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <CampoTexto
            label="Intenções Projetuais"
            valor={p.intencoesProjetuais}
            onChange={(v) => update('intencoesProjetuais', v)}
            placeholder="Como o conceito se materializa no espaço? Quais decisões decorrem diretamente dele? Ex: Integração visual entre sala e jardim, núcleo de serviços centralizado, fachada leste cega..."
            altura="h-24"
            dica={modo === 'didatico' ? 'Liste as decisões de projeto que derivam diretamente do conceito.' : undefined}
          />
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <CampoTexto
            label="Estratégias de Projeto"
            valor={p.estrategias}
            onChange={(v) => update('estrategias', v)}
            placeholder="Implantação, volumetria, organização espacial, sistema de circulação, materialidade prevista..."
            altura="h-24"
          />
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <CampoTexto
            label="Relação com o Lugar, o Programa e o Cliente"
            valor={p.relacaoComLugar}
            onChange={(v) => update('relacaoComLugar', v)}
            placeholder="Como o partido responde às especificidades do terreno, ao programa levantado e às necessidades do cliente?"
            altura="h-20"
            dica={modo === 'didatico' ? 'O partido deve responder ao lugar (topografia, orientação, entorno), ao programa (setores, fluxos) e ao cliente (perfil, estilo de vida, prioridades).' : undefined}
          />
        </section>
      </div>
    </div>
  )
}

function CampoTexto({
  label, valor, onChange, placeholder, altura, dica,
}: {
  label: string
  valor: string
  onChange: (v: string) => void
  placeholder: string
  altura: string
  dica?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      {dica && <p className="text-xs text-slate-400 mb-2">{dica}</p>}
      <textarea
        className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none ${altura}`}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
