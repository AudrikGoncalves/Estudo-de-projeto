// ─── Estudo de Papéis (retângulos em escala sobre o lote) ───
const EstudoPapeisTool = ({ data, onSave }) => {
  const canvasRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const [saved, setSaved] = React.useState(false);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const history = useCanvasHistory();

  // Configuração do lote
  const [lotW, setLotW] = React.useState(() => data.papeis?.lotW || 12);
  const [lotH, setLotH] = React.useState(() => data.papeis?.lotH || 30);
  const [recuoFrente, setRecuoFrente] = React.useState(() => data.papeis?.recuoFrente || 0);
  const [recuoFundos, setRecuoFundos] = React.useState(() => data.papeis?.recuoFundos || 0);
  const [recuoEsq, setRecuoEsq] = React.useState(() => data.papeis?.recuoEsq || 0);
  const [recuoDir, setRecuoDir] = React.useState(() => data.papeis?.recuoDir || 0);

  // Ambientes (papéis)
  const [rooms, setRooms] = React.useState(() => data.papeis?.rooms || []);
  const [dragging, setDragging] = React.useState(null);
  const [resizing, setResizing] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [newName, setNewName] = React.useState('');
  const [newArea, setNewArea] = React.useState('');
  const [editRoom, setEditRoom] = React.useState(null); // { id, name, mw, mh }
  const [showGrid, setShowGrid] = React.useState(true);
  const [showDims, setShowDims] = React.useState(true);
  const [snap, setSnap] = React.useState(true);
  const [floor, setFloor] = React.useState(0);

  const roomColors = [
    { bg: 'rgba(194,120,86,0.25)', stroke: 'oklch(0.55 0.15 30)', text: 'oklch(0.40 0.12 30)' },
    { bg: 'rgba(86,130,194,0.25)', stroke: 'oklch(0.55 0.12 250)', text: 'oklch(0.40 0.10 250)' },
    { bg: 'rgba(86,160,120,0.25)', stroke: 'oklch(0.55 0.12 155)', text: 'oklch(0.40 0.10 155)' },
    { bg: 'rgba(180,160,80,0.25)', stroke: 'oklch(0.60 0.12 85)', text: 'oklch(0.40 0.10 85)' },
    { bg: 'rgba(160,86,160,0.25)', stroke: 'oklch(0.55 0.12 320)', text: 'oklch(0.40 0.10 320)' },
    { bg: 'rgba(86,160,170,0.25)', stroke: 'oklch(0.55 0.12 190)', text: 'oklch(0.40 0.10 190)' },
  ];

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

  const px2m = (px) => px / pxPerM;
  const snapToGrid = (val, gridM = 0.5) => snap ? Math.round(val / gridM) * gridM : val;

  const snapshot = () => history.push({ rooms });
  const undo = () => {
    const prev = history.undo();
    if (prev) { setRooms(prev.rooms); setSelected(null); }
  };

  // Ctrl+Z / Delete / Esc / R (girar)
  React.useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) { e.preventDefault(); removeRoom(selected); }
      if (e.key.toLowerCase() === 'r' && selected) { e.preventDefault(); rotateRoom(selected); }
      if (e.key === 'Escape') { setSelected(null); setEditRoom(null); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const addRoom = () => {
    if (!newName.trim()) return;
    snapshot();
    const area = parseFloat(newArea) || 10;
    const side = Math.sqrt(area);
    const w = Math.round(side * 2) / 2;
    const h = Math.round((area / w) * 2) / 2;
    setRooms(p => [...p, {
      id: 'r' + Date.now(),
      name: newName.trim(),
      area, mx: 1, my: 1, mw: w, mh: h,
      floor,
      colorIdx: rooms.length % roomColors.length,
    }]);
    setNewName(''); setNewArea('');
  };

  const importRooms = () => {
    const programa = data.programa || [];
    const predim = data.predimensionamento || [];
    const source = predim.length > 0 ? predim : programa;
    if (!source.length) return;
    snapshot();
    const newR = [];
    let col = 0, row = 0, maxRowH = 0;
    const startX = parseFloat(recuoEsq) || 0;
    const startY = parseFloat(recuoFrente) || 0;
    const maxW = lotW - (parseFloat(recuoEsq) || 0) - (parseFloat(recuoDir) || 0);

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
    setRooms(newR);
  };

  const removeRoom = (id) => { snapshot(); setRooms(p => p.filter(r => r.id !== id)); setSelected(null); setEditRoom(null); };

  const rotateRoom = (id) => {
    snapshot();
    setRooms(p => p.map(r => r.id === id ? { ...r, mw: r.mh, mh: r.mw } : r));
  };

  const duplicateRoom = (id) => {
    const src = rooms.find(r => r.id === id);
    if (!src) return;
    snapshot();
    const copy = { ...src, id: 'r' + Date.now(), mx: src.mx + 1, my: src.my + 1 };
    setRooms(p => [...p, copy]);
    setSelected(copy.id);
  };

  const importLot = () => {
    const leg = data.legislacaoData || {};
    const viab = data.viabilidade || {};
    if (viab.areaTerreno) {
      const a = parseFloat(viab.areaTerreno);
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

  // ─── Estatísticas e verificações ───
  const floorRooms = rooms.filter(r => (r.floor || 0) === floor);
  const totalFloorArea = floorRooms.reduce((s, r) => s + r.area, 0);
  const rF = parseFloat(recuoFrente) || 0, rB = parseFloat(recuoFundos) || 0;
  const rL = parseFloat(recuoEsq) || 0, rR = parseFloat(recuoDir) || 0;
  const buildableW = lotW - rL - rR;
  const buildableH = lotH - rF - rB;
  const buildableArea = buildableW * buildableH;
  const lotArea = lotW * lotH;

  // TO/CA em confronto com a legislação
  const leg = data.legislacaoData || {};
  const toMax = parseFloat(leg.to_maxima) || 0;
  const caMax = parseFloat(leg.ca_maximo) || 0;
  const terreoArea = rooms.filter(r => (r.floor || 0) === 0).reduce((s, r) => s + r.mw * r.mh, 0);
  const totalArea = rooms.reduce((s, r) => s + r.mw * r.mh, 0);
  const toAtual = lotArea > 0 ? (terreoArea / lotArea) * 100 : 0;
  const caAtual = lotArea > 0 ? totalArea / lotArea : 0;

  // Sobreposição entre ambientes do mesmo pavimento
  const overlaps = (a, b) => a.mx < b.mx + b.mw && a.mx + a.mw > b.mx && a.my < b.my + b.mh && a.my + a.mh > b.my;
  const overlapIds = new Set();
  for (let i = 0; i < floorRooms.length; i++) {
    for (let j = i + 1; j < floorRooms.length; j++) {
      if (overlaps(floorRooms[i], floorRooms[j])) { overlapIds.add(floorRooms[i].id); overlapIds.add(floorRooms[j].id); }
    }
  }
  // Fora da área edificável
  const outsideIds = new Set(floorRooms.filter(r =>
    r.mx < rL - 0.01 || r.my < rF - 0.01 || r.mx + r.mw > lotW - rR + 0.01 || r.my + r.mh > lotH - rB + 0.01
  ).map(r => r.id));

  // ─── Desenho ───
  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#F8F7F5'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grade 1m
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

    // Contorno do lote
    ctx.strokeStyle = '#1A1917'; ctx.lineWidth = 2;
    ctx.strokeRect(lotX0, lotY0, lotPxW, lotPxH);

    ctx.font = '600 11px "IBM Plex Mono", monospace'; ctx.fillStyle = '#1A1917'; ctx.textAlign = 'center';
    ctx.fillText(`${lotW.toFixed(1)}m`, lotX0 + lotPxW / 2, lotY0 - 8);
    ctx.save(); ctx.translate(lotX0 - 10, lotY0 + lotPxH / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${lotH.toFixed(1)}m`, 0, 0); ctx.restore();

    // Recuos
    const pF = rF * pxPerM, pB = rB * pxPerM, pL = rL * pxPerM, pR = rR * pxPerM;
    if (pF > 0 || pB > 0 || pL > 0 || pR > 0) {
      ctx.fillStyle = 'rgba(200,195,185,0.2)';
      if (pF > 0) ctx.fillRect(lotX0, lotY0, lotPxW, pF);
      if (pB > 0) ctx.fillRect(lotX0, lotY0 + lotPxH - pB, lotPxW, pB);
      if (pL > 0) ctx.fillRect(lotX0, lotY0 + pF, pL, lotPxH - pF - pB);
      if (pR > 0) ctx.fillRect(lotX0 + lotPxW - pR, lotY0 + pF, pR, lotPxH - pF - pB);

      ctx.setLineDash([6, 4]); ctx.strokeStyle = '#A09D94'; ctx.lineWidth = 1;
      ctx.strokeRect(lotX0 + pL, lotY0 + pF, lotPxW - pL - pR, lotPxH - pF - pB);
      ctx.setLineDash([]);

      ctx.font = '400 9px "IBM Plex Mono", monospace'; ctx.fillStyle = '#9C988E'; ctx.textAlign = 'center';
      if (pF > 12) ctx.fillText(`recuo ${recuoFrente}m`, lotX0 + lotPxW / 2, lotY0 + pF / 2 + 3);
      if (pB > 12) ctx.fillText(`recuo ${recuoFundos}m`, lotX0 + lotPxW / 2, lotY0 + lotPxH - pB / 2 + 3);
    }

    // Norte
    ctx.save();
    ctx.translate(CANVAS_W - 30, 30);
    ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(-5, 4); ctx.lineTo(0, 0); ctx.lineTo(5, 4); ctx.closePath();
    ctx.fillStyle = '#1A1917'; ctx.fill();
    ctx.font = '700 10px "Archivo", sans-serif'; ctx.fillStyle = '#1A1917'; ctx.textAlign = 'center';
    ctx.fillText('N', 0, -18);
    ctx.restore();

    // Barra de escala
    ctx.fillStyle = '#1A1917'; ctx.fillRect(lotX0, CANVAS_H - 20, pxPerM * 5, 3);
    ctx.font = '400 10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#6B6860';
    ctx.fillText('5m', lotX0 + pxPerM * 5 + 6, CANVAS_H - 16);
    for (let i = 0; i <= 5; i++) ctx.fillRect(lotX0 + pxPerM * i, CANVAS_H - 24, 1, 7);

    // Ambientes do pavimento atual
    floorRooms.forEach(room => {
      const c = roomColors[room.colorIdx] || roomColors[0];
      const rx = lotX0 + room.mx * pxPerM;
      const ry = lotY0 + room.my * pxPerM;
      const rw = room.mw * pxPerM;
      const rh = room.mh * pxPerM;
      const isSel = selected === room.id;
      const hasOverlap = overlapIds.has(room.id);
      const isOutside = outsideIds.has(room.id);

      ctx.fillStyle = c.bg;
      ctx.fillRect(rx, ry, rw, rh);

      // Sobreposição/fora da área edificável = borda vermelha
      ctx.strokeStyle = hasOverlap || isOutside ? 'oklch(0.55 0.18 25)' : c.stroke;
      ctx.lineWidth = isSel ? 2.5 : hasOverlap || isOutside ? 2 : 1.5;
      if (isOutside) ctx.setLineDash([4, 3]);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.setLineDash([]);

      if (isSel) {
        ctx.strokeStyle = 'oklch(0.55 0.15 30)'; ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]); ctx.strokeRect(rx - 2, ry - 2, rw + 4, rh + 4); ctx.setLineDash([]);
        // Alça de redimensionar
        ctx.fillStyle = c.stroke;
        ctx.fillRect(rx + rw - 6, ry + rh - 6, 10, 10);
        ctx.fillStyle = '#fff';
        ctx.fillRect(rx + rw - 4, ry + rh - 4, 6, 6);
      }

      ctx.font = `600 ${rw > 60 ? 12 : 10}px "Archivo", sans-serif`;
      ctx.fillStyle = c.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const cy = ry + rh / 2;
      ctx.fillText(room.name, rx + rw / 2, cy - (showDims ? 7 : 0));

      if (showDims) {
        ctx.font = `400 ${rw > 60 ? 10 : 8}px "IBM Plex Mono", monospace`;
        ctx.fillStyle = c.stroke; ctx.globalAlpha = 0.8;
        ctx.fillText(`${room.mw.toFixed(1)}×${room.mh.toFixed(1)}m`, rx + rw / 2, cy + 7);
        ctx.fillText(`${(room.mw * room.mh).toFixed(1)}m²`, rx + rw / 2, cy + 19);
        ctx.globalAlpha = 1;
      }
    });

  }, [rooms, lotW, lotH, recuoFrente, recuoFundos, recuoEsq, recuoDir, pxPerM, selected, showGrid, showDims, floor]);

  React.useEffect(() => { draw(); }, [draw]);

  // ─── Ponteiro (mouse + toque) ───
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
    return Math.abs(pos.x - hx) < 14 && Math.abs(pos.y - hy) < 14;
  };

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    try { canvasRef.current.setPointerCapture?.(e.pointerId); } catch (err) {}
    const pos = getPos(e);
    if (selected && isOnResizeHandle(pos)) {
      snapshot();
      setResizing(selected);
      return;
    }
    const room = findRoom(pos);
    if (room) {
      setSelected(room.id);
      snapshot();
      const rx = lotX0 + room.mx * pxPerM;
      const ry = lotY0 + room.my * pxPerM;
      setDragging({ id: room.id, offX: pos.x - rx, offY: pos.y - ry });
    } else {
      setSelected(null);
    }
  };

  const handlePointerMove = (e) => {
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

  const handlePointerUp = () => { setDragging(null); setResizing(null); };

  const handleDblClick = (e) => {
    const pos = getPos(e);
    const room = findRoom(pos);
    if (room) setEditRoom({ id: room.id, name: room.name, mw: String(room.mw), mh: String(room.mh) });
  };

  const applyEditRoom = () => {
    if (!editRoom) return;
    snapshot();
    const mw = Math.max(1, parseFloat(editRoom.mw) || 1);
    const mh = Math.max(1, parseFloat(editRoom.mh) || 1);
    setRooms(p => p.map(rr => rr.id === editRoom.id ? { ...rr, name: editRoom.name.trim() || rr.name, mw, mh, area: Math.round(mw * mh * 10) / 10 } : rr));
    setEditRoom(null);
  };

  const floors = [...new Set(rooms.map(r => r.floor || 0))].sort();
  if (!floors.includes(floor)) floors.push(floor);
  floors.sort((a, b) => a - b);

  const chip = (ok, label) => (
    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: ok ? 'var(--green-light)' : 'var(--red-light)', color: ok ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
      {ok ? '✓' : '✕'} {label}
    </span>
  );

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
        Arraste e redimensione retângulos em escala sobre o lote. Toque duas vezes para editar, <strong>R</strong> gira o ambiente selecionado. Sobreposições e ambientes fora da área edificável ficam com borda vermelha. Funciona com toque no celular.
      </p>

      {/* Configuração do lote */}
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
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span>Lote: <strong>{lotArea.toFixed(1)}m²</strong> · Edificável: <strong>{buildableArea.toFixed(1)}m²</strong> · Pav. atual: <strong>{totalFloorArea.toFixed(1)}m²</strong></span>
          {toMax > 0 && chip(toAtual <= toMax, `TO ${toAtual.toFixed(0)}% / máx ${toMax}%`)}
          {caMax > 0 && chip(caAtual <= caMax, `CA ${caAtual.toFixed(2)} / máx ${caMax}`)}
          {overlapIds.size > 0 && chip(false, `${overlapIds.size} sobrepostos`)}
          {outsideIds.size > 0 && chip(false, `${outsideIds.size} fora do recuo`)}
          {toMax === 0 && caMax === 0 && <span style={{ fontSize: 11 }}>· Preencha TO/CA na Legislação para verificação automática</span>}
        </div>
      </Card>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={newName} onChange={setNewName} placeholder="Ambiente..." style={{ width: 150 }} />
        <Input value={newArea} onChange={setNewArea} placeholder="Área m²" style={{ width: 75 }} />
        <Button variant="secondary" onClick={addRoom}>+ Papel</Button>
        {(data.programa?.length > 0 || data.predimensionamento?.length > 0) && (
          <Button variant="ghost" onClick={importRooms} style={{ fontSize: 12 }}>↓ Importar ambientes</Button>
        )}
        <Button variant="ghost" onClick={undo} style={{ fontSize: 12 }} disabled={!history.canUndo()}>↶ Desfazer</Button>
        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} /> Grade
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showDims} onChange={e => setShowDims(e.target.checked)} /> Dimensões
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={snap} onChange={e => setSnap(e.target.checked)} /> Snap 0.5m
        </label>
        {selected && (
          <>
            <Button variant="ghost" onClick={() => rotateRoom(selected)} style={{ fontSize: 12 }}>⟲ Girar</Button>
            <Button variant="ghost" onClick={() => duplicateRoom(selected)} style={{ fontSize: 12 }}>⧉ Duplicar</Button>
            <Button variant="ghost" onClick={() => removeRoom(selected)} style={{ fontSize: 12, color: 'var(--red)' }}>✕ Remover</Button>
          </>
        )}
      </div>

      {/* Pavimentos */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Pavimento:</span>
        {floors.map(f => (
          <button key={f} onClick={() => { setFloor(f); setSelected(null); }} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer',
            background: floor === f ? 'var(--accent)' : 'var(--bg-card)', color: floor === f ? '#fff' : 'var(--text-secondary)',
          }}>{f === 0 ? 'Térreo' : `${f}º Pav`}</button>
        ))}
        <button onClick={() => setFloor(Math.max(...floors) + 1)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>+ Pav</button>
        {selected && floors.length > 1 && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            mover p/:
            {floors.filter(f => f !== floor).map(f => (
              <button key={f} onClick={() => { snapshot(); setRooms(p => p.map(r => r.id === selected ? { ...r, floor: f } : r)); setSelected(null); }}
                style={{ marginLeft: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {f === 0 ? 'Térreo' : `${f}º`}
              </button>
            ))}
          </span>
        )}
      </div>

      {/* Canvas */}
      <div ref={wrapRef} style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', cursor: dragging ? 'grabbing' : resizing ? 'nwse-resize' : 'default' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', aspectRatio: `${CANVAS_W}/${CANVAS_H}`, display: 'block', touchAction: 'none' }}
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
          onDoubleClick={handleDblClick}
        />
        {editRoom && (() => {
          const r = rooms.find(rr => rr.id === editRoom.id);
          if (!r) return null;
          const canvasEl = canvasRef.current;
          const dispScale = canvasEl ? canvasEl.offsetWidth / CANVAS_W : 1;
          const rx = (lotX0 + r.mx * pxPerM) * dispScale;
          const ry = (lotY0 + r.my * pxPerM) * dispScale;
          const left = Math.min(Math.max(rx - 20, 8), (wrapRef.current?.offsetWidth || 800) - 280);
          const top = Math.max(ry - 54, 8);
          return (
            <div style={{ position: 'absolute', left, top, background: 'var(--bg-elevated)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 10, display: 'flex', gap: 6, zIndex: 10, border: '1px solid var(--border-light)', alignItems: 'center' }}>
              <Input value={editRoom.name} onChange={v => setEditRoom(p => ({ ...p, name: v }))} style={{ width: 110, fontSize: 12, padding: '8px 10px' }} placeholder="Nome" />
              <Input value={editRoom.mw} onChange={v => setEditRoom(p => ({ ...p, mw: v }))} style={{ width: 50, fontSize: 12, padding: '8px 8px' }} placeholder="L" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>×</span>
              <Input value={editRoom.mh} onChange={v => setEditRoom(p => ({ ...p, mh: v }))} style={{ width: 50, fontSize: 12, padding: '8px 8px' }} placeholder="P" />
              <Button onClick={applyEditRoom} style={{ padding: '5px 10px', fontSize: 11 }}>OK</Button>
            </div>
          );
        })()}
      </div>

      {/* Lista de ambientes do pavimento */}
      {floorRooms.length > 0 && (
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <strong>{floorRooms.length} ambientes</strong> neste pavimento:
          {floorRooms.map(r => (
            <span key={r.id} onClick={() => setSelected(r.id)} style={{ padding: '2px 8px', borderRadius: 10, background: roomColors[r.colorIdx]?.bg || '#eee', color: roomColors[r.colorIdx]?.text || '#333', fontWeight: 500, cursor: 'pointer', outline: selected === r.id ? '2px solid var(--accent)' : 'none' }}>
              {r.name} ({(r.mw * r.mh).toFixed(1)}m²)
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar estudo'}</Button>
        <Button variant="secondary" onClick={() => downloadCanvasPNG(canvasRef.current, 'estudo-de-papeis')} disabled={rooms.length === 0}>⬇ PNG</Button>
        <Button variant="ghost" onClick={() => setConfirmClear(true)} disabled={rooms.length === 0}>Limpar</Button>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Limpar os ambientes?"
        message="Todos os retângulos serão removidos (você pode desfazer com Ctrl+Z). A configuração do lote é mantida."
        confirmLabel="Limpar"
        danger
        onConfirm={() => { snapshot(); setRooms([]); setConfirmClear(false); }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
};

const labelSm = { display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 };

window.EstudoPapeisTool = EstudoPapeisTool;
