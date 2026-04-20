// ─── Estudo de Papéis (Scaled rectangles on lot) ───
const EstudoPapeisTool = ({ data, onSave }) => {
  const canvasRef = React.useRef(null);
  const [saved, setSaved] = React.useState(false);

  // Lot config
  const [lotW, setLotW] = React.useState(() => data.papeis?.lotW || 12);
  const [lotH, setLotH] = React.useState(() => data.papeis?.lotH || 30);
  const [recuoFrente, setRecuoFrente] = React.useState(() => data.papeis?.recuoFrente || 0);
  const [recuoFundos, setRecuoFundos] = React.useState(() => data.papeis?.recuoFundos || 0);
  const [recuoEsq, setRecuoEsq] = React.useState(() => data.papeis?.recuoEsq || 0);
  const [recuoDir, setRecuoDir] = React.useState(() => data.papeis?.recuoDir || 0);

  // Rooms (papéis)
  const [rooms, setRooms] = React.useState(() => data.papeis?.rooms || []);
  const [dragging, setDragging] = React.useState(null);
  const [resizing, setResizing] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [newName, setNewName] = React.useState('');
  const [newArea, setNewArea] = React.useState('');
  const [editRoom, setEditRoom] = React.useState(null);
  const [editName, setEditName] = React.useState('');
  const [showGrid, setShowGrid] = React.useState(true);
  const [showDims, setShowDims] = React.useState(true);
  const [snap, setSnap] = React.useState(true);
  const [floor, setFloor] = React.useState(0); // multi-floor support

  const roomColors = [
    { bg: 'rgba(194,120,86,0.25)', stroke: 'oklch(0.55 0.15 30)', text: 'oklch(0.40 0.12 30)' },
    { bg: 'rgba(86,130,194,0.25)', stroke: 'oklch(0.55 0.12 250)', text: 'oklch(0.40 0.10 250)' },
    { bg: 'rgba(86,160,120,0.25)', stroke: 'oklch(0.55 0.12 155)', text: 'oklch(0.40 0.10 155)' },
    { bg: 'rgba(180,160,80,0.25)', stroke: 'oklch(0.60 0.12 85)', text: 'oklch(0.40 0.10 85)' },
    { bg: 'rgba(160,86,160,0.25)', stroke: 'oklch(0.55 0.12 320)', text: 'oklch(0.40 0.10 320)' },
    { bg: 'rgba(86,160,170,0.25)', stroke: 'oklch(0.55 0.12 190)', text: 'oklch(0.40 0.10 190)' },
  ];

  // Canvas metrics: how many px = 1m
  const CANVAS_W = 800;
  const CANVAS_H = 560;
  const PADDING = 60;

  const getPxPerM = () => {
    const maxLotDim = Math.max(lotW, lotH);
    if (maxLotDim <= 0) return 20;
    return Math.min((CANVAS_W - PADDING * 2) / lotW, (CANVAS_H - PADDING * 2) / lotH);
  };

  const pxPerM = getPxPerM();
  const lotPxW = lotW * pxPerM;
  const lotPxH = lotH * pxPerM;
  const lotX0 = (CANVAS_W - lotPxW) / 2;
  const lotY0 = (CANVAS_H - lotPxH) / 2;

  // Convert meters to canvas px
  const m2px = (m) => m * pxPerM;
  // Convert px to meters
  const px2m = (px) => px / pxPerM;

  const snapToGrid = (val, gridM = 0.5) => snap ? Math.round(val / gridM) * gridM : val;

  const addRoom = () => {
    if (!newName.trim()) return;
    const area = parseFloat(newArea) || 10;
    // Default to a roughly square room
    const side = Math.sqrt(area);
    const w = Math.round(side * 2) / 2; // snap to 0.5m
    const h = Math.round((area / w) * 2) / 2;
    setRooms(p => [...p, {
      id: 'r' + Date.now(),
      name: newName.trim(),
      area: area,
      // Position in METERS relative to lot origin
      mx: 1, my: 1,
      mw: w, mh: h,
      floor: floor,
      colorIdx: rooms.length % roomColors.length,
    }]);
    setNewName(''); setNewArea('');
  };

  const importRooms = () => {
    const programa = data.programa || [];
    const predim = data.predimensionamento || [];
    const newR = [];
    let col = 0, row = 0, maxRowH = 0;
    const startX = parseFloat(recuoEsq) || 0;
    const startY = parseFloat(recuoFrente) || 0;
    const maxW = lotW - (parseFloat(recuoEsq) || 0) - (parseFloat(recuoDir) || 0);

    const source = predim.length > 0 ? predim : programa;
    source.forEach((p, i) => {
      const name = p.ambiente || `Amb ${i+1}`;
      const area = parseFloat(p.areaFinal || p.area) || 10;
      const side = Math.sqrt(area);
      const w = Math.max(2, Math.round(side * 2) / 2);
      const h = Math.max(2, Math.round((area / w) * 2) / 2);

      if (col + w > maxW && col > 0) { col = 0; row += maxRowH + 0.5; maxRowH = 0; }
      newR.push({
        id: 'r' + Date.now() + i, name, area, mx: startX + col, my: startY + row,
        mw: w, mh: h, floor: 0, colorIdx: i % roomColors.length,
      });
      col += w + 0.5;
      maxRowH = Math.max(maxRowH, h);
    });
    if (newR.length) setRooms(newR);
  };

  const removeRoom = (id) => { setRooms(p => p.filter(r => r.id !== id)); setSelected(null); };

  // Import lot from legislação
  const importLot = () => {
    const leg = data.legislacaoData || {};
    const viab = data.viabilidade || {};
    if (viab.areaTerreno) {
      const a = parseFloat(viab.areaTerreno);
      // Guess dimensions (assume roughly 1:2.5 ratio)
      const w = Math.round(Math.sqrt(a / 2.5));
      const h = Math.round(a / w);
      setLotW(w); setLotH(h);
    }
    if (leg.recuo_frente) setRecuoFrente(parseFloat(leg.recuo_frente) || 0);
    if (leg.recuo_fundos) setRecuoFundos(parseFloat(leg.recuo_fundos) || 0);
    if (leg.recuo_lat_esq) setRecuoEsq(parseFloat(leg.recuo_lat_esq) || 0);
    if (leg.recuo_lat_dir) setRecuoDir(parseFloat(leg.recuo_lat_dir) || 0);
  };

  const save = () => {
    onSave({ ...data, papeis: { lotW, lotH, recuoFrente, recuoFundos, recuoEsq, recuoDir, rooms } });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  // Compute stats
  const floorRooms = rooms.filter(r => r.floor === floor);
  const totalFloorArea = floorRooms.reduce((s, r) => s + r.area, 0);
  const buildableW = lotW - (parseFloat(recuoEsq) || 0) - (parseFloat(recuoDir) || 0);
  const buildableH = lotH - (parseFloat(recuoFrente) || 0) - (parseFloat(recuoFundos) || 0);
  const buildableArea = buildableW * buildableH;

  // Drawing
  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#F8F7F5'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid (1m)
    if (showGrid) {
      ctx.strokeStyle = '#EDEAE4'; ctx.lineWidth = 0.5;
      for (let x = 0; x <= lotW; x++) {
        const px = lotX0 + x * pxPerM;
        ctx.beginPath(); ctx.moveTo(px, lotY0); ctx.lineTo(px, lotY0 + lotPxH); ctx.stroke();
      }
      for (let y = 0; y <= lotH; y++) {
        const py = lotY0 + y * pxPerM;
        ctx.beginPath(); ctx.moveTo(lotX0, py); ctx.lineTo(lotX0 + lotPxW, py); ctx.stroke();
      }
    }

    // Lot outline
    ctx.strokeStyle = '#1A1917'; ctx.lineWidth = 2;
    ctx.strokeRect(lotX0, lotY0, lotPxW, lotPxH);

    // Lot dimensions
    ctx.font = '600 11px "DM Mono"'; ctx.fillStyle = '#1A1917'; ctx.textAlign = 'center';
    ctx.fillText(`${lotW.toFixed(1)}m`, lotX0 + lotPxW / 2, lotY0 - 8);
    ctx.save(); ctx.translate(lotX0 - 10, lotY0 + lotPxH / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${lotH.toFixed(1)}m`, 0, 0); ctx.restore();

    // Recuos (setback area)
    const rF = (parseFloat(recuoFrente) || 0) * pxPerM;
    const rB = (parseFloat(recuoFundos) || 0) * pxPerM;
    const rL = (parseFloat(recuoEsq) || 0) * pxPerM;
    const rR = (parseFloat(recuoDir) || 0) * pxPerM;

    if (rF > 0 || rB > 0 || rL > 0 || rR > 0) {
      // Shade setback
      ctx.fillStyle = 'rgba(200,195,185,0.2)';
      // Top (frente)
      if (rF > 0) ctx.fillRect(lotX0, lotY0, lotPxW, rF);
      // Bottom (fundos)
      if (rB > 0) ctx.fillRect(lotX0, lotY0 + lotPxH - rB, lotPxW, rB);
      // Left
      if (rL > 0) ctx.fillRect(lotX0, lotY0 + rF, rL, lotPxH - rF - rB);
      // Right
      if (rR > 0) ctx.fillRect(lotX0 + lotPxW - rR, lotY0 + rF, rR, lotPxH - rF - rB);

      // Buildable dashed outline
      ctx.setLineDash([6, 4]); ctx.strokeStyle = '#A09D94'; ctx.lineWidth = 1;
      ctx.strokeRect(lotX0 + rL, lotY0 + rF, lotPxW - rL - rR, lotPxH - rF - rB);
      ctx.setLineDash([]);

      // Setback labels
      ctx.font = '400 9px "DM Mono"'; ctx.fillStyle = '#9C988E'; ctx.textAlign = 'center';
      if (rF > 12) ctx.fillText(`recuo ${recuoFrente}m`, lotX0 + lotPxW / 2, lotY0 + rF / 2 + 3);
      if (rB > 12) ctx.fillText(`recuo ${recuoFundos}m`, lotX0 + lotPxW / 2, lotY0 + lotPxH - rB / 2 + 3);
    }

    // North arrow
    ctx.save();
    ctx.translate(CANVAS_W - 30, 30);
    ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(-5, 4); ctx.lineTo(0, 0); ctx.lineTo(5, 4); ctx.closePath();
    ctx.fillStyle = '#1A1917'; ctx.fill();
    ctx.font = '700 10px "DM Sans"'; ctx.fillStyle = '#1A1917'; ctx.textAlign = 'center';
    ctx.fillText('N', 0, -18);
    ctx.restore();

    // Scale bar
    ctx.fillStyle = '#1A1917'; ctx.fillRect(lotX0, CANVAS_H - 20, pxPerM * 5, 3);
    ctx.font = '400 10px "DM Mono"'; ctx.textAlign = 'left'; ctx.fillStyle = '#6B6860';
    ctx.fillText('5m', lotX0 + pxPerM * 5 + 6, CANVAS_H - 16);
    // tick marks
    for (let i = 0; i <= 5; i++) {
      ctx.fillRect(lotX0 + pxPerM * i, CANVAS_H - 24, 1, 7);
    }

    // Draw rooms for current floor
    floorRooms.forEach(room => {
      const c = roomColors[room.colorIdx] || roomColors[0];
      const rx = lotX0 + room.mx * pxPerM;
      const ry = lotY0 + room.my * pxPerM;
      const rw = room.mw * pxPerM;
      const rh = room.mh * pxPerM;
      const isSel = selected === room.id;

      // Fill
      ctx.fillStyle = c.bg;
      ctx.fillRect(rx, ry, rw, rh);

      // Border
      ctx.strokeStyle = isSel ? c.stroke : c.stroke;
      ctx.lineWidth = isSel ? 2.5 : 1.5;
      ctx.strokeRect(rx, ry, rw, rh);

      if (isSel) {
        ctx.strokeStyle = 'oklch(0.55 0.15 30)'; ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]); ctx.strokeRect(rx - 2, ry - 2, rw + 4, rh + 4); ctx.setLineDash([]);
        // Resize handle
        ctx.fillStyle = c.stroke;
        ctx.fillRect(rx + rw - 6, ry + rh - 6, 8, 8);
        ctx.fillStyle = '#fff';
        ctx.fillRect(rx + rw - 4, ry + rh - 4, 4, 4);
      }

      // Label
      ctx.font = `600 ${rw > 60 ? 12 : 10}px "DM Sans"`;
      ctx.fillStyle = c.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const cy = ry + rh / 2;
      ctx.fillText(room.name, rx + rw / 2, cy - (showDims ? 7 : 0));

      if (showDims) {
        ctx.font = `400 ${rw > 60 ? 10 : 8}px "DM Mono"`;
        ctx.fillStyle = c.stroke; ctx.globalAlpha = 0.8;
        ctx.fillText(`${room.mw.toFixed(1)}×${room.mh.toFixed(1)}m`, rx + rw / 2, cy + 7);
        ctx.fillText(`${room.area}m²`, rx + rw / 2, cy + 19);
        ctx.globalAlpha = 1;
      }
    });

  }, [rooms, lotW, lotH, recuoFrente, recuoFundos, recuoEsq, recuoDir, pxPerM, selected, showGrid, showDims, floor]);

  React.useEffect(() => { draw(); }, [draw]);

  // Mouse handlers
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const findRoom = (pos) => {
    return [...floorRooms].reverse().find(r => {
      const rx = lotX0 + r.mx * pxPerM;
      const ry = lotY0 + r.my * pxPerM;
      return pos.x >= rx && pos.x <= rx + r.mw * pxPerM && pos.y >= ry && pos.y <= ry + r.mh * pxPerM;
    });
  };

  const isOnResizeHandle = (pos) => {
    if (!selected) return false;
    const r = rooms.find(rr => rr.id === selected);
    if (!r) return false;
    const hx = lotX0 + (r.mx + r.mw) * pxPerM;
    const hy = lotY0 + (r.my + r.mh) * pxPerM;
    return Math.abs(pos.x - hx) < 10 && Math.abs(pos.y - hy) < 10;
  };

  const handleMouseDown = (e) => {
    const pos = getPos(e);
    if (selected && isOnResizeHandle(pos)) {
      setResizing(selected);
      return;
    }
    const room = findRoom(pos);
    if (room) {
      setSelected(room.id);
      const rx = lotX0 + room.mx * pxPerM;
      const ry = lotY0 + room.my * pxPerM;
      setDragging({ id: room.id, offX: pos.x - rx, offY: pos.y - ry });
    } else {
      setSelected(null);
    }
  };

  const handleMouseMove = (e) => {
    const pos = getPos(e);
    if (resizing) {
      const r = rooms.find(rr => rr.id === resizing);
      if (r) {
        let newW = px2m(pos.x - lotX0 - r.mx * pxPerM);
        let newH = px2m(pos.y - lotY0 - r.my * pxPerM);
        newW = Math.max(1, snapToGrid(newW));
        newH = Math.max(1, snapToGrid(newH));
        setRooms(p => p.map(rr => rr.id === resizing ? { ...rr, mw: newW, mh: newH, area: Math.round(newW * newH * 10) / 10 } : rr));
      }
    } else if (dragging) {
      const r = rooms.find(rr => rr.id === dragging.id);
      if (r) {
        let mx = px2m(pos.x - dragging.offX - lotX0);
        let my = px2m(pos.y - dragging.offY - lotY0);
        mx = snapToGrid(mx);
        my = snapToGrid(my);
        setRooms(p => p.map(rr => rr.id === dragging.id ? { ...rr, mx, my } : rr));
      }
    }
  };

  const handleMouseUp = () => { setDragging(null); setResizing(null); };

  const handleDblClick = (e) => {
    const pos = getPos(e);
    const room = findRoom(pos);
    if (room) { setEditRoom(room.id); setEditName(room.name); }
  };

  const floors = [...new Set(rooms.map(r => r.floor || 0))].sort();
  if (!floors.includes(floor)) floors.push(floor);
  floors.sort((a, b) => a - b);

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
        Exercício dos papéis: arraste e redimensione retângulos sobre o lote em escala. As áreas são proporcionais — um ambiente de 20m² ocupa o dobro de um de 10m². Redimensionar atualiza a área automaticamente.
      </p>

      {/* Lot config */}
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>CONFIGURAÇÃO DO LOTE</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={labelSm}>Largura (m) <Input value={lotW} onChange={v => setLotW(parseFloat(v) || 0)} style={{ width: 70 }} /></label>
          <label style={labelSm}>Profund. (m) <Input value={lotH} onChange={v => setLotH(parseFloat(v) || 0)} style={{ width: 70 }} /></label>
          <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
          <label style={labelSm}>Rec. frente <Input value={recuoFrente} onChange={v => setRecuoFrente(v)} style={{ width: 55 }} /></label>
          <label style={labelSm}>Rec. fundos <Input value={recuoFundos} onChange={v => setRecuoFundos(v)} style={{ width: 55 }} /></label>
          <label style={labelSm}>Rec. esq. <Input value={recuoEsq} onChange={v => setRecuoEsq(v)} style={{ width: 55 }} /></label>
          <label style={labelSm}>Rec. dir. <Input value={recuoDir} onChange={v => setRecuoDir(v)} style={{ width: 55 }} /></label>
          {(data.viabilidade || data.legislacaoData) && (
            <Button variant="ghost" onClick={importLot} style={{ fontSize: 12 }}>↓ Importar lote/legislação</Button>
          )}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          Lote: <strong>{(lotW * lotH).toFixed(1)}m²</strong> · Edificável: <strong>{buildableArea.toFixed(1)}m²</strong> · Pav. atual: <strong>{totalFloorArea.toFixed(1)}m²</strong>
          {buildableArea > 0 && <span style={{ color: totalFloorArea > buildableArea ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}> ({Math.round(totalFloorArea / buildableArea * 100)}% ocupação)</span>}
        </div>
      </Card>

      {/* Room toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={newName} onChange={setNewName} placeholder="Ambiente..." style={{ width: 150 }} />
        <Input value={newArea} onChange={setNewArea} placeholder="Área m²" style={{ width: 75 }} />
        <Button variant="secondary" onClick={addRoom}>+ Papel</Button>
        {(data.programa?.length > 0 || data.predimensionamento?.length > 0) && (
          <Button variant="ghost" onClick={importRooms} style={{ fontSize: 12 }}>↓ Importar ambientes</Button>
        )}
        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} /> Grade 1m
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showDims} onChange={e => setShowDims(e.target.checked)} /> Dimensões
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={snap} onChange={e => setSnap(e.target.checked)} /> Snap 0.5m
        </label>
        {selected && <Button variant="ghost" onClick={() => removeRoom(selected)} style={{ fontSize: 12, color: 'var(--red)' }}>✕ Remover</Button>}
      </div>

      {/* Floor selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Pavimento:</span>
        {floors.map(f => (
          <button key={f} onClick={() => setFloor(f)} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer',
            background: floor === f ? 'var(--accent)' : 'var(--bg-card)', color: floor === f ? '#fff' : 'var(--text-secondary)',
          }}>{f === 0 ? 'Térreo' : `${f}º Pav`}</button>
        ))}
        <button onClick={() => setFloor(Math.max(...floors) + 1)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>+ Pav</button>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', cursor: dragging ? 'grabbing' : resizing ? 'nwse-resize' : 'default' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', aspectRatio: `${CANVAS_W}/${CANVAS_H}`, display: 'block' }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          onDoubleClick={handleDblClick}
        />
        {editRoom && (() => {
          const r = rooms.find(rr => rr.id === editRoom);
          if (!r) return null;
          const rx = lotX0 + r.mx * pxPerM;
          const ry = lotY0 + r.my * pxPerM;
          // Scale to display coords
          const canvasEl = canvasRef.current;
          const dispScale = canvasEl ? canvasEl.offsetWidth / CANVAS_W : 1;
          return (
            <div style={{ position: 'absolute', left: rx * dispScale - 20, top: ry * dispScale - 44, background: 'var(--bg-card)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 8, display: 'flex', gap: 6, zIndex: 10 }}>
              <Input value={editName} onChange={setEditName} style={{ width: 110, fontSize: 12 }} />
              <Button onClick={() => { setRooms(p => p.map(rr => rr.id === editRoom ? { ...rr, name: editName } : rr)); setEditRoom(null); }} style={{ padding: '4px 10px', fontSize: 11 }}>OK</Button>
            </div>
          );
        })()}
      </div>

      {/* Room list summary */}
      {floorRooms.length > 0 && (
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
          <strong>{floorRooms.length} ambientes</strong> neste pavimento:
          {floorRooms.map((r, i) => (
            <span key={r.id} style={{ marginLeft: 6, padding: '2px 8px', borderRadius: 10, background: roomColors[r.colorIdx]?.bg || '#eee', color: roomColors[r.colorIdx]?.text || '#333', fontWeight: 500 }}>
              {r.name} ({r.area}m²)
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar estudo'}</Button>
        <Button variant="ghost" onClick={() => { if(confirm('Limpar ambientes?')) { setRooms([]); } }}>Limpar</Button>
      </div>
    </div>
  );
};

const labelSm = { display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 };

window.EstudoPapeisTool = EstudoPapeisTool;
