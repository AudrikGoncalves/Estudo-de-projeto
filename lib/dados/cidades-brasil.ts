import type { ZonaBioclimatica } from './zonas-bioclimaticas'

export type CidadeBrasil = {
  nome: string
  uf: string
  lat: number
  lng: number
  zona: ZonaBioclimatica
}

export const CIDADES: CidadeBrasil[] = [
  { nome: 'Porto Alegre', uf: 'RS', lat: -30.03, lng: -51.23, zona: 2 },
  { nome: 'Caxias do Sul', uf: 'RS', lat: -29.17, lng: -51.18, zona: 1 },
  { nome: 'Pelotas', uf: 'RS', lat: -31.77, lng: -52.34, zona: 2 },
  { nome: 'Santa Maria', uf: 'RS', lat: -29.69, lng: -53.81, zona: 2 },
  { nome: 'Florianópolis', uf: 'SC', lat: -27.59, lng: -48.55, zona: 3 },
  { nome: 'Joinville', uf: 'SC', lat: -26.30, lng: -48.85, zona: 3 },
  { nome: 'Blumenau', uf: 'SC', lat: -26.92, lng: -49.07, zona: 3 },
  { nome: 'Curitiba', uf: 'PR', lat: -25.43, lng: -49.27, zona: 1 },
  { nome: 'Londrina', uf: 'PR', lat: -23.31, lng: -51.17, zona: 3 },
  { nome: 'Maringá', uf: 'PR', lat: -23.42, lng: -51.94, zona: 3 },
  { nome: 'Foz do Iguaçu', uf: 'PR', lat: -25.52, lng: -54.59, zona: 3 },
  { nome: 'São Paulo', uf: 'SP', lat: -23.55, lng: -46.63, zona: 3 },
  { nome: 'Campinas', uf: 'SP', lat: -22.91, lng: -47.06, zona: 3 },
  { nome: 'Santos', uf: 'SP', lat: -23.96, lng: -46.33, zona: 4 },
  { nome: 'Ribeirão Preto', uf: 'SP', lat: -21.17, lng: -47.81, zona: 4 },
  { nome: 'São José dos Campos', uf: 'SP', lat: -23.18, lng: -45.88, zona: 3 },
  { nome: 'Rio de Janeiro', uf: 'RJ', lat: -22.91, lng: -43.17, zona: 4 },
  { nome: 'Niterói', uf: 'RJ', lat: -22.88, lng: -43.10, zona: 4 },
  { nome: 'Campos dos Goytacazes', uf: 'RJ', lat: -21.75, lng: -41.33, zona: 5 },
  { nome: 'Belo Horizonte', uf: 'MG', lat: -19.92, lng: -43.94, zona: 3 },
  { nome: 'Uberlândia', uf: 'MG', lat: -18.92, lng: -48.28, zona: 4 },
  { nome: 'Juiz de Fora', uf: 'MG', lat: -21.76, lng: -43.35, zona: 3 },
  { nome: 'Montes Claros', uf: 'MG', lat: -16.73, lng: -43.86, zona: 6 },
  { nome: 'Vitória', uf: 'ES', lat: -20.32, lng: -40.34, zona: 4 },
  { nome: 'Brasília', uf: 'DF', lat: -15.78, lng: -47.93, zona: 4 },
  { nome: 'Goiânia', uf: 'GO', lat: -16.69, lng: -49.25, zona: 6 },
  { nome: 'Anápolis', uf: 'GO', lat: -16.33, lng: -48.95, zona: 6 },
  { nome: 'Cuiabá', uf: 'MT', lat: -15.60, lng: -56.10, zona: 7 },
  { nome: 'Campo Grande', uf: 'MS', lat: -20.46, lng: -54.62, zona: 6 },
  { nome: 'Salvador', uf: 'BA', lat: -12.97, lng: -38.51, zona: 8 },
  { nome: 'Feira de Santana', uf: 'BA', lat: -12.25, lng: -38.97, zona: 7 },
  { nome: 'Recife', uf: 'PE', lat: -8.05, lng: -34.88, zona: 8 },
  { nome: 'Caruaru', uf: 'PE', lat: -8.28, lng: -35.97, zona: 7 },
  { nome: 'Fortaleza', uf: 'CE', lat: -3.72, lng: -38.54, zona: 8 },
  { nome: 'Natal', uf: 'RN', lat: -5.79, lng: -35.21, zona: 8 },
  { nome: 'João Pessoa', uf: 'PB', lat: -7.12, lng: -34.86, zona: 8 },
  { nome: 'Maceió', uf: 'AL', lat: -9.67, lng: -35.74, zona: 8 },
  { nome: 'Aracaju', uf: 'SE', lat: -10.91, lng: -37.07, zona: 8 },
  { nome: 'Teresina', uf: 'PI', lat: -5.09, lng: -42.81, zona: 7 },
  { nome: 'São Luís', uf: 'MA', lat: -2.53, lng: -44.30, zona: 8 },
  { nome: 'Belém', uf: 'PA', lat: -1.46, lng: -48.50, zona: 8 },
  { nome: 'Santarém', uf: 'PA', lat: -2.44, lng: -54.70, zona: 8 },
  { nome: 'Manaus', uf: 'AM', lat: -3.10, lng: -60.02, zona: 8 },
  { nome: 'Macapá', uf: 'AP', lat: 0.03, lng: -51.07, zona: 8 },
  { nome: 'Boa Vista', uf: 'RR', lat: 2.82, lng: -60.67, zona: 8 },
  { nome: 'Porto Velho', uf: 'RO', lat: -8.76, lng: -63.90, zona: 8 },
  { nome: 'Rio Branco', uf: 'AC', lat: -9.97, lng: -67.81, zona: 8 },
  { nome: 'Palmas', uf: 'TO', lat: -10.25, lng: -48.33, zona: 7 },
]

export function buscarCidade(termo: string): CidadeBrasil[] {
  const t = termo.toLowerCase()
  return CIDADES.filter(
    (c) => c.nome.toLowerCase().includes(t) || c.uf.toLowerCase().includes(t)
  ).slice(0, 10)
}

export function getCidadePorNome(nome: string): CidadeBrasil | undefined {
  return CIDADES.find((c) => c.nome === nome)
}
