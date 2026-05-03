import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Estudo de Projeto — Metodologia Arquitetônica',
  description: 'Ferramenta de apoio ao Estudo Preliminar arquitetônico: Análise, Síntese e Avaliação.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  )
}
