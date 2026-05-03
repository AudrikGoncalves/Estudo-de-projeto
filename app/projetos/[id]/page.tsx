'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { TIPOLOGIAS } from '@/lib/tipos'

export default function ProjetoOverview() {
  const params = useParams<{ id: string }>()
  const { projetoAtivo } = useStore()

  if (!projetoAtivo) return <div className="p-8 text-slate-400">Carregando...</div>

  const id = params.id
  const totalAmbientes = projetoAtivo.analise.briefing.ambientes.length
  const areaPrograma = projetoAtivo.analise.briefing.ambientes.reduce(
    (s, a) => s + a.areaMinima * a.quantidade, 0
  )

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{projetoAtivo.nome}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {TIPOLOGIAS[projetoAtivo.tipologia]} · {projetoAtivo.cidade} ·{' '}
          Criado em {new Date(projetoAtivo.criadoEm).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <InfoCard titulo="Ambientes" valor={totalAmbientes > 0 ? `${totalAmbientes} ambientes` : 'Não definido'} sub={areaPrograma > 0 ? `${areaPrograma.toFixed(0)} m² estimados` : ''} />
        <InfoCard titulo="Terreno" valor={projetoAtivo.analise.terreno.areaTotal > 0 ? `${projetoAtivo.analise.terreno.areaTotal.toFixed(0)} m²` : 'Não definido'} sub={projetoAtivo.analise.terreno.endereco || ''} />
        <InfoCard titulo="Fase atual" valor={projetoAtivo.faseAtual === 'analise' ? '① Análise' : projetoAtivo.faseAtual === 'sintese' ? '② Síntese' : '③ Avaliação'} sub="" />
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-4">Próximos módulos</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <ModuloLink href={`/projetos/${id}/analise/briefing`} label="Briefing / Programa de Necessidades" fase="Análise" cor="blue" />
        <ModuloLink href={`/projetos/${id}/analise/terreno`} label="Análise do Terreno" fase="Análise" cor="blue" />
        <ModuloLink href={`/projetos/${id}/analise/condicionantes`} label="Condicionantes Legais" fase="Análise" cor="blue" />
        <ModuloLink href={`/projetos/${id}/sintese/partido`} label="Partido Arquitetônico" fase="Síntese" cor="orange" />
        <ModuloLink href={`/projetos/${id}/sintese/fluxograma`} label="Fluxograma e Setorização" fase="Síntese" cor="orange" />
        <ModuloLink href={`/projetos/${id}/avaliacao/checklist`} label="Checklist de Conformidade" fase="Avaliação" cor="green" />
      </div>
    </div>
  )
}

function InfoCard({ titulo, valor, sub }: { titulo: string; valor: string; sub: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">{titulo}</p>
      <p className="font-semibold text-slate-900">{valor}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
    </div>
  )
}

function ModuloLink({
  href, label, fase, cor,
}: { href: string; label: string; fase: string; cor: 'blue' | 'orange' | 'green' }) {
  const cores = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
    orange: 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100',
    green: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100',
  }
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-4 py-3 border rounded-lg transition-colors ${cores[cor]}`}
    >
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wide opacity-60">{fase}</span>
        <p className="text-sm font-medium">{label}</p>
      </div>
      <span className="text-lg">→</span>
    </Link>
  )
}
