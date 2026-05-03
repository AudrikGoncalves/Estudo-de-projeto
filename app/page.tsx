import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">EP</span>
            </div>
            <span className="font-semibold text-slate-900">Estudo de Projeto</span>
          </div>
          <Link
            href="/projetos"
            className="text-sm text-blue-700 hover:text-blue-800 font-medium"
          >
            Meus Projetos →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-blue-100">
            <span>Metodologia Análise → Síntese → Avaliação</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Estruture seu Estudo Preliminar com metodologia
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Ferramenta guiada para arquitetos e estudantes conduzirem o EP da coleta de condicionantes ao partido arquitetônico, produzindo um relatório consolidado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/projetos/novo"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors"
            >
              Iniciar Novo Projeto
            </Link>
            <Link
              href="/projetos"
              className="bg-white text-slate-700 px-8 py-3 rounded-lg font-semibold text-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Ver Meus Projetos
            </Link>
          </div>
        </div>
      </section>

      {/* Fases */}
      <section className="bg-white border-t border-slate-200 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Três fases da metodologia
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FaseCard
              numero="①"
              titulo="Análise"
              cor="blue"
              itens={['Briefing e programa de necessidades', 'Levantamento do terreno', 'Condicionantes legais (CA, TO, recuos)', 'Referências projetuais']}
            />
            <FaseCard
              numero="②"
              titulo="Síntese"
              cor="orange"
              itens={['Partido arquitetônico e conceito', 'Fluxograma e setorização', 'Implantação e carta solar', 'Pré-dimensionamento']}
            />
            <FaseCard
              numero="③"
              titulo="Avaliação"
              cor="green"
              itens={['Checklist de conformidade (NBR 9050)', 'Conflitos funcionais', 'Pontos em aberto', 'Próximos passos para o anteprojeto']}
            />
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 text-sm text-center py-6">
        Estudo de Projeto — Ferramenta de apoio ao Estudo Preliminar Arquitetônico
      </footer>
    </main>
  )
}

function FaseCard({
  numero,
  titulo,
  cor,
  itens,
}: {
  numero: string
  titulo: string
  cor: 'blue' | 'orange' | 'green'
  itens: string[]
}) {
  const cores = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', titulo: 'text-blue-800', numero: 'text-blue-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', titulo: 'text-orange-800', numero: 'text-orange-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', titulo: 'text-green-800', numero: 'text-green-600' },
  }
  const c = cores[cor]
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-6`}>
      <div className={`text-3xl font-bold ${c.numero} mb-2`}>{numero}</div>
      <h3 className={`text-lg font-bold ${c.titulo} mb-4`}>{titulo}</h3>
      <ul className="space-y-2">
        {itens.map((item) => (
          <li key={item} className="flex items-start gap-2 text-slate-600 text-sm">
            <span className="mt-1 text-slate-400">—</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
