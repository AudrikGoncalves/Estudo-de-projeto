// ─── Fluxograma (fluxos entre setores/ambientes) ───
const FluxogramaTool = ({ data, onSave }) => {
  const canvasRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const [nodes, setNodes] = React.useState(() => data.fluxogramaNodes || []);
  const [connections, setConnections] = React.useState(() => data.fluxogramaConns || []);
  const [dragging, setDragging] = React.useState(null);
  const [connecting, setConnecting] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [newNodeName, setNewNodeName] = React.useState('');
  const [newNodeType, setNewNodeType] = React.useState('setor');
  const [hoveredConn, setHoveredConn] = React.useState(null);
  const [saved, setSaved] = React.useState(false);
  const [editingNode, setEditingNode] = React.useState(null);
  const [editName, setEditName] = React.useState('');
  const [connLabel, setConnLabel] = React.useState('');
  const [editingConn, setEditingConn] = React.useState(null);
  const [editConnLabel, setEditConnLabel] = React.useState('');
  const [confirmClear, setConfirmClear] = React.useState(false);
  const mousePosRef = React.useRef({ x: 0, y: 0 });
  const animFrame = React.useRef(0);
  const history = useCanvasHistory();

  // Cores concretas — canvas 2D não resolve var(--...)
  const nodeTypes = {
    setor: { color: 'oklch(0.55 0.15 30)', bg: 'oklch(0.93 0.045 30)', label: 'Setor', radius: 44 },
    ambiente: { color: 'oklch(0.55 0.12 250)', bg: 'oklch(0.93 0.04 250)', label: 'Ambiente', radius: 34 },
    acesso: { color: 'oklch(0.55 0.12 155)', bg: 'oklch(0.93 0.04 155)', label: 'Acesso', radius: 28 },
    circulacao: { color: 'oklch(0.62 0.12 85)', bg: 'oklch(0.94 0.04 85)', label: 'Circulação', radius: 30 },
    externo: { color: '#8E8B82', bg: '#F0EDE5', label: 'Externo', radius: 26 },
  };

  const connTypes = [
    { id: 'direto', label: 'Direto', dash: false, width: 2.5, color: '#A09D94' },
    { id: 'indireto', label: 'Indireto', dash: true, width: 1.5, color: '#A09D94' },
    { id: 'restrito', label: 'Restrito', dash: false, width: 2, color: 'oklch(0.55 0.16 25)' },
    { id: 'servico', label: 'Serviço', dash: true, width: 2, color: 'oklch(0.62 0.12 85)' },
  ];
  const [connType, setConnType] = React.useState('direto');

  const snapshot = () => history.push({ nodes, connections });
  const undo = () => {
    const prev = history.undo();
    if (prev) { setNodes(prev.nodes); setConnections(prev.connections); setSelected(null); setConnecting(null); setEditingConn(null); }
  };

  // Ctrl+Z / Delete / Esc
  React.useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) { e.preventDefault(); removeNode(selected); }
      if (e.key === 'Escape') { setConnecting(null); setEditingNode(null); setEditingConn(null); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  // Tick de animação
  React.useEffect(() => {
    let running = true;
    const tick = () => { animFrame.current++; if (running) requestAnimationFrame(tick); };
    tick();
    return () => { running = false; };
  }, []);

  const addNode = () => {
    if (!newNodeName.trim()) return;
    snapshot();
    const cx = 400 + (Math.random() - 0.5) * 300;
    const cy = 280 + (Math.random() - 0.5) * 200;
    setNodes(p => [...p, { id: 'n' + Date.now(), name: newNodeName.trim(), type: newNodeType, x: cx, y: cy }]);
    setNewNodeName('');
  };

  // Importa setores + ambientes E cria as conexões setor→ambiente automaticamente
  const importFromData = () => {
    const setores = data.setores || [];
    const programa = data.programa || [];
    const newNodes = [];
    const newConns = [];
    setores.forEach((s, i) => {
      if (!s.nome) return;
      const setorId = 'ns' + i;
      newNodes.push({ id: setorId, name: s.nome, type: 'setor', x: 160 + i * 200, y: 100 });
      const ambientes = (s.ambientes || '').split(',').map(a => a.trim()).filter(Boolean);
      ambientes.forEach((a, j) => {
        const ambId = 'na' + i + '_' + j;
        newNodes.push({ id: ambId, name: a, type: 'ambiente', x: 100 + i * 200 + (j % 3) * 80, y: 200 + Math.floor(j / 3) * 80 });
        newConns.push({ from: setorId, to: ambId, type: 'direto', label: '' });
      });
    });
    if (newNodes.length === 0 && programa.length > 0) {
      programa.forEach((p, i) => {
        if (p.ambiente) newNodes.push({ id: 'np' + i, name: p.ambiente, type: 'ambiente', x: 80 + (i % 5) * 150, y: 80 + Math.floor(i / 5) * 120 });
      });
    }
    if (newNodes.length > 0) {
      snapshot();
      setNodes(newNodes);
      setConnections(newConns);
      // Organiza automaticamente após importar
      setTimeout(() => autoArrangeWith(newNodes, newConns), 50);
    }
  };

  const autoArrangeWith = (nds, conns) => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 800;
    const h = canvas ? canvas.height : 500;
    const pos = forceLayout(nds, conns, { width: w, height: h, getRadius: n => (nodeTypes[n.type] || nodeTypes.setor).radius });
    setNodes(p => p.map(n => pos[n.id] ? { ...n, x: pos[n.id].x, y: pos[n.id].y } : n));
  };

  const autoArrange = () => {
    if (nodes.length < 2) return;
    snapshot();
    autoArrangeWith(nodes, connections);
  };

  const removeNode = (id) => {
    snapshot();
    setNodes(p => p.filter(n => n.id !== id));
    setConnections(p => p.filter(c => c.from !== id && c.to !== id));
    setSelected(null);
  };

  const save = () => {
    onSave({ ...data, fluxogramaNodes: nodes, fluxogramaConns: connections });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  // Desenho
  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FAFAF8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid de pontos
    ctx.fillStyle = '#E5E2DB';
    for (let x = 20; x < canvas.width; x += 30) {
      for (let y = 20; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.arc(x, y, 0.8, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Conexões
    connections.forEach((conn, ci) => {
      const from = nodes.find(n => n.id === conn.from);
      const to = nodes.find(n => n.id === conn.to);
      if (!from || !to) return;

      const ct = connTypes.find(c => c.id === conn.type) || connTypes[0];
      const isHovered = hoveredConn === ci;
      const isEditing = editingConn === ci;
      const strokeColor = isHovered || isEditing ? 'oklch(0.55 0.15 30)' : ct.color;

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const curvature = Math.min(dist * 0.15, 40);
      const cpX = midX + (-dy / dist) * curvature;
      const cpY = midY + (dx / dist) * curvature;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(cpX, cpY, to.x, to.y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isHovered ? ct.width + 1.5 : ct.width;
      if (ct.dash) ctx.setLineDash([6, 4]); else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Partícula animada
      const t = ((animFrame.current * 0.008 + ci * 0.3) % 1);
      const px = (1-t)*(1-t)*from.x + 2*(1-t)*t*cpX + t*t*to.x;
      const py = (1-t)*(1-t)*from.y + 2*(1-t)*t*cpY + t*t*to.y;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Seta na ponta
      const t2 = 0.95;
      const ax = (1-t2)*(1-t2)*from.x + 2*(1-t2)*t2*cpX + t2*t2*to.x;
      const ay = (1-t2)*(1-t2)*from.y + 2*(1-t2)*t2*cpY + t2*t2*to.y;
      const angle = Math.atan2(to.y - ay, to.x - ax);
      ctx.beginPath();
      ctx.moveTo(to.x - Math.cos(angle - 0.4) * 12, to.y - Math.sin(angle - 0.4) * 12);
      ctx.lineTo(to.x, to.y);
      ctx.lineTo(to.x - Math.cos(angle + 0.4) * 12, to.y - Math.sin(angle + 0.4) * 12);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rótulo
      if (conn.label) {
        ctx.font = '500 11px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FAF9F7';
        const tw = ctx.measureText(conn.label).width + 10;
        ctx.fillRect(cpX - tw/2, cpY - 16, tw, 16);
        ctx.fillStyle = strokeColor;
        ctx.fillText(conn.label, cpX, cpY - 4);
      }
    });

    // Linha de conexão em curso
    if (connecting) {
      const from = nodes.find(n => n.id === connecting);
      if (from) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(mousePosRef.current.x, mousePosRef.current.y);
        ctx.strokeStyle = 'oklch(0.55 0.15 30)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Nós
    nodes.forEach(node => {
      const nt = nodeTypes[node.type] || nodeTypes.setor;
      const r = nt.radius;
      const isSel = selected === node.id;
      const isConn = connecting === node.id;

      if (isSel || isConn) {
        ctx.beginPath(); ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = nt.bg; ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
      }

      ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = isSel ? nt.color : '#D4D1CA';
      ctx.lineWidth = isSel ? 2.5 : 1.5;
      ctx.stroke();

      ctx.beginPath(); ctx.arc(node.x, node.y, r - 4, 0, Math.PI * 2);
      ctx.fillStyle = nt.bg;
      ctx.fill();

      ctx.font = `600 ${r > 36 ? 12 : 10}px "Inter", sans-serif`;
      ctx.fillStyle = nt.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const words = node.name.split(' ');
      if (words.length > 1 && r > 30) {
        ctx.fillText(words[0], node.x, node.y - 6);
        ctx.fillText(words.slice(1).join(' '), node.x, node.y + 8);
      } else {
        ctx.fillText(node.name, node.x, node.y);
      }

      ctx.font = '500 9px "Inter", sans-serif';
      ctx.fillStyle = '#9C988E';
      ctx.fillText(nt.label, node.x, node.y + r + 14);
    });

    requestAnimationFrame(draw);
  }, [nodes, connections, selected, connecting, hoveredConn, editingConn]);

  React.useEffect(() => { const id = requestAnimationFrame(draw); return () => cancelAnimationFrame(id); }, [draw]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const findNode = (pos) => nodes.find(n => {
    const r = (nodeTypes[n.type] || nodeTypes.setor).radius;
    return Math.sqrt((n.x - pos.x) ** 2 + (n.y - pos.y) ** 2) < r;
  });

  const findConn = (pos) => {
    return connections.findIndex(conn => {
      const from = nodes.find(n => n.id === conn.from);
      const to = nodes.find(n => n.id === conn.to);
      if (!from || !to) return false;
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      return Math.sqrt((midX - pos.x) ** 2 + (midY - pos.y) ** 2) < 22;
    });
  };

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    try { canvasRef.current.setPointerCapture?.(e.pointerId); } catch (err) {}
    const pos = getPos(e);
    const node = findNode(pos);
    if (node) {
      if (connecting) {
        if (connecting !== node.id && !connections.find(c => (c.from === connecting && c.to === node.id) || (c.from === node.id && c.to === connecting))) {
          snapshot();
          setConnections(p => [...p, { from: connecting, to: node.id, type: connType, label: connLabel || '' }]);
        }
        setConnecting(null);
      } else {
        setSelected(node.id);
        snapshot();
        setDragging({ id: node.id, offX: pos.x - node.x, offY: pos.y - node.y });
      }
    } else {
      const ci = findConn(pos);
      if (ci >= 0) {
        setEditingConn(ci);
        setEditConnLabel(connections[ci].label || '');
      } else {
        setSelected(null);
        setConnecting(null);
        setEditingConn(null);
      }
    }
  };

  const handlePointerMove = (e) => {
    const pos = getPos(e);
    mousePosRef.current = pos;
    if (dragging) {
      setNodes(p => p.map(n => n.id === dragging.id ? { ...n, x: pos.x - dragging.offX, y: pos.y - dragging.offY } : n));
    }
    const ci = findConn(pos);
    setHoveredConn(ci >= 0 ? ci : null);
  };

  const handlePointerUp = () => setDragging(null);

  const handleDblClick = (e) => {
    const pos = getPos(e);
    const node = findNode(pos);
    if (node) {
      setEditingNode(node.id);
      setEditName(node.name);
    } else {
      // Criar nó rápido no local
      snapshot();
      const id = 'n' + Date.now();
      setNodes(p => [...p, { id, name: 'Novo', type: newNodeType, x: pos.x, y: pos.y }]);
      setEditingNode(id);
      setEditName('');
      setSelected(id);
    }
  };

  const saveEditName = () => {
    if (editingNode && editName.trim()) {
      setNodes(p => p.map(n => n.id === editingNode ? { ...n, name: editName.trim() } : n));
    }
    setEditingNode(null);
  };

  const updateConnLabel = () => {
    if (editingConn !== null) {
      setConnections(p => p.map((c, i) => i === editingConn ? { ...c, label: editConnLabel } : c));
    }
    setEditingConn(null);
  };

  const removeConn = (i) => {
    snapshot();
    setConnections(p => p.filter((_, idx) => idx !== i));
    setEditingConn(null);
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
        Arraste os nós, selecione e use "Conectar" para criar fluxos, clique numa conexão para editar. Toque duas vezes no espaço vazio para criar um nó. Funciona com toque no celular.
      </p>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={newNodeName} onChange={setNewNodeName} placeholder="Nome do nó..." style={{ width: 160 }} />
        <select value={newNodeType} onChange={e => setNewNodeType(e.target.value)} style={selectStyle}>
          {Object.entries(nodeTypes).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <Button variant="secondary" onClick={addNode}>+ Nó</Button>
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
        <select value={connType} onChange={e => setConnType(e.target.value)} style={selectStyle}>
          {connTypes.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <Input value={connLabel} onChange={setConnLabel} placeholder="Rótulo (opcional)" style={{ width: 130 }} />
        {selected && <Button variant="secondary" onClick={() => { setConnecting(selected); setSelected(null); }} style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>⤳ Conectar de "{nodes.find(n=>n.id===selected)?.name}"</Button>}
        {connecting && <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Toque no nó de destino...</span>}
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {(data.setores?.length > 0 || data.programa?.length > 0) && (
          <Button variant="ghost" onClick={importFromData} style={{ fontSize: 12 }}>↓ Importar setores/programa</Button>
        )}
        <Button variant="ghost" onClick={autoArrange} style={{ fontSize: 12 }} disabled={nodes.length < 2}>✨ Organizar</Button>
        <Button variant="ghost" onClick={undo} style={{ fontSize: 12 }} disabled={!history.canUndo()}>↶ Desfazer</Button>
        {selected && (
          <>
            <Button variant="ghost" onClick={() => { setEditingNode(selected); setEditName(nodes.find(n=>n.id===selected)?.name || ''); }} style={{ fontSize: 12 }}>✎ Renomear</Button>
            <Button variant="ghost" onClick={() => removeNode(selected)} style={{ fontSize: 12, color: 'var(--red)' }}>✕ Remover nó</Button>
          </>
        )}
      </div>

      {/* Canvas */}
      <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: 500, background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', cursor: dragging ? 'grabbing' : connecting ? 'crosshair' : 'default' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={handleDblClick}
        />
        {/* Editar nó */}
        {editingNode && (() => {
          const n = nodes.find(nn => nn.id === editingNode);
          if (!n) return null;
          const left = Math.min(Math.max(n.x - 80, 8), (wrapRef.current?.offsetWidth || 800) - 210);
          const top = Math.min(Math.max(n.y - 50, 8), 440);
          return (
            <div style={{ position: 'absolute', left, top, background: 'var(--bg-elevated)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 10, display: 'flex', gap: 6, zIndex: 10, border: '1px solid var(--border-light)' }}>
              <Input value={editName} onChange={setEditName} style={{ width: 130, fontSize: 13, padding: '8px 10px' }} placeholder="Nome do nó" />
              <Button onClick={saveEditName} style={{ padding: '6px 12px', fontSize: 12 }}>OK</Button>
            </div>
          );
        })()}
        {/* Editar conexão */}
        {editingConn !== null && (() => {
          const conn = connections[editingConn];
          if (!conn) return null;
          const from = nodes.find(n => n.id === conn.from);
          const to = nodes.find(n => n.id === conn.to);
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const left = Math.min(Math.max(mx - 100, 8), (wrapRef.current?.offsetWidth || 800) - 230);
          const top = Math.min(Math.max(my + 10, 8), 400);
          return (
            <div style={{ position: 'absolute', left, top, background: 'var(--bg-elevated)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 10, display: 'flex', gap: 8, zIndex: 10, flexDirection: 'column', border: '1px solid var(--border-light)', width: 220 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{from.name} → {to.name}</div>
              <select value={conn.type} onChange={e => { snapshot(); setConnections(p => p.map((c, i) => i === editingConn ? { ...c, type: e.target.value } : c)); }} style={selectStyle}>
                {connTypes.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 6 }}>
                <Input value={editConnLabel} onChange={setEditConnLabel} placeholder="Rótulo" style={{ flex: 1, fontSize: 12, padding: '8px 10px' }} />
                <Button onClick={updateConnLabel} style={{ padding: '5px 10px', fontSize: 11 }}>OK</Button>
              </div>
              <button onClick={() => removeConn(editingConn)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 11, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', padding: 0 }}>✕ Remover conexão</button>
            </div>
          );
        })()}
        {nodes.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.3 }}>⇢</div>
              Adicione nós, importe dos setores<br/>ou toque duas vezes no espaço vazio
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)' }}>
        <span style={{ fontWeight: 600 }}>Nós:</span>
        {Object.entries(nodeTypes).map(([k, v]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.bg, border: `1.5px solid ${v.color}`, display: 'inline-block' }} />
            {v.label}
          </span>
        ))}
        <span style={{ fontWeight: 600, marginLeft: 8 }}>Conexões:</span>
        {connTypes.map(c => (
          <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 18, height: 0, borderTop: `${c.width}px ${c.dash ? 'dashed' : 'solid'} ${c.color}`, display: 'inline-block' }} />
            {c.label}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar fluxograma'}</Button>
        <Button variant="secondary" onClick={() => downloadCanvasPNG(canvasRef.current, 'fluxograma')} disabled={nodes.length === 0}>⬇ PNG</Button>
        <Button variant="ghost" onClick={() => setConfirmClear(true)} disabled={nodes.length === 0}>Limpar</Button>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Limpar o fluxograma?"
        message="Todos os nós e conexões serão removidos (você pode desfazer com Ctrl+Z)."
        confirmLabel="Limpar"
        danger
        onConfirm={() => { snapshot(); setNodes([]); setConnections([]); setConfirmClear(false); }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
};

const selectStyle = { padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13, fontFamily: 'var(--font)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' };

window.FluxogramaTool = FluxogramaTool;
