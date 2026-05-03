import SunCalc from 'suncalc'

export type PosicaoSolar = {
  azimute: number   // graus, 0=Norte, 90=Leste, 180=Sul, 270=Oeste
  altitude: number  // graus acima do horizonte
}

export function posicaoSolar(data: Date, lat: number, lng: number): PosicaoSolar {
  const pos = SunCalc.getPosition(data, lat, lng)
  const azimuteDeg = ((pos.azimuth * 180) / Math.PI + 180) % 360
  const altitudeDeg = (pos.altitude * 180) / Math.PI
  return { azimute: azimuteDeg, altitude: altitudeDeg }
}

export type TrajetoriaSolar = {
  mes: number
  dia: number
  pontos: Array<{ hora: number; azimute: number; altitude: number }>
}

export function trajetoriaDia(ano: number, mes: number, dia: number, lat: number, lng: number): TrajetoriaSolar {
  const pontos: TrajetoriaSolar['pontos'] = []
  for (let hora = 0; hora <= 24; hora += 0.5) {
    const date = new Date(ano, mes - 1, dia, Math.floor(hora), (hora % 1) * 60)
    const pos = posicaoSolar(date, lat, lng)
    if (pos.altitude > 0) {
      pontos.push({ hora, azimute: pos.azimute, altitude: pos.altitude })
    }
  }
  return { mes, dia, pontos }
}

// Trajetórias nos solstícios e equinócios
export function trajetoriasReferencia(lat: number, lng: number): TrajetoriaSolar[] {
  const ano = new Date().getFullYear()
  return [
    trajetoriaDia(ano, 12, 21, lat, lng), // solstício de verão (hem. sul)
    trajetoriaDia(ano, 3, 21, lat, lng),  // equinócio
    trajetoriaDia(ano, 6, 21, lat, lng),  // solstício de inverno (hem. sul)
  ]
}
