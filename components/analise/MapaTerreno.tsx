'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { calcularAreaTerreno } from '@/lib/calculos/area-poligono'

export default function MapaTerreno() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const { projetoAtivo, atualizarAnalise } = useStore()

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    async function initMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const cidade = projetoAtivo?.cidade
      const lat = -15.78
      const lng = -47.93

      const map = L.map(mapRef.current!).setView([lat, lng], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      mapInstanceRef.current = map

      const pontos: [number, number][] = projetoAtivo?.analise.terreno.poligono ?? []
      let poligono: ReturnType<typeof L.polygon> | null = null
      const marcadores: ReturnType<typeof L.marker>[] = []

      function redesenhar(pts: [number, number][]) {
        marcadores.forEach((m) => map.removeLayer(m))
        marcadores.length = 0
        if (poligono) { map.removeLayer(poligono); poligono = null }
        if (pts.length >= 3) {
          poligono = L.polygon(pts, { color: '#1d4ed8', weight: 2, fillOpacity: 0.15 }).addTo(map)
        }
        pts.forEach((pt) => {
          const m = L.marker(pt, { draggable: true }).addTo(map)
          m.on('dragend', () => {
            const idx = marcadores.indexOf(m)
            const newPts = [...pts]
            const pos = m.getLatLng()
            newPts[idx] = [pos.lat, pos.lng]
            atualizarAnalise({
              terreno: {
                ...projetoAtivo!.analise.terreno,
                poligono: newPts,
                areaTotal: calcularAreaTerreno(newPts),
              },
            })
            redesenhar(newPts)
          })
          marcadores.push(m)
        })
      }

      redesenhar(pontos)

      map.on('click', (e) => {
        const newPts: [number, number][] = [
          ...(projetoAtivo?.analise.terreno.poligono ?? []),
          [e.latlng.lat, e.latlng.lng],
        ]
        atualizarAnalise({
          terreno: {
            ...projetoAtivo!.analise.terreno,
            poligono: newPts,
            areaTotal: calcularAreaTerreno(newPts),
          },
        })
        redesenhar(newPts)
      })

      // Botão de limpar
      const LimparControl = L.Control.extend({
        onAdd: () => {
          const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control')
          btn.textContent = 'Limpar polígono'
          btn.style.cssText = 'background:#fff;padding:4px 8px;font-size:11px;cursor:pointer;white-space:nowrap'
          L.DomEvent.on(btn, 'click', (ev) => {
            L.DomEvent.stopPropagation(ev)
            atualizarAnalise({
              terreno: { ...projetoAtivo!.analise.terreno, poligono: [], areaTotal: 0 },
            })
            redesenhar([])
          })
          return btn
        },
      })
      new LimparControl({ position: 'topright' }).addTo(map)
    }

    initMap()
  }, [])

  return (
    <div>
      <div ref={mapRef} className="h-64 w-full rounded-xl overflow-hidden border border-slate-200" />
      <p className="text-xs text-slate-400 mt-1">Clique no mapa para adicionar vértices do lote. Arraste para ajustar.</p>
      {projetoAtivo?.analise.terreno.areaTotal ? (
        <p className="text-xs text-blue-600 font-medium mt-1">
          Área calculada: {projetoAtivo.analise.terreno.areaTotal.toFixed(0)} m²
        </p>
      ) : null}
    </div>
  )
}
