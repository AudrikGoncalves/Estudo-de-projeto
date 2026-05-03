export type ZonaBioclimatica = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type InfoZona = {
  numero: ZonaBioclimatica
  nome: string
  descricao: string
  estrategias: string[]
  orientacaoFachadaPrincipal: string
  estados: string[]
}

export const ZONAS_BIOCLIMATICAS: InfoZona[] = [
  {
    numero: 1,
    nome: 'Zona 1 — Frio',
    descricao: 'Inverno frio, verão ameno. Alta amplitude térmica.',
    estrategias: [
      'Aquecimento solar passivo nas fachadas Norte',
      'Alta inércia térmica (paredes pesadas)',
      'Vedações externas com alta resistência térmica',
      'Aberturas voltadas para Norte para captação solar',
      'Proteção contra ventos frios do Sul',
    ],
    orientacaoFachadaPrincipal: 'Norte (captação solar)',
    estados: ['RS'],
  },
  {
    numero: 2,
    nome: 'Zona 2 — Temperado',
    descricao: 'Inverno moderado, verão ameno. Boa parte do Sul.',
    estrategias: [
      'Aquecimento solar passivo',
      'Vedações com resistência térmica moderada',
      'Sombreamento para verão',
      'Ventilação controlada',
    ],
    orientacaoFachadaPrincipal: 'Norte (captação solar)',
    estados: ['RS', 'SC'],
  },
  {
    numero: 3,
    nome: 'Zona 3 — Temperado Úmido',
    descricao: 'Inverno ameno, verão quente e úmido.',
    estrategias: [
      'Sombreamento de aberturas',
      'Ventilação cruzada permanente',
      'Vedações de alta resistência térmica',
      'Resfriamento evaporativo',
    ],
    orientacaoFachadaPrincipal: 'Norte com sombreamento',
    estados: ['SC', 'PR', 'SP', 'MG'],
  },
  {
    numero: 4,
    nome: 'Zona 4 — Semiárido Quente',
    descricao: 'Verão muito quente, inverno frio a ameno.',
    estrategias: [
      'Alta inércia térmica',
      'Sombreamento de aberturas',
      'Ventilação cruzada',
      'Resfriamento evaporativo',
      'Controle da radiação solar direta',
    ],
    orientacaoFachadaPrincipal: 'Norte/Sul (minimizar Leste/Oeste)',
    estados: ['MG', 'SP', 'GO', 'DF'],
  },
  {
    numero: 5,
    nome: 'Zona 5 — Quente e Seco',
    descricao: 'Verão quente e seco, inverno ameno.',
    estrategias: [
      'Alta inércia térmica',
      'Sombreamento total de aberturas',
      'Ventilação seletiva (noturna)',
      'Resfriamento evaporativo',
    ],
    orientacaoFachadaPrincipal: 'Norte/Sul (evitar Oeste)',
    estados: ['MT', 'GO', 'DF', 'BA'],
  },
  {
    numero: 6,
    nome: 'Zona 6 — Quente e Úmido de Altitude',
    descricao: 'Verão quente e úmido, inverno seco.',
    estrategias: [
      'Sombreamento de aberturas',
      'Ventilação cruzada',
      'Alta inércia térmica',
    ],
    orientacaoFachadaPrincipal: 'Norte com sombreamento sazonal',
    estados: ['MG', 'SP', 'GO'],
  },
  {
    numero: 7,
    nome: 'Zona 7 — Semiárido',
    descricao: 'Muito quente, seco e árido. Alta radiação solar.',
    estrategias: [
      'Alta inércia térmica (paredes espessas)',
      'Sombreamento máximo de aberturas',
      'Ventilação noturna',
      'Resfriamento evaporativo',
      'Vegetação para sombreamento externo',
    ],
    orientacaoFachadaPrincipal: 'Norte/Sul (aberturas mínimas a Leste/Oeste)',
    estados: ['BA', 'PE', 'CE', 'RN', 'PB', 'PI', 'AL', 'SE', 'MA'],
  },
  {
    numero: 8,
    nome: 'Zona 8 — Quente e Úmido',
    descricao: 'Quente e úmido o ano todo. Grande Amazônia e litoral NE.',
    estrategias: [
      'Ventilação cruzada permanente e ampla',
      'Sombreamento total de cobertura e fachadas',
      'Baixa inércia térmica (paredes leves)',
      'Grandes beirais',
      'Vegetação para sombreamento',
      'Afastar construção do solo (palafitas)',
    ],
    orientacaoFachadaPrincipal: 'Perpendicular aos ventos dominantes',
    estados: ['AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO', 'MA', 'CE', 'RN', 'PB', 'AL', 'SE', 'BA'],
  },
]

export function getZona(numero: ZonaBioclimatica): InfoZona {
  return ZONAS_BIOCLIMATICAS.find((z) => z.numero === numero)!
}
