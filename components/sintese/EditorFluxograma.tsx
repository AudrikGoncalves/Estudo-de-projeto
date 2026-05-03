'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Node,
  type Edge,
  type Connection,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStore } from '@/lib/store'
import { SETORES, type Setor } from '@/lib/tipos'

type NodeData = { label: string; setor: Setor }

function AmbienteNode({ data }: { data: NodeData }) {
  const cor = SETORES[data.setor]?.cor ?? '#94a3b8'
  return (
    <div
      style={{ borderColor: cor, backgroundColor: cor + '22' }}
      className="border-2 rounded-xl px-4 py-3 min-w-28 text-center shadow-sm"
    >
      <div className="text-xs font-bold mb-0.5" style={{ color: cor }}>
        {SETORES[data.setor]?.label ?? data.setor}
      </div>
      <div className="text-sm font-medium text-slate-800">{data.label}</div>
    </div>
  )
}

const NODE_TYPES = { ambiente: AmbienteNode }

const EDGE_STYLES: Record<string, React.CSSProperties> = {
  publico: { stroke: '#3b82f6' },
  privado: { stroke: '#94a3b8', strokeDasharray: '5,4' },
  servico: { stroke: '#f97316', strokeDasharray: '2,3' },
}

export default function EditorFluxograma() {
  const { projetoAtivo, atualizarSintese, modo } = useStore()
  const [tipoAresta, setTipoAresta] = useState<'publico' | 'privado' | 'servico'>('publico')
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [iniciado, setIniciado] = useState(false)

  // Carrega estado salvo
  useEffect(() => {
    if (!projetoAtivo || iniciado) return
    const fluxograma = projetoAtivo.sintese.fluxograma
    const briefing = projetoAtivo.analise.briefing

    if (fluxograma.nos.length > 0) {
      const nosSalvos: Node[] = fluxograma.nos.map((n: { id: string; ambienteId: string; x: number; y: number }) => {
        const amb = briefing.ambientes.find((a) => a.id === n.ambienteId)
        return {
          id: n.id,
          type: 'ambiente',
          position: { x: n.x, y: n.y },
          data: { label: amb?.nome ?? n.ambienteId, setor: amb?.setor ?? 'social' } as NodeData,
        }
      })
      const arestasSalvas: Edge[] = fluxograma.arestas.map((e: { id: string; origem: string; destino: string; tipo: string }) => ({
        id: e.id,
        source: e.origem,
        target: e.destino,
        style: EDGE_STYLES[e.tipo],
        markerEnd: { type: MarkerType.Arrow },
        data: { tipo: e.tipo },
      }))
      setNodes(nosSalvos)
      setEdges(arestasSalvas)
    }
    setIniciado(true)
  }, [projetoAtivo, iniciado, setNodes, setEdges])

  const onConnect = useCallback(
    (conn: Connection) => {
      const novaAresta: Edge = {
        id: `edge-${Date.now()}`,
        source: conn.source,
        target: conn.target,
        style: EDGE_STYLES[tipoAresta],
        markerEnd: { type: MarkerType.Arrow },
        data: { tipo: tipoAresta },
      }
      setEdges((eds) => addEdge(novaAresta, eds))
    },
    [tipoAresta, setEdges]
  )

  function salvar(ns: Node[], es: Edge[]) {
    if (!projetoAtivo) return
    atualizarSintese({
      fluxograma: {
        nos: ns.map((n) => ({
          id: n.id,
          ambienteId: (n.data as NodeData).label,
          x: n.position.x,
          y: n.position.y,
        })),
        arestas: es.map((e) => ({
          id: e.id,
          origem: e.source,
          destino: e.target,
          tipo: ((e.data as { tipo: string })?.tipo ?? 'publico') as 'publico' | 'privado' | 'servico',
        })),
      },
    })
  }

  function adicionarNosDoBriefing() {
    if (!projetoAtivo) return
    const ambientes = projetoAtivo.analise.briefing.ambientes
    const setoresPosicao: Record<Setor, { x: number; y: number; count: number }> = {
      social: { x: 50, y: 50, count: 0 },
      intimo: { x: 350, y: 50, count: 0 },
      servico: { x: 650, y: 50, count: 0 },
      tecnico: { x: 650, y: 300, count: 0 },
      externo: { x: 50, y: 300, count: 0 },
    }
    const novosNos: Node[] = ambientes.map((a) => {
      const s = setoresPosicao[a.setor]
      const node: Node = {
        id: `node-${a.id}`,
        type: 'ambiente',
        position: { x: s.x + (s.count % 2) * 160, y: s.y + Math.floor(s.count / 2) * 90 },
        data: { label: a.nome || 'Ambiente', setor: a.setor } as NodeData,
      }
      s.count++
      return node
    })
    setNodes(novosNos)
    setEdges([])
  }

  function limpar() {
    setNodes([])
    setEdges([])
    salvar([], [])
  }

  if (!projetoAtivo) return null

  const temAmbientes = projetoAtivo.analise.briefing.ambientes.length > 0

  return (
    <div>
      {modo === 'didatico' && (
        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
          <strong>② Síntese — Fluxograma</strong><br />
          Organize os ambientes do programa em setores (íntimo, social, serviço) e conecte-os representando os fluxos. Arraste os nós para reposicionar. Conecte dois nós arrastando de uma alça para outra.
        </div>
      )}

      <div className="flex gap-2 mb-3 flex-wrap">
        {temAmbientes && (
          <button onClick={adicionarNosDoBriefing} className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-700">
            Importar ambientes do briefing
          </button>
        )}
        <button onClick={limpar} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-300">
          Limpar
        </button>
        <button onClick={() => salvar(nodes, edges)} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-700">
          Salvar
        </button>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-slate-500">Tipo de conexão:</span>
          {(['publico', 'privado', 'servico'] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setTipoAresta(tipo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tipoAresta === tipo ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {tipo === 'publico' ? '— Público' : tipo === 'privado' ? '- - Privado' : '··· Serviço'}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden" style={{ height: 480 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => { onNodesChange(changes); salvar(nodes, edges) }}
          onEdgesChange={(changes) => { onEdgesChange(changes); salvar(nodes, edges) }}
          onConnect={onConnect}
          nodeTypes={NODE_TYPES}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <div className="mt-3 flex gap-4 flex-wrap">
        {Object.entries(SETORES).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.cor }} />
            <span className="text-xs text-slate-500">{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
