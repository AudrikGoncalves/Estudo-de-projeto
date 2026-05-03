'use client'

import { useEffect, useRef } from 'react'
import { trajetoriasReferencia } from '@/lib/calculos/solar'

const CORES = ['#f97316', '#94a3b8', '#3b82f6']
const LABELS = ['Dez (verão)', 'Mar/Set (equinócio)', 'Jun (inverno)']

export default function CartaSolar({ lat, lng }: { lat: number; lng: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2
    const R = Math.min(W, H) / 2 - 20

    ctx.clearRect(0, 0, W, H)

    // Fundo
    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    ctx.stroke()

    // Círculos de altitude
    ;[10, 20, 30, 40, 50, 60, 70, 80].forEach((alt) => {
      const r = R * (1 - alt / 90)
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.fillStyle = '#94a3b8'
      ctx.font = '9px sans-serif'
      ctx.fillText(`${alt}°`, cx + r + 2, cy)
    })

    // Linhas de azimute (N, NE, E, SE, S, SW, W, NW)
    ;[0, 45, 90, 135, 180, 225, 270, 315].forEach((az) => {
      const rad = ((az - 90) * Math.PI) / 180
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + R * Math.cos(rad), cy + R * Math.sin(rad))
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 0.5
      ctx.stroke()
    })

    // Labels cardinais
    const dirs = [
      { label: 'N', az: 0 }, { label: 'L', az: 90 },
      { label: 'S', az: 180 }, { label: 'O', az: 270 },
    ]
    dirs.forEach(({ label, az }) => {
      const rad = ((az - 90) * Math.PI) / 180
      const x = cx + (R + 12) * Math.cos(rad)
      const y = cy + (R + 12) * Math.sin(rad)
      ctx.fillStyle = '#475569'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, x, y)
    })

    // Trajetórias solares
    const trajetorias = trajetoriasReferencia(lat, lng)
    trajetorias.forEach((traj, idx) => {
      ctx.beginPath()
      let primeiro = true
      traj.pontos.forEach((pt) => {
        const altRad = (pt.altitude * Math.PI) / 180
        const azRad = ((pt.azimute - 90) * Math.PI) / 180
        const r = R * (1 - pt.altitude / 90)
        const x = cx + r * Math.cos(azRad)
        const y = cy + r * Math.sin(azRad)
        if (primeiro) { ctx.moveTo(x, y); primeiro = false }
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = CORES[idx]
      ctx.lineWidth = 2
      ctx.stroke()
    })

  }, [lat, lng])

  return (
    <div>
      <canvas ref={canvasRef} width={260} height={260} className="mx-auto" />
      <div className="flex justify-center gap-4 mt-2 flex-wrap">
        {LABELS.map((l, i) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: CORES[i] }} />
            <span className="text-xs text-slate-500">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
