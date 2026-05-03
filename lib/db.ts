import Dexie, { type EntityTable } from 'dexie'
import type { Projeto } from './tipos'

const db = new Dexie('EstudoDeProjeto') as Dexie & {
  projetos: EntityTable<Projeto, 'id'>
}

db.version(1).stores({
  projetos: 'id, nome, tipologia, cidade, faseAtual, criadoEm, atualizadoEm',
})

export default db
