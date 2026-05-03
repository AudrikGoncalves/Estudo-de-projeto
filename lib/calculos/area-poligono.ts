// Fórmula de Shoelace para calcular área de polígono
export function calcularAreaPoligono(pontos: [number, number][]): number {
  if (pontos.length < 3) return 0
  let area = 0
  const n = pontos.length
  for (let i = 0; i < n; i++) {
    const [x1, y1] = pontos[i]
    const [x2, y2] = pontos[(i + 1) % n]
    area += x1 * y2 - x2 * y1
  }
  return Math.abs(area) / 2
}

// Converte graus de lat/lng para metros aproximados (para áreas pequenas)
export function latLngParaMetros(
  pontos: [number, number][],
  latRef: number
): [number, number][] {
  const R = 6371000
  const latRad = (latRef * Math.PI) / 180
  return pontos.map(([lat, lng]) => {
    const x = lng * (Math.PI / 180) * R * Math.cos(latRad)
    const y = lat * (Math.PI / 180) * R
    return [x, y]
  })
}

export function calcularAreaTerreno(pontos: [number, number][]): number {
  if (pontos.length < 3) return 0
  const latRef = pontos.reduce((s, p) => s + p[0], 0) / pontos.length
  const pontosMetros = latLngParaMetros(pontos, latRef)
  return calcularAreaPoligono(pontosMetros)
}
