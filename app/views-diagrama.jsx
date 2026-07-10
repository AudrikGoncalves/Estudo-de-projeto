// ─── Diagrama de Setores (Bubble / Proximity Diagram) ───
// Raio estritamente proporcional: área do círculo = m² * ESCALA
const BUBBLE_SCALE = 8; // px² por m² — ajustável

const DiagramaSetoresTool = ({ data, onSave }) => {
  const canvasRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const [bubbles, setBubbles] = React.useState(() => data.diagramaBubbles || []);
  const [proximities, setProximities] = React.useState(() => data.diagramaProx || []);
  const [dragging, setDragging] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [saved, setSaved] = React.useState(false);
  const [showLabels, setShowLabels] = React.useState(true);
  const [showAreas, setShowAreas] = React.useState(true);
  const [editBubble, setEditBubble] = React.useState(null); // { id, name, area } — edição em curso
  const [editProx, setEditProx] = React.useState(null); // índice da relação em edição
  const [scale, setScale] = React.useState(BUBBLE_SCALE);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const history = useCanvasHistory();

  const sectorColors = [
    { bg: 'oklch(0.92 0.06 30)', fill: 'oklch(0.82 0.08 30)', stroke: 'oklch(0.55 0.15 30)', text: 'oklch(0.40 0.12 30)' },
    { bg: 'oklch(0.92 0.06 250)', fill: 'oklch(0.82 0.08 250)', stroke: 'oklch(0.55 0.12 250)', text: 'oklch(0.40 0.10 250)' },
    { bg: 'oklch(0.92 0.06 155)', fill: 'oklch(0.82 0.08 155)', stroke: 'oklch(0.55 0.12 155)', text: 'oklch(0.40 0.10 155)' },
    { bg: 'oklch(0.94 0.05 85)', fill: 'oklch(0.86 0.07 85)', stroke: 'oklch(0.60 0.12 85)', text: 'oklch(0.40 0.10 85)' },
    { bg: 'oklch(0.92 0.06 320)', fill: 'oklch(0.82 0.08 320)', stroke: 'oklch(0.55 0.12 320)', text: 'oklch(0.40 0.10 320)' },
    { bg: 'oklch(0.92 0.06 190)', fill: 'oklch(0.82 0.08 190)', stroke: 'oklch(0.55 0.12 190)', text: 'oklch(0.40 0.10 190)' },
  ];

  const proxTypes = [
    { id: 'essencial', label: 'Essencial', width: 4, color: 'oklch(0.45 0.15 30)', dash: false },
    { id: 'desejavel', label: 'Desejável', width: 2.5, color: 'oklch(0.55 0.12 250)', dash: false },
    { id: 'indiferente', label: 'Indiferente', width: 1.5, color: '#B0ADA5', dash: true },
    { id: 'indesejavel', label: 'Indesejável', width: 3, color: 'oklch(0.50 0.18 25)', dash: false, cross: true },
  ];
  const [proxType, setProxType] = React.useState('essencial');
  const [linking, setLinking] = React.useState(null);

  const getRadius = (area) => Math.max(18, Math.sqrt((area * scale) / Math.PI));
  const snapshot = () => history.push({ bubbles, proximities });

  const undo = () => {
    const prev = history.undo();
    if (prev) { setBubbles(prev.bubbles); setProximities(prev.proximities); setSelected(null); setLinking(null); }
  };

  // Ctrl+Z / Delete
  React.useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) { e.preventDefault(); removeBubble(selected); }
      if (e.key === 'Escape') { setLinking(null); setEditBubble(null); setEditProx(null); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const importBubbles = () => {
    const setores = data.setores || [];
    const predim = data.predimensionamento || [];
    const programa = data.programa || [];
    const cx = 400, cy = 260;

    const source = setores.length > 0 ? setores.map((s, i) => {
      const ambList = (s.ambientes || '').split(',').map(a => a.trim()).filter(Boolean);
      const totalArea = ambList.reduce((sum, amb) => {
        const found = predim.find(p => p.ambiente?.toLowerCase() === amb.toLowerCase()) || programa.find(p => p.ambiente?.toLowerCase() === amb.toLowerCase());
        return sum + (parseFloat(found?.areaFinal || found?.area) || 20);
      }, 0);
      return { name: s.nome || `Setor ${i+1}`, area: totalArea || 60 };
    }) : programa.map((p, i) => ({ name: p.ambiente || `Amb ${i+1}`, area: parseFloat(p.area) || 30 }));

    if (!source.length) return;
    snapshot();
    const newB = source.map((s, i) => {
      const dist = 140 + source.length * 12;
      const angle = (i / source.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id: 'b' + Date.now() + i,
        name: s.name, area: s.area,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        colorIdx: i % sectorColors.length,
      };
    });
    setBubbles(newB);
    setProximities([]);
  };

  const addBubbleAt = (name, area, x, y) => {
    snapshot();
    const b = {
      id: 'b' + Date.now(),
      name: name || 'Novo setor',
      area: parseFloat(area) || 40,
      x, y,
      colorIdx: bubbles.length % sectorColors.length,
    };
    setBubbles(p => [...p, b]);
    return b;
  };

  const removeBubble = (id) => {
    snapshot();
    setBubbles(p => p.filter(b => b.id !== id));
    setProximities(p => p.filter(pr => pr.from !== id && pr.to !== id));
    setSelected(null);
    setEditBubble(null);
  };

  const autoArrange = () => {
    if (bubbles.length < 2) return;
    snapshot();
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 800;
    const h = canvas ? canvas.height : 500;
    const pos = forceLayout(bubbles, proximities, { width: w, height: h, getRadius: b => getRadius(b.area) });
    setBubbles(p => p.map(b => ({ ...b, x: pos[b.id].x, y: pos[b.id].y })));
  };

  const save = () => {
    onSave({ ...data, diagramaBubbles: bubbles, diagramaProx: proximities });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  // Distância ponto → segmento (para clicar na linha da relação)
  const distToSegment = (p, a, b) => {
    const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)));
  };

  const findProx = (pos) => proximities.findIndex(pr => {
    const from = bubbles.find(b => b.id === pr.from);
    const to = bubbles.find(b => b.id === pr.to);
    if (!from || !to) return false;
    return distToSegment(pos, from, to) < 9;
  });

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

    // Referência de escala
    const refR = getRadius(10);
    ctx.strokeStyle = '#D4D1CA'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(canvas.width - 50, canvas.height - 40, refR, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '400 10px "JetBrains Mono", monospace'; ctx.fillStyle = '#9C988E'; ctx.textAlign = 'center';
    ctx.fillText('10m²', canvas.width - 50, canvas.height - 40 + refR + 14);
    ctx.fillText('Ref.', canvas.width - 50, canvas.height - 40 + 3);

    // Relações
    proximities.forEach((pr, idx) => {
      const from = bubbles.find(b => b.id === pr.from);
      const to = bubbles.find(b => b.id === pr.to);
      if (!from || !to) return;
      const pt = proxTypes.find(p => p.id === pr.type) || proxTypes[0];
      const isEditing = editProx === idx;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = pt.color; ctx.lineWidth = isEditing ? pt.width + 2 : pt.width;
      if (pt.dash) ctx.setLineDash([8, 5]); else ctx.setLineDash([]);
      ctx.stroke(); ctx.setLineDash([]);

      const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
      if (pt.cross) {
        ctx.beginPath(); ctx.moveTo(mx - 7, my - 7); ctx.lineTo(mx + 7, my + 7);
        ctx.moveTo(mx + 7, my - 7); ctx.lineTo(mx - 7, my + 7);
        ctx.strokeStyle = pt.color; ctx.lineWidth = 2.5; ctx.stroke();
      }

      ctx.font = '500 10px "Inter", sans-serif'; ctx.fillStyle = '#FAF9F7';
      const tw = ctx.measureText(pt.label).width + 8;
      ctx.fillRect(mx - tw/2, my - 16, tw, 14);
      ctx.fillStyle = pt.color; ctx.textAlign = 'center';
      ctx.fillText(pt.label, mx, my - 6);
    });

    // Bolhas
    bubbles.forEach(b => {
      const c = sectorColors[b.colorIdx] || sectorColors[0];
      const r = getRadius(b.area);
      const isSel = selected === b.id;
      const isLink = linking === b.id;

      ctx.beginPath(); ctx.arc(b.x + 2, b.y + 2, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.04)'; ctx.fill();

      if (isSel || isLink) {
        ctx.beginPath(); ctx.arc(b.x, b.y, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = c.fill; ctx.globalAlpha = 0.4; ctx.fill(); ctx.globalAlpha = 1;
      }

      ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fillStyle = c.bg; ctx.fill();
      ctx.strokeStyle = c.stroke; ctx.lineWidth = isSel ? 3 : 1.5; ctx.stroke();

      const grad = ctx.createRadialGradient(b.x - r * 0.3, b.y - r * 0.3, 0, b.x, b.y, r);
      grad.addColorStop(0, 'rgba(255,255,255,0.3)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(b.x, b.y, r - 1, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();

      if (showLabels) {
        ctx.font = `600 ${r > 40 ? 13 : r > 25 ? 11 : 9}px "Inter", sans-serif`;
        ctx.fillStyle = c.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const words = b.name.split(' ');
        if (words.length > 1 && r > 35) {
          ctx.fillText(words[0], b.x, b.y - 7);
          ctx.fillText(words.slice(1).join(' '), b.x, b.y + 8);
        } else {
          ctx.fillText(b.name, b.x, showAreas ? b.y - (r > 30 ? 5 : 3) : b.y);
        }
      }

      if (showAreas && b.area) {
        ctx.font = `400 ${r > 30 ? 10 : 8}px "JetBrains Mono", monospace`;
        ctx.fillStyle = c.stroke; ctx.globalAlpha = 0.7;
        ctx.fillText(`${b.area}m²`, b.x, b.y + (showLabels && r > 35 ? 18 : r > 25 ? 10 : 6));
        ctx.globalAlpha = 1;
      }
    });

    if (linking) {
      const from = bubbles.find(b => b.id === linking);
      if (from && mouseRef.current) {
        ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
        ctx.strokeStyle = 'oklch(0.55 0.15 30)'; ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
      }
    }
  }, [bubbles, proximities, selected, linking, showLabels, showAreas, scale, editProx]);

  React.useEffect(() => { const id = requestAnimationFrame(draw); return () => cancelAnimationFrame(id); }, [draw]);

  const mouseRef = React.useRef(null);
  const getPos = (e) => { const rect = canvasRef.current.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; };
  const findBubble = (pos) => bubbles.find(b => Math.sqrt((b.x - pos.x) ** 2 + (b.y - pos.y) ** 2) < getRadius(b.area));

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    try { canvasRef.current.setPointerCapture?.(e.pointerId); } catch (err) {}
    const pos = getPos(e);
    const bubble = findBubble(pos);
    if (bubble) {
      setEditProx(null);
      if (linking) {
        if (linking !== bubble.id && !proximities.find(p => (p.from === linking && p.to === bubble.id) || (p.from === bubble.id && p.to === linking))) {
          snapshot();
          setProximities(p => [...p, { from: linking, to: bubble.id, type: proxType }]);
        }
        setLinking(null);
      } else {
        setSelected(bubble.id);
        snapshot();
        setDragging({ id: bubble.id, offX: pos.x - bubble.x, offY: pos.y - bubble.y });
      }
    } else {
      const pi = findProx(pos);
      if (pi >= 0) { setEditProx(pi); setSelected(null); setLinking(null); }
      else { setSelected(null); setLinking(null); setEditProx(null); }
    }
  };

  const handlePointerMove = (e) => {
    const pos = getPos(e); mouseRef.current = pos;
    if (dragging) setBubbles(p => p.map(b => b.id === dragging.id ? { ...b, x: pos.x - dragging.offX, y: pos.y - dragging.offY } : b));
  };
  const handlePointerUp = () => setDragging(null);

  const handleDblClick = (e) => {
    const pos = getPos(e); const b = findBubble(pos);
    if (b) setEditBubble({ id: b.id, name: b.name, area: String(b.area) });
    else {
      const nb = addBubbleAt('', 40, pos.x, pos.y);
      setEditBubble({ id: nb.id, name: '', area: '40' });
      setSelected(nb.id);
    }
  };

  const applyEditBubble = () => {
    if (!editBubble) return;
    setBubbles(p => p.map(bb => bb.id === editBubble.id ? { ...bb, name: editBubble.name.trim() || bb.name, area: parseFloat(editBubble.area) || bb.area } : bb));
    setEditBubble(null);
  };

  const cycleColor = (id) => {
    setBubbles(p => p.map(b => b.id === id ? { ...b, colorIdx: (b.colorIdx + 1) % sectorColors.length } : b));
  };

  const [newName, setNewName] = React.useState('');
  const [newArea, setNewArea] = React.useState('');

  const selectedBubble = selected ? bubbles.find(b => b.id === selected) : null;

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
        As bolhas são <strong>proporcionais à área real</strong>. Arraste para posicionar, toque duas vezes para editar (ou criar no espaço vazio), clique numa linha para editar a relação. Funciona com toque no celular.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={newName} onChange={setNewName} placeholder="Setor/ambiente..." style={{ width: 160 }} />
        <Input value={newArea} onChange={setNewArea} placeholder="Área m²" style={{ width: 80 }} />
        <Button variant="secondary" onClick={() => { if (newName.trim()) { addBubbleAt(newName.trim(), newArea, 300 + (Math.random()-0.5)*200, 260 + (Math.random()-0.5)*160); setNewName(''); setNewArea(''); } }}>+ Bolha</Button>
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
        <select value={proxType} onChange={e => setProxType(e.target.value)} style={diagramSelectStyle}>
          {proxTypes.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        {selected && <Button variant="secondary" onClick={() => { setLinking(selected); setSelected(null); }} style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: 12 }}>⤳ Relação</Button>}
        {linking && <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Toque no destino...</span>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {(data.setores?.length > 0 || data.programa?.length > 0) && (
          <Button variant="ghost" onClick={importBubbles} style={{ fontSize: 12 }}>↓ Importar dados</Button>
        )}
        <Button variant="ghost" onClick={autoArrange} style={{ fontSize: 12 }} disabled={bubbles.length < 2}>✨ Organizar</Button>
        <Button variant="ghost" onClick={undo} style={{ fontSize: 12 }} disabled={!history.canUndo()}>↶ Desfazer</Button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} /> Nomes
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showAreas} onChange={e => setShowAreas(e.target.checked)} /> Áreas
        </label>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          Escala:
          <input type="range" min="2" max="30" step="1" value={scale} onChange={e => setScale(Number(e.target.value))} style={{ width: 100 }} />
        </label>
        {selectedBubble && (
          <>
            <Button variant="ghost" onClick={() => cycleColor(selected)} style={{ fontSize: 12 }}>🎨 Cor</Button>
            <Button variant="ghost" onClick={() => setEditBubble({ id: selected, name: selectedBubble.name, area: String(selectedBubble.area) })} style={{ fontSize: 12 }}>✎ Editar</Button>
            <Button variant="ghost" onClick={() => removeBubble(selected)} style={{ fontSize: 12, color: 'var(--red)' }}>✕ Remover</Button>
          </>
        )}
      </div>

      <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: 500, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', cursor: dragging ? 'grabbing' : linking ? 'crosshair' : 'default' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', touchAction: 'none' }}
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
          onDoubleClick={handleDblClick}
        />
        {/* Popup: editar bolha */}
        {editBubble && (() => {
          const b = bubbles.find(bb => bb.id === editBubble.id);
          if (!b) return null;
          const left = Math.min(Math.max(b.x - 110, 8), (wrapRef.current?.offsetWidth || 800) - 240);
          const top = Math.min(Math.max(b.y - 70, 8), 400);
          return (
            <div style={{ position: 'absolute', left, top, background: 'var(--bg-elevated)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid var(--border-light)', width: 230 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <Input value={editBubble.name} onChange={v => setEditBubble(p => ({ ...p, name: v }))} placeholder="Nome" style={{ flex: 1, fontSize: 12, padding: '8px 10px' }} />
                <Input value={editBubble.area} onChange={v => setEditBubble(p => ({ ...p, area: v }))} placeholder="m²" style={{ width: 60, fontSize: 12, padding: '8px 10px' }} />
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {sectorColors.map((c, i) => (
                  <button key={i} onClick={() => setBubbles(p => p.map(bb => bb.id === editBubble.id ? { ...bb, colorIdx: i } : bb))}
                    style={{ width: 20, height: 20, minHeight: 20, borderRadius: '50%', background: c.fill, border: b.colorIdx === i ? `2px solid ${c.stroke}` : '1px solid var(--border)', cursor: 'pointer', padding: 0 }} />
                ))}
                <Button onClick={applyEditBubble} style={{ padding: '5px 12px', fontSize: 11, marginLeft: 'auto' }}>OK</Button>
              </div>
            </div>
          );
        })()}
        {/* Popup: editar relação */}
        {editProx !== null && proximities[editProx] && (() => {
          const pr = proximities[editProx];
          const from = bubbles.find(b => b.id === pr.from);
          const to = bubbles.find(b => b.id === pr.to);
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
          const left = Math.min(Math.max(mx - 100, 8), (wrapRef.current?.offsetWidth || 800) - 220);
          const top = Math.min(Math.max(my + 12, 8), 400);
          return (
            <div style={{ position: 'absolute', left, top, background: 'var(--bg-elevated)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid var(--border-light)', width: 210 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{from.name} ↔ {to.name}</div>
              <select value={pr.type} onChange={e => { snapshot(); setProximities(p => p.map((x, i) => i === editProx ? { ...x, type: e.target.value } : x)); }} style={diagramSelectStyle}>
                {proxTypes.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => { snapshot(); setProximities(p => p.filter((_, i) => i !== editProx)); setEditProx(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 11, cursor: 'pointer', padding: 0, fontFamily: 'var(--font)' }}>✕ Remover relação</button>
                <button onClick={() => setEditProx(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', padding: 0, fontFamily: 'var(--font)' }}>Fechar</button>
              </div>
            </div>
          );
        })()}
        {bubbles.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.3 }}>⊙</div>
              Adicione bolhas, importe dos setores<br/>ou toque duas vezes no espaço vazio<br/>
              <span style={{ fontSize: 12 }}>O tamanho é proporcional à área real (m²)</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600 }}>Relações:</span>
        {proxTypes.map(p => (
          <span key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 20, height: 0, borderTop: `${p.width}px ${p.dash ? 'dashed' : 'solid'} ${p.color}`, display: 'inline-block' }} />
            {p.cross && <span style={{ color: p.color, fontWeight: 700, fontSize: 10 }}>✕</span>}
            {p.label}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar diagrama'}</Button>
        <Button variant="secondary" onClick={() => downloadCanvasPNG(canvasRef.current, 'diagrama-de-setores')} disabled={bubbles.length === 0}>⬇ PNG</Button>
        <Button variant="ghost" onClick={() => setConfirmClear(true)} disabled={bubbles.length === 0}>Limpar</Button>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Limpar o diagrama?"
        message="Todas as bolhas e relações serão removidas (você pode desfazer com Ctrl+Z)."
        confirmLabel="Limpar"
        danger
        onConfirm={() => { snapshot(); setBubbles([]); setProximities([]); setConfirmClear(false); }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
};

const diagramSelectStyle = { padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13, fontFamily: 'var(--font)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' };

window.DiagramaSetoresTool = DiagramaSetoresTool;
