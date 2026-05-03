export function calcularAreaMaximaConstrucao(areaTerreno: number, ca: number) {
  return areaTerreno * ca
}

export function calcularAreaMaximaOcupacao(areaTerreno: number, to: number) {
  return areaTerreno * to
}

export function calcularAreaPermeavelMinima(areaTerreno: number, tp: number) {
  return areaTerreno * tp
}

export function calcularAreaProgramaTotal(ambientes: { areaMinima: number; quantidade: number }[]) {
  return ambientes.reduce((acc, a) => acc + a.areaMinima * a.quantidade, 0)
}

export type ResultadoIndices = {
  areaMaximaConstrucao: number
  areaMaximaOcupacao: number
  areaPermeavelMinima: number
  areaPrograma: number
  viabilLegal: boolean
  alertas: string[]
}

export function calcularIndices(params: {
  areaTerreno: number
  ca: number
  to: number
  tp: number
  areaPrograma: number
  pavimentos: number
}): ResultadoIndices {
  const { areaTerreno, ca, to, tp, areaPrograma, pavimentos } = params
  const areaMaximaConstrucao = calcularAreaMaximaConstrucao(areaTerreno, ca)
  const areaMaximaOcupacao = calcularAreaMaximaOcupacao(areaTerreno, to)
  const areaPermeavelMinima = calcularAreaPermeavelMinima(areaTerreno, tp)

  const alertas: string[] = []

  if (areaPrograma > areaMaximaConstrucao) {
    alertas.push(
      `Área do programa (${areaPrograma.toFixed(0)} m²) excede a área máxima de construção permitida (${areaMaximaConstrucao.toFixed(0)} m²).`
    )
  }

  const areaOcupacaoPorPav = areaMaximaOcupacao
  const areaEstimadaPorPav = pavimentos > 0 ? areaPrograma / pavimentos : areaPrograma
  if (areaEstimadaPorPav > areaOcupacaoPorPav) {
    alertas.push(
      `Área estimada por pavimento (${areaEstimadaPorPav.toFixed(0)} m²) excede a taxa de ocupação permitida (${areaOcupacaoPorPav.toFixed(0)} m²).`
    )
  }

  return {
    areaMaximaConstrucao,
    areaMaximaOcupacao,
    areaPermeavelMinima,
    areaPrograma,
    viabilLegal: alertas.length === 0,
    alertas,
  }
}
