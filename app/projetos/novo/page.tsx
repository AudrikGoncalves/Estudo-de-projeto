'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import db from '@/lib/db'
import { projetoVazio, TIPOLOGIAS, type Tipologia } from '@/lib/tipos'
import { buscarCidade } from '@/lib/dados/cidades-brasil'
import { getCidadePorNome } from '@/lib/dados/cidades-brasil'

export default function NovoProjeto() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [tipologia, setTipologia] = useState<Tipologia>('residencial-unifamiliar')
  const [cidadeInput, setCidadeInput] = useState('')
  const [cidadeSelecionada, setCidadeSelecionada] = useState('')
  const [sugestoes, setSugestoes] = useState<ReturnType<typeof buscarCidade>>([])
  const [criando, setCriando] = useState(false)

  function handleCidadeChange(valor: string) {
    setCidadeInput(valor)
    setCidadeSelecionada('')
    if (valor.length >= 2) {
      setSugestoes(buscarCidade(valor))
    } else {
      setSugestoes([])
    }
  }

  function selecionarCidade(nome: string) {
    setCidadeInput(nome)
    setCidadeSelecionada(nome)
    setSugestoes([])
  }

  async function criar() {
    if (!nome.trim()) return
    const cidade = cidadeSelecionada || cidadeInput
    if (!cidade.trim()) return
    setCriando(true)
    const id = `proj-${Date.now()}`
    const projeto = projetoVazio(id, nome.trim(), tipologia, cidade.trim())
    await db.projetos.add(projeto)
    router.push(`/projetos/${id}`)
  }

  const cidadeInfo = getCidadePorNome(cidadeSelecionada)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/projetos" className="text-slate-400 hover:text-slate-600 text-sm">
            ← Projetos
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-600">Novo Projeto</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Novo Estudo Preliminar</h1>
        <p className="text-slate-500 mb-8">
          Preencha os dados básicos para iniciar o projeto pela metodologia Análise → Síntese → Avaliação.
        </p>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do projeto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Residência Família Silva, EP Escola Municipal..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipologia <span className="text-red-500">*</span>
            </label>
            <select
              value={tipologia}
              onChange={(e) => setTipologia(e.target.value as Tipologia)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {Object.entries(TIPOLOGIAS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cidade <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cidadeInput}
              onChange={(e) => handleCidadeChange(e.target.value)}
              placeholder="Digite o nome da cidade..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            {sugestoes.length > 0 && (
              <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                {sugestoes.map((c) => (
                  <button
                    key={`${c.nome}-${c.uf}`}
                    onClick={() => selecionarCidade(c.nome)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex justify-between items-center"
                  >
                    <span>{c.nome}</span>
                    <span className="text-slate-400 text-xs">{c.uf} · Zona {c.zona}</span>
                  </button>
                ))}
              </div>
            )}
            {cidadeInfo && (
              <p className="mt-1 text-xs text-blue-600">
                Zona Bioclimática {cidadeInfo.zona} (NBR 15220) · {cidadeInfo.lat.toFixed(2)}°, {cidadeInfo.lng.toFixed(2)}°
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/projetos"
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <button
            onClick={criar}
            disabled={!nome.trim() || !cidadeInput.trim() || criando}
            className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {criando ? 'Criando...' : 'Criar e iniciar Estudo Preliminar'}
          </button>
        </div>
      </main>
    </div>
  )
}
