// ─── Fluxograma (Neural Network Style) ───
const FluxogramaTool = ({ data, onSave }) => {
  const canvasRef = React.useRef(null);
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
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const animFrame = React.useRef(0);

  // Animation tick
  React.useEffect(() => {
    let running = true;
    const tick = () => { animFrame.current++; if (running) requestAnimationFrame(tick); };
    tick();
    return () => { running = false; };
  }, []);

  const nodeTypes = {
    setor: { color: 'var(--accent)', bg: 'var(--accent-light)', label: 'Setor', radius: 44 },
    ambiente: { color: 'var(--blue)', bg: 'var(--blue-light)', label: 'Ambiente', radius: 34 },
    acesso: { color: 'var(--green)', bg: 'var(--green-light)', label: 'Acesso', radius: 28 },
    circulacao: { color: 'var(--yellow)', bg: 'var(--yellow-light)', label: 'Circulação', radius: 30 },
    externo: { color: 'var(--text-muted)', bg: 'var(--bg-sidebar)', label: 'Externo', radius: 26 },
  };

  const connTypes = [
    { id: 'direto', label: 'Direto', dash: false, width: 2.5 },
    { id: 'indireto', label: 'Indireto', dash: true, width: 1.5 },
    { id: 'restrito', label: 'Restrito', dash: false, width: 2, color: 'var(--red)' },
    { id: 'servico', label: 'Serviço', dash: true, width: 2, color: 'var(--yellow)' },
  ];
  const [connType, setConnType] = React.useState('direto');

  const addNode = () => {
    if (!newNodeName.trim()) return;
    const cx = 400 + (Math.random() - 0.5) * 300;
    const cy = 280 + (Math.random() - 0.5) * 200;
    setNodes(p => [...p, { id: 'n' + Date.now(), name: newNodeName.trim(), type: newNodeType, x: cx, y: cy }]);
    setNewNodeName('');
  };

  const importFromData = () => {
    const setores = data.setores || [];
    const programa = data.programa || [];
    const newNodes = [];
    let yOff = 80;
    setores.forEach((s, i) => {
      if (s.nome) {
        newNodes.push({ id: 'ns' + i, name: s.nome, type: 'setor', x: 160 + i * 200, y: yOff });
        const ambientes = (s.ambientes || '').split(',').map(a => a.trim()).filter(Boolean);
        ambientes.forEach((a, j) => {
          newNodes.push({ id: 'na' + i + '_' + j, name: a, type: 'ambiente', x: 100 + i * 200 + (j % 3) * 80, y: yOff + 100 + Math.floor(j / 3) * 80 });
        });
      }
    });
    if (newNodes.length === 0 && programa.length > 0) {
      programa.forEach((p, i) => {
        if (p.ambiente) newNodes.push({ id: 'np' + i, name: p.ambiente, type: 'ambiente', x: 80 + (i % 5) * 150, y: 80 + Math.floor(i / 5) * 120 });
      });
    }
    if (newNodes.length > 0) setNodes(newNodes);
  };

  const removeNode = (id) => {
    setNodes(p => p.filter(n => n.id !== id));
    setConnections(p => p.filter(c => c.from !== id && c.to !== id));
    setSelected(null);
  };

  const save = () => {
    onSave({ ...data, fluxogramaNodes: nodes, fluxogramaConns: connections });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  // Canvas drawing
  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid dots
    ctx.fillStyle = '#E5E2DB';
    for (let x = 20; x < canvas.width; x += 30) {
      for (let y = 20; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.arc(x, y, 0.8, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Draw connections
    connections.forEach((conn, ci) => {
      const from = nodes.find(n => n.id === conn.from);
      const to = nodes.find(n => n.id === conn.to);
      if (!from || !to) return;

      const ct = connTypes.find(c => c.id === conn.type) || connTypes[0];
      const isHovered = hoveredConn === ci;
      const isEditing = editingConn === ci;

      // Curved line
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const curvature = Math.min(dist * 0.15, 40);
      const perpX = -dy / dist * curvature;
      const perpY = dx / dist * curvature;
      const cpX = midX + perpX;
      const cpY = midY + perpY;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(cpX, cpY, to.x, to.y);
      ctx.strokeStyle = ct.color || (isHovered || isEditing ? 'var(--accent)' : '#A09D94');
      ctx.lineWidth = isHovered ? ct.width + 1.5 : ct.width;
      if (ct.dash) ctx.setLineDash([6, 4]); else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Animated particles along connection
      const t = ((animFrame.current * 0.008 + ci * 0.3) % 1);
      const px = (1-t)*(1-t)*from.x + 2*(1-t)*t*cpX + t*t*to.x;
      const py = (1-t)*(1-t)*from.y + 2*(1-t)*t*cpY + t*t*to.y;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = ct.color || 'var(--accent)';
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Arrow at endpoint
      const t2 = 0.95;
      const ax = (1-t2)*(1-t2)*from.x + 2*(1-t2)*t2*cpX + t2*t2*to.x;
      const ay = (1-t2)*(1-t2)*from.y + 2*(1-t2)*t2*cpY + t2*t2*to.y;
      const angle = Math.atan2(to.y - ay, to.x - ax);
      ctx.beginPath();
      ctx.moveTo(to.x - Math.cos(angle - 0.4) * 12, to.y - Math.sin(angle - 0.4) * 12);
      ctx.lineTo(to.x, to.y);
      ctx.lineTo(to.x - Math.cos(angle + 0.4) * 12, to.y - Math.sin(angle + 0.4) * 12);
      ctx.strokeStyle = ct.color || '#A09D94';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Connection label
      if (conn.label) {
        ctx.font = '500 11px "DM Sans"';
        ctx.fillStyle = ct.color || 'var(--text-secondary)';
        ctx.textAlign = 'center';
        const labelX = cpX; const labelY = cpY - 8;
        ctx.fillStyle = '#FAF9F7';
        const tw = ctx.measureText(conn.label).width + 10;
        ctx.fillRect(labelX - tw/2, labelY - 8, tw, 16);
        ctx.fillStyle = ct.color || 'var(--text-secondary)';
        ctx.fillText(conn.label, labelX, labelY + 4);
      }
    });

    // Connecting line preview
    if (connecting) {
      const from = nodes.find(n => n.id === connecting);
      if (from) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.strokeStyle = 'var(--accent)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw nodes
    nodes.forEach(node => {
      const nt = nodeTypes[node.type] || nodeTypes.setor;
      const r = nt.radius;
      const isSel = selected === node.id;
      const isConn = connecting === node.id;

      // Glow for selected
      if (isSel || isConn) {
        ctx.beginPath(); ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = nt.bg; ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
      }

      // Outer ring
      ctx.beginPath(); ctx.arc(node.x, node.y, r + 2, 0, Math.PI * 2);
      ctx.fillStyle = isSel ? nt.color : 'transparent';
      ctx.globalAlpha = 0.15; ctx.fill(); ctx.globalAlpha = 1;

      // Main circle
      ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = isSel ? nt.color : '#D4D1CA';
      ctx.lineWidth = isSel ? 2.5 : 1.5;
      ctx.stroke();

      // Inner accent ring
      ctx.beginPath(); ctx.arc(node.x, node.y, r - 4, 0, Math.PI * 2);
      ctx.fillStyle = nt.bg;
      ctx.fill();

      // Label
      ctx.font = `600 ${r > 36 ? 12 : 10}px "DM Sans"`;
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

      // Type indicator
      ctx.font = '500 9px "DM Sans"';
      ctx.fillStyle = '#9C988E';
      ctx.fillText(nt.label, node.x, node.y + r + 14);
    });

    requestAnimationFrame(draw);
  }, [nodes, connections, selected, connecting, hoveredConn, editingConn, mousePos]);

  React.useEffect(() => { const id = requestAnimationFrame(draw); return () => cancelAnimationFrame(id); }, [draw]);

  // Mouse handlers
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
      return Math.sqrt((midX - pos.x) ** 2 + (midY - pos.y) ** 2) < 20;
    });
  };

  const handleMouseDown = (e) => {
    const pos = getPos(e);
    const node = findNode(pos);
    if (node) {
      if (connecting) {
        if (connecting !== node.id && !connections.find(c => (c.from === connecting && c.to === node.id) || (c.from === node.id && c.to === connecting))) {
          setConnections(p => [...p, { from: connecting, to: node.id, type: connType, label: connLabel || '' }]);
        }
        setConnecting(null);
      } else {
        setSelected(node.id);
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

  const handleMouseMove = (e) => {
    const pos = getPos(e);
    setMousePos(pos);
    if (dragging) {
      setNodes(p => p.map(n => n.id === dragging.id ? { ...n, x: pos.x - dragging.offX, y: pos.y - dragging.offY } : n));
    }
    const ci = findConn(pos);
    setHoveredConn(ci >= 0 ? ci : null);
  };

  const handleMouseUp = () => setDragging(null);

  const handleDblClick = (e) => {
    const pos = getPos(e);
    const node = findNode(pos);
    if (node) {
      setEditingNode(node.id);
      setEditName(node.name);
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
    setConnections(p => p.filter((_, idx) => idx !== i));
    setEditingConn(null);
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={newNodeName} onChange={setNewNodeName} placeholder="Nome do nó..." style={{ width: 180 }} />
        <select value={newNodeType} onChange={e => setNewNodeType(e.target.value)} style={selectStyle}>
          {Object.entries(nodeTypes).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <Button variant="secondary" onClick={addNode}>+ Nó</Button>
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
        <select value={connType} onChange={e => setConnType(e.target.value)} style={selectStyle}>
          {connTypes.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <Input value={connLabel} onChange={setConnLabel} placeholder="Rótulo (opcional)" style={{ width: 140 }} />
        {selected && <Button variant="secondary" onClick={() => { setConnecting(selected); setSelected(null); }} style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>⤳ Conectar de "{nodes.find(n=>n.id===selected)?.name}"</Button>}
        {connecting && <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Clique no nó de destino...</span>}
      </div>

      {/* Import + actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(data.setores?.length > 0 || data.programa?.length > 0) && (
          <Button variant="ghost" onClick={importFromData} style={{ fontSize: 12 }}>↓ Importar setores/programa</Button>
        )}
        {selected && (
          <>
            <Button variant="ghost" onClick={() => { setEditingNode(selected); setEditName(nodes.find(n=>n.id===selected)?.name || ''); }} style={{ fontSize: 12 }}>✎ Renomear</Button>
            <Button variant="ghost" onClick={() => removeNode(selected)} style={{ fontSize: 12, color: 'var(--red)' }}>✕ Remover nó</Button>
          </>
        )}
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative', width: '100%', height: 500, background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', cursor: dragging ? 'grabbing' : connecting ? 'crosshair' : 'default' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDblClick}
        />
        {/* Edit node overlay */}
        {editingNode && (() => {
          const n = nodes.find(nn => nn.id === editingNode);
          if (!n) return null;
          return (
            <div style={{ position: 'absolute', left: n.x - 80, top: n.y - 50, background: 'var(--bg-card)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 10, display: 'flex', gap: 6, zIndex: 10 }}>
              <Input value={editName} onChange={setEditName} style={{ width: 130, fontSize: 13 }} />
              <Button onClick={saveEditName} style={{ padding: '6px 12px', fontSize: 12 }}>OK</Button>
            </div>
          );
        })()}
        {/* Edit conn overlay */}
        {editingConn !== null && (() => {
          const conn = connections[editingConn];
          if (!conn) return null;
          const from = nodes.find(n => n.id === conn.from);
          const to = nodes.find(n => n.id === conn.to);
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          return (
            <div style={{ position: 'absolute', left: mx - 100, top: my + 10, background: 'var(--bg-card)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 10, display: 'flex', gap: 6, zIndex: 10, flexDirection: 'column' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{from.name} → {to.name}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Input value={editConnLabel} onChange={setEditConnLabel} placeholder="Rótulo" style={{ width: 120, fontSize: 12 }} />
                <Button onClick={updateConnLabel} style={{ padding: '5px 10px', fontSize: 11 }}>OK</Button>
              </div>
              <button onClick={() => removeConn(editingConn)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 11, cursor: 'pointer', textAlign: 'left' }}>Remover conexão</button>
            </div>
          );
        })()}
        {nodes.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.3 }}>⇢</div>
              Adicione nós para começar o fluxograma<br/>
              <span style={{ fontSize: 12 }}>ou importe dos setores/programa</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
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
            <span style={{ width: 18, height: 0, borderTop: `${c.width}px ${c.dash ? 'dashed' : 'solid'} ${c.color || '#A09D94'}`, display: 'inline-block' }} />
            {c.label}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar fluxograma'}</Button>
        <Button variant="ghost" onClick={() => { if(confirm('Limpar tudo?')) { setNodes([]); setConnections([]); } }}>Limpar</Button>
      </div>
    </div>
  );
};

const selectStyle = { padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13, fontFamily: 'var(--font)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' };

window.FluxogramaTool = FluxogramaTool;
