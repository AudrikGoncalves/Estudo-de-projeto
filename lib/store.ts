import { create } from 'zustand'
import type { Projeto, FaseAnalise, FaseSintese, FaseAvaliacao } from './tipos'
import db from './db'

type ModoInterface = 'didatico' | 'profissional'

type Store = {
  projetoAtivo: Projeto | null
  modo: ModoInterface

  carregarProjeto: (id: string) => Promise<void>
  salvarProjeto: (projeto: Projeto) => Promise<void>
  atualizarAnalise: (analise: Partial<FaseAnalise>) => void
  atualizarSintese: (sintese: Partial<FaseSintese>) => void
  atualizarAvaliacao: (avaliacao: Partial<FaseAvaliacao>) => void
  setModo: (modo: ModoInterface) => void
  limparProjeto: () => void
}

export const useStore = create<Store>((set, get) => ({
  projetoAtivo: null,
  modo: 'didatico',

  carregarProjeto: async (id) => {
    const projeto = await db.projetos.get(id)
    if (projeto) set({ projetoAtivo: projeto })
  },

  salvarProjeto: async (projeto) => {
    const atualizado = { ...projeto, atualizadoEm: new Date().toISOString() }
    await db.projetos.put(atualizado)
    set({ projetoAtivo: atualizado })
  },

  atualizarAnalise: (analise) => {
    const { projetoAtivo, salvarProjeto } = get()
    if (!projetoAtivo) return
    const atualizado = { ...projetoAtivo, analise: { ...projetoAtivo.analise, ...analise } }
    set({ projetoAtivo: atualizado })
    salvarProjeto(atualizado)
  },

  atualizarSintese: (sintese) => {
    const { projetoAtivo, salvarProjeto } = get()
    if (!projetoAtivo) return
    const atualizado = { ...projetoAtivo, sintese: { ...projetoAtivo.sintese, ...sintese } }
    set({ projetoAtivo: atualizado })
    salvarProjeto(atualizado)
  },

  atualizarAvaliacao: (avaliacao) => {
    const { projetoAtivo, salvarProjeto } = get()
    if (!projetoAtivo) return
    const atualizado = { ...projetoAtivo, avaliacao: { ...projetoAtivo.avaliacao, ...avaliacao } }
    set({ projetoAtivo: atualizado })
    salvarProjeto(atualizado)
  },

  setModo: (modo) => set({ modo }),

  limparProjeto: () => set({ projetoAtivo: null }),
}))
