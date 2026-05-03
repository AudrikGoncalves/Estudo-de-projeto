import type { Ambiente, Tipologia, Setor } from '../tipos'

type AmbientePadrao = Omit<Ambiente, 'id' | 'quantidade' | 'observacoes'>

const RESIDENCIAL_UNIFAMILIAR: AmbientePadrao[] = [
  { nome: 'Sala de Estar', setor: 'social', areaMinima: 20 },
  { nome: 'Sala de Jantar', setor: 'social', areaMinima: 12 },
  { nome: 'Cozinha', setor: 'servico', areaMinima: 10 },
  { nome: 'Área de Serviço', setor: 'servico', areaMinima: 6 },
  { nome: 'Dormitório Suíte', setor: 'intimo', areaMinima: 14, peDireitoMin: 2.5 },
  { nome: 'Dormitório Casal', setor: 'intimo', areaMinima: 12, peDireitoMin: 2.5 },
  { nome: 'Dormitório Solteiro', setor: 'intimo', areaMinima: 9, peDireitoMin: 2.5 },
  { nome: 'Banheiro Social', setor: 'social', areaMinima: 4 },
  { nome: 'Banheiro Suíte', setor: 'intimo', areaMinima: 5 },
  { nome: 'Garagem', setor: 'servico', areaMinima: 14 },
  { nome: 'Varanda', setor: 'social', areaMinima: 8 },
  { nome: 'Escritório/Home Office', setor: 'intimo', areaMinima: 9 },
  { nome: 'Circulação/Hall', setor: 'social', areaMinima: 4 },
  { nome: 'Despensa', setor: 'servico', areaMinima: 3 },
]

const RESIDENCIAL_MULTIFAMILIAR: AmbientePadrao[] = [
  { nome: 'Sala/Living', setor: 'social', areaMinima: 18 },
  { nome: 'Cozinha', setor: 'servico', areaMinima: 8 },
  { nome: 'Área de Serviço', setor: 'servico', areaMinima: 4 },
  { nome: 'Dormitório Suíte', setor: 'intimo', areaMinima: 12 },
  { nome: 'Dormitório', setor: 'intimo', areaMinima: 9 },
  { nome: 'Banheiro', setor: 'social', areaMinima: 3.5 },
  { nome: 'Varanda', setor: 'social', areaMinima: 6 },
  { nome: 'Hall de Entrada', setor: 'social', areaMinima: 3 },
  { nome: 'Circulação Comum', setor: 'social', areaMinima: 0 },
  { nome: 'Salão de Festas', setor: 'social', areaMinima: 40 },
  { nome: 'Academia', setor: 'social', areaMinima: 30 },
  { nome: 'Guarita/Portaria', setor: 'tecnico', areaMinima: 6 },
]

const COMERCIAL: AmbientePadrao[] = [
  { nome: 'Área de Atendimento', setor: 'social', areaMinima: 30 },
  { nome: 'Escritório', setor: 'social', areaMinima: 15 },
  { nome: 'Sala de Reunião', setor: 'social', areaMinima: 20 },
  { nome: 'Recepção/Hall', setor: 'social', areaMinima: 12 },
  { nome: 'Banheiro Masculino', setor: 'servico', areaMinima: 6 },
  { nome: 'Banheiro Feminino', setor: 'servico', areaMinima: 6 },
  { nome: 'Banheiro PCD', setor: 'servico', areaMinima: 4.5 },
  { nome: 'Copa/Cozinha', setor: 'servico', areaMinima: 8 },
  { nome: 'Depósito/Almoxarifado', setor: 'servico', areaMinima: 10 },
  { nome: 'Circulação', setor: 'social', areaMinima: 0 },
  { nome: 'Área Técnica', setor: 'tecnico', areaMinima: 6 },
]

const INSTITUCIONAL: AmbientePadrao[] = [
  { nome: 'Recepção/Lobby', setor: 'social', areaMinima: 20 },
  { nome: 'Sala de Espera', setor: 'social', areaMinima: 20 },
  { nome: 'Sala Multiuso', setor: 'social', areaMinima: 40 },
  { nome: 'Sala Administrativa', setor: 'social', areaMinima: 15 },
  { nome: 'Auditório/Anfiteatro', setor: 'social', areaMinima: 60 },
  { nome: 'Banheiro Masculino', setor: 'servico', areaMinima: 8 },
  { nome: 'Banheiro Feminino', setor: 'servico', areaMinima: 8 },
  { nome: 'Banheiro PCD', setor: 'servico', areaMinima: 4.5 },
  { nome: 'Copa', setor: 'servico', areaMinima: 6 },
  { nome: 'Almoxarifado', setor: 'servico', areaMinima: 10 },
  { nome: 'Circulação/Corredor', setor: 'social', areaMinima: 0 },
  { nome: 'Área Técnica', setor: 'tecnico', areaMinima: 8 },
]

export const AMBIENTES_POR_TIPOLOGIA: Record<Tipologia, AmbientePadrao[]> = {
  'residencial-unifamiliar': RESIDENCIAL_UNIFAMILIAR,
  'residencial-multifamiliar': RESIDENCIAL_MULTIFAMILIAR,
  comercial: COMERCIAL,
  institucional: INSTITUCIONAL,
  misto: [...COMERCIAL, ...RESIDENCIAL_MULTIFAMILIAR],
}

export function gerarAmbientesIniciais(tipologia: Tipologia): Ambiente[] {
  return AMBIENTES_POR_TIPOLOGIA[tipologia].map((a, i) => ({
    ...a,
    id: `amb-${i}-${Date.now()}`,
    quantidade: 1,
  }))
}
