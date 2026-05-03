export type FaseProjeto = 'analise' | 'sintese' | 'avaliacao'

export type Tipologia =
  | 'residencial-unifamiliar'
  | 'residencial-multifamiliar'
  | 'comercial'
  | 'institucional'
  | 'misto'

export type Setor = 'intimo' | 'social' | 'servico' | 'tecnico' | 'externo'

export type Ambiente = {
  id: string
  nome: string
  setor: Setor
  areaMinima: number
  peDireitoMin?: number
  quantidade: number
  observacoes?: string
}

export type Briefing = {
  cliente: string
  usuarios: string
  atividades: string
  ambientes: Ambiente[]
  prioridades: string
}

export type Topografia = 'plano' | 'aclive' | 'declive'

export type Terreno = {
  endereco: string
  poligono: [number, number][]
  areaTotal: number
  orientacaoNorte: number
  topografia: Topografia
  inclinacao?: number
  vegetacao: string
  corposDAqua: string
  entornoImediato: string
  acessos: string
  ventoDominante?: number
}

export type Condicionantes = {
  zona: string
  usoPermitido: string
  coefAproveitamentoBasico: number
  coefAproveitamentoMaximo: number
  taxaOcupacao: number
  taxaPermeabilidade: number
  recuos: { frontal: number; lateral: number; fundos: number }
  gabaritoAltura: number
  vagasExigidas: number
  acessibilidadeNBR9050: boolean
  tombamento: boolean
  observacoes: string
  checklistCompleto: Record<string, boolean>
}

export type Referencia = {
  id: string
  titulo: string
  arquiteto: string
  ano: number
  url?: string
  principiosAplicaveis: string
}

export type FaseAnalise = {
  briefing: Briefing
  terreno: Terreno
  condicionantes: Condicionantes
  referencias: Referencia[]
}

export type Partido = {
  conceitoGerador: string
  intencoesProjetuais: string
  estrategias: string
  relacaoComLugar: string
}

export type FluxogramaNo = {
  id: string
  ambienteId: string
  x: number
  y: number
}

export type TipoAresta = 'publico' | 'privado' | 'servico'

export type FluxogramaAresta = {
  id: string
  origem: string
  destino: string
  tipo: TipoAresta
}

export type Fluxograma = {
  nos: FluxogramaNo[]
  arestas: FluxogramaAresta[]
}

export type Implantacao = {
  posicionamento: string
  aproveitamentoSolar: string
  areasLivres: string
  paisagismo: string
}

export type PreDimensionamento = {
  areaConstruidaEstimada: number
  areaMaximaLegal: number
  areaOcupacaoMaxima: number
  areaPermeavelMinima: number
  pavimentos: number
  observacoes: string
}

export type FaseSintese = {
  partido: Partido
  fluxograma: Fluxograma
  implantacao: Implantacao
  preDimensionamento: PreDimensionamento
}

export type FaseAvaliacao = {
  checklistConformidade: Record<string, boolean>
  conflitos: string[]
  pontosEmAberto: string[]
  proximosPassos: string[]
}

export type Projeto = {
  id: string
  nome: string
  tipologia: Tipologia
  cidade: string
  faseAtual: FaseProjeto
  criadoEm: string
  atualizadoEm: string
  analise: FaseAnalise
  sintese: FaseSintese
  avaliacao: FaseAvaliacao
}

export const TIPOLOGIAS: Record<Tipologia, string> = {
  'residencial-unifamiliar': 'Residencial Unifamiliar',
  'residencial-multifamiliar': 'Residencial Multifamiliar',
  comercial: 'Comercial',
  institucional: 'Institucional',
  misto: 'Uso Misto',
}

export const SETORES: Record<Setor, { label: string; cor: string }> = {
  intimo: { label: 'Íntimo', cor: '#3b82f6' },
  social: { label: 'Social', cor: '#f97316' },
  servico: { label: 'Serviço', cor: '#6b7280' },
  tecnico: { label: 'Técnico', cor: '#eab308' },
  externo: { label: 'Externo', cor: '#22c55e' },
}

export function projetoVazio(id: string, nome: string, tipologia: Tipologia, cidade: string): Projeto {
  const agora = new Date().toISOString()
  return {
    id,
    nome,
    tipologia,
    cidade,
    faseAtual: 'analise',
    criadoEm: agora,
    atualizadoEm: agora,
    analise: {
      briefing: { cliente: '', usuarios: '', atividades: '', ambientes: [], prioridades: '' },
      terreno: {
        endereco: '', poligono: [], areaTotal: 0, orientacaoNorte: 0,
        topografia: 'plano', vegetacao: '', corposDAqua: '', entornoImediato: '', acessos: '',
      },
      condicionantes: {
        zona: '', usoPermitido: '', coefAproveitamentoBasico: 0, coefAproveitamentoMaximo: 0,
        taxaOcupacao: 0, taxaPermeabilidade: 0,
        recuos: { frontal: 0, lateral: 0, fundos: 0 },
        gabaritoAltura: 0, vagasExigidas: 0,
        acessibilidadeNBR9050: false, tombamento: false, observacoes: '',
        checklistCompleto: {},
      },
      referencias: [],
    },
    sintese: {
      partido: { conceitoGerador: '', intencoesProjetuais: '', estrategias: '', relacaoComLugar: '' },
      fluxograma: { nos: [], arestas: [] },
      implantacao: { posicionamento: '', aproveitamentoSolar: '', areasLivres: '', paisagismo: '' },
      preDimensionamento: {
        areaConstruidaEstimada: 0, areaMaximaLegal: 0,
        areaOcupacaoMaxima: 0, areaPermeavelMinima: 0,
        pavimentos: 1, observacoes: '',
      },
    },
    avaliacao: {
      checklistConformidade: {},
      conflitos: [],
      pontosEmAberto: [],
      proximosPassos: [],
    },
  }
}
