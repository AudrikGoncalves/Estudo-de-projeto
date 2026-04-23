// ─── Diagrama de Setores (Bubble / Proximity Diagram) ───
// Radius is strictly proportional: circle area = m² * SCALE
const BUBBLE_SCALE = 8; // px² per m² — adjustable

const areaToRadius = (areaSqm) => Math.sqrt((areaSqm * BUBBLE_SCALE) / Math.PI);

const DiagramaSetoresTool = ({ data, onSave }) => {
  const canvasRef = React.useRef(null);
  const [bubbles, setBubbles] = React.useState(() => data.diagramaBubbles || []);
  const [proximities, setProximities] = React.useState(() => data.diagramaProx || []);
  const [dragging, setDragging] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [saved, setSaved] = React.useState(false);
  const [showLabels, setShowLabels] = React.useState(true);
  const [showAreas, setShowAreas] = React.useState(true);
  const [editBubble, setEditBubble] = React.useState(null);
  const [editLabel, setEditLabel] = React.useState('');
  const [scale, setScale] = React.useState(BUBBLE_SCALE);

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

  // Recalc radius when scale changes
  const getRadius = (area) => Math.max(18, Math.sqrt((area * scale) / Math.PI));

  const importBubbles = () => {
    const setores = data.setores || [];
    const predim = data.predimensionamento || [];
    const programa = data.programa || [];
    const newB = [];
    const cx = 400, cy = 260;

    const source = setores.length > 0 ? setores.map((s, i) => {
      const ambList = (s.ambientes || '').split(',').map(a => a.trim()).filter(Boolean);
      const totalArea = ambList.reduce((sum, amb) => {
        const found = predim.find(p => p.ambiente?.toLowerCase() === amb.toLowerCase()) || programa.find(p => p.ambiente?.toLowerCase() === amb.toLowerCase());
        return sum + (parseFloat(found?.areaFinal || found?.area) || 20);
      }, 0);
      return { name: s.nome || `Setor ${i+1}`, area: totalArea || 60 };
    }) : programa.map((p, i) => ({ name: p.ambiente || `Amb ${i+1}`, area: parseFloat(p.area) || 30 }));

    source.forEach((s, i) => {
      const dist = 140 + source.length * 12;
      const angle = (i / source.length) * Math.PI * 2 - Math.PI / 2;
      newB.push({
        id: 'b' + Date.now() + i,
        name: s.name,
        area: s.area,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        colorIdx: i % sectorColors.length,
      });
    });
    if (newB.length) setBubbles(newB);
  };

  const addBubble = (name, area) => {
    if (!name.trim()) return;
    const a = parseFloat(area) || 40;
    setBubbles(p => [...p, {
      id: 'b' + Date.now(),
      name: name.trim(),
      area: a,
      x: 300 + (Math.random() - 0.5) * 200,
      y: 260 + (Math.random() - 0.5) * 160,
      colorIdx: bubbles.length % sectorColors.length,
    }]);
  };

  const removeBubble = (id) => {
    setBubbles(p => p.filter(b => b.id !== id));
    setProximities(p => p.filter(pr => pr.from !== id && pr.to !== id));
    setSelected(null);
  };

  const save = () => {
    onSave({ ...data, diagramaBubbles: bubbles, diagramaProx: proximities });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  // Drawing
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

    // Scale reference
    const refR = getRadius(10);
    ctx.strokeStyle = '#D4D1CA'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(canvas.width - 50, canvas.height - 40, refR, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '400 10px "DM Mono"'; ctx.fillStyle = '#9C988E'; ctx.textAlign = 'center';
    ctx.fillText('10m²', canvas.width - 50, canvas.height - 40 + refR + 14);
    ctx.fillText('Ref.', canvas.width - 50, canvas.height - 40 + 3);

    // Proximity lines
    proximities.forEach(pr => {
      const from = bubbles.find(b => b.id === pr.from);
      const to = bubbles.find(b => b.id === pr.to);
      if (!from || !to) return;
      const pt = proxTypes.find(p => p.id === pr.type) || proxTypes[0];
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = pt.color; ctx.lineWidth = pt.width;
      if (pt.dash) ctx.setLineDash([8, 5]); else ctx.setLineDash([]);
      ctx.stroke(); ctx.setLineDash([]);

      if (pt.cross) {
        const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
        ctx.beginPath(); ctx.moveTo(mx - 7, my - 7); ctx.lineTo(mx + 7, my + 7);
        ctx.moveTo(mx + 7, my - 7); ctx.lineTo(mx - 7, my + 7);
        ctx.strokeStyle = pt.color; ctx.lineWidth = 2.5; ctx.stroke();
      }

      const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
      ctx.font = '500 10px "DM Sans"'; ctx.fillStyle = '#FAF9F7';
      const tw = ctx.measureText(pt.label).width + 8;
      ctx.fillRect(mx - tw/2, my - 16, tw, 14);
      ctx.fillStyle = pt.color; ctx.textAlign = 'center';
      ctx.fillText(pt.label, mx, my - 6);
    });

    // Draw bubbles
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
        ctx.font = `600 ${r > 40 ? 13 : r > 25 ? 11 : 9}px "DM Sans"`;
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
        ctx.font = `400 ${r > 30 ? 10 : 8}px "DM Mono"`;
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
  }, [bubbles, proximities, selected, linking, showLabels, showAreas, scale]);

  React.useEffect(() => { const id = requestAnimationFrame(draw); return () => cancelAnimationFrame(id); }, [draw]);

  const mouseRef = React.useRef(null);
  const getPos = (e) => { const rect = canvasRef.current.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; };
  const findBubble = (pos) => bubbles.find(b => Math.sqrt((b.x - pos.x) ** 2 + (b.y - pos.y) ** 2) < getRadius(b.area));

  const handleMouseDown = (e) => {
    const pos = getPos(e);
    const bubble = findBubble(pos);
    if (bubble) {
      if (linking) {
        if (linking !== bubble.id && !proximities.find(p => (p.from === linking && p.to === bubble.id) || (p.from === bubble.id && p.to === linking))) {
          setProximities(p => [...p, { from: linking, to: bubble.id, type: proxType }]);
        }
        setLinking(null);
      } else {
        setSelected(bubble.id);
        setDragging({ id: bubble.id, offX: pos.x - bubble.x, offY: pos.y - bubble.y });
      }
    } else { setSelected(null); setLinking(null); }
  };

  const handleMouseMove = (e) => {
    const pos = getPos(e); mouseRef.current = pos;
    if (dragging) setBubbles(p => p.map(b => b.id === dragging.id ? { ...b, x: pos.x - dragging.offX, y: pos.y - dragging.offY } : b));
  };
  const handleMouseUp = () => setDragging(null);

  const handleDblClick = (e) => {
    const pos = getPos(e); const b = findBubble(pos);
    if (b) { setEditBubble(b.id); setEditLabel(b.name); }
  };

  const [newName, setNewName] = React.useState('');
  const [newArea, setNewArea] = React.useState('');

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
        As bolhas são <strong>proporcionais à área real</strong>: um setor de 20m² tem o dobro da área visual de um de 10m². Use o controle de escala para ajustar a visualização.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={newName} onChange={setNewName} placeholder="Setor/ambiente..." style={{ width: 160 }} />
        <Input value={newArea} onChange={setNewArea} placeholder="Área m²" style={{ width: 80 }} />
        <Button variant="secondary" onClick={() => { addBubble(newName, newArea); setNewName(''); setNewArea(''); }}>+ Bolha</Button>
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
        <select value={proxType} onChange={e => setProxType(e.target.value)} style={diagramSelectStyle}>
          {proxTypes.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        {selected && <Button variant="secondary" onClick={() => { setLinking(selected); setSelected(null); }} style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: 12 }}>⤳ Relação</Button>}
        {linking && <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Clique no destino...</span>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {(data.setores?.length > 0 || data.programa?.length > 0) && (
          <Button variant="ghost" onClick={importBubbles} style={{ fontSize: 12 }}>↓ Importar dados</Button>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} /> Nomes
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showAreas} onChange={e => setShowAreas(e.target.checked)} /> Áreas
        </label>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          Escala:
          <input type="range" min="2" max="30" step="1" value={scale} onChange={e => setScale(Number(e.target.value))} style={{ width: 100 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{scale}px²/m²</span>
        </label>
        {selected && <Button variant="ghost" onClick={() => removeBubble(selected)} style={{ fontSize: 12, color: 'var(--red)' }}>✕ Remover</Button>}
      </div>

      <div style={{ position: 'relative', width: '100%', height: 500, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', cursor: dragging ? 'grabbing' : linking ? 'crosshair' : 'default' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          onDoubleClick={handleDblClick}
        />
        {editBubble && (() => {
          const b = bubbles.find(bb => bb.id === editBubble);
          if (!b) return null;
          return (
            <div style={{ position: 'absolute', left: b.x - 80, top: b.y - 50, background: 'var(--bg-card)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 10, display: 'flex', gap: 6, zIndex: 10 }}>
              <Input value={editLabel} onChange={setEditLabel} style={{ width: 120, fontSize: 12 }} />
              <Button onClick={() => { setBubbles(p => p.map(bb => bb.id === editBubble ? { ...bb, name: editLabel } : bb)); setEditBubble(null); }} style={{ padding: '5px 10px', fontSize: 11 }}>OK</Button>
            </div>
          );
        })()}
        {bubbles.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.3 }}>⊙</div>
              Adicione bolhas ou importe dos setores<br/>
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

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar diagrama'}</Button>
        <Button variant="ghost" onClick={() => { if(confirm('Limpar tudo?')) { setBubbles([]); setProximities([]); } }}>Limpar</Button>
      </div>
    </div>
  );
};

const diagramSelectStyle = { padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13, fontFamily: 'var(--font)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' };

window.DiagramaSetoresTool = DiagramaSetoresTool;
