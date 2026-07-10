// ─── Imagens por etapa (IndexedDB) ───
// Imagens ficam no dispositivo (IndexedDB), fora do localStorage/nuvem, para não estourar limites de armazenamento.

const IMG_DB_NAME = 'mp-images';
const IMG_STORE = 'images';

const openImgDB = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(IMG_DB_NAME, 1);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains(IMG_STORE)) {
      const store = db.createObjectStore(IMG_STORE, { keyPath: 'id' });
      store.createIndex('byProject', 'projectId', { unique: false });
      store.createIndex('byStep', 'projectStep', { unique: false });
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const imgTx = async (mode, fn) => {
  const db = await openImgDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMG_STORE, mode);
    const store = tx.objectStore(IMG_STORE);
    const result = fn(store);
    tx.oncomplete = () => { db.close(); resolve(result.__value !== undefined ? result.__value : result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
};

// Comprime para JPEG max 1600px — mantém armazenamento sob controle
const compressImage = (file, maxDim = 1600, quality = 0.85) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    let { width: w, height: h } = img;
    if (Math.max(w, h) > maxDim) {
      const f = maxDim / Math.max(w, h);
      w = Math.round(w * f); h = Math.round(h * f);
    }
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h); // fundo p/ PNGs transparentes
    ctx.drawImage(img, 0, 0, w, h);
    c.toBlob(blob => blob ? resolve({ blob, w, h }) : reject(new Error('compressão falhou')), 'image/jpeg', quality);
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('arquivo não é uma imagem válida')); };
  img.src = url;
});

const imgAdd = async (projectId, stepId, file) => {
  const { blob, w, h } = await compressImage(file);
  const record = {
    id: 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    projectId,
    stepId,
    projectStep: `${projectId}_${stepId}`,
    name: file.name || 'imagem',
    blob, w, h,
    created: Date.now(),
  };
  await imgTx('readwrite', store => store.put(record));
  return record;
};

const imgListByStep = (projectId, stepId) => imgTx('readonly', store => {
  const out = { __value: [] };
  const idx = store.index('byStep');
  idx.openCursor(IDBKeyRange.only(`${projectId}_${stepId}`)).onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) { out.__value.push(cursor.value); cursor.continue(); }
  };
  return out;
});

const imgListByProject = (projectId) => imgTx('readonly', store => {
  const out = { __value: [] };
  const idx = store.index('byProject');
  idx.openCursor(IDBKeyRange.only(projectId)).onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) { out.__value.push(cursor.value); cursor.continue(); }
  };
  return out;
});

const imgDelete = (id) => imgTx('readwrite', store => store.delete(id));

const imgDeleteProject = async (projectId) => {
  const records = await imgListByProject(projectId);
  if (records.length === 0) return;
  await imgTx('readwrite', store => { records.forEach(r => store.delete(r.id)); });
};

const imgCopyProject = async (srcId, dstId) => {
  const records = await imgListByProject(srcId);
  if (records.length === 0) return;
  await imgTx('readwrite', store => {
    records.forEach((r, i) => {
      store.put({ ...r, id: 'img_' + Date.now() + '_' + i + '_' + Math.random().toString(36).slice(2, 5), projectId: dstId, projectStep: `${dstId}_${r.stepId}` });
    });
  });
};

const blobToDataURL = (blob) => new Promise((resolve, reject) => {
  const fr = new FileReader();
  fr.onload = () => resolve(fr.result);
  fr.onerror = () => reject(fr.error);
  fr.readAsDataURL(blob);
});

const dataURLToBlob = (dataUrl) => fetch(dataUrl).then(r => r.blob());

// Para backup: exporta imagens do projeto como dataURLs
const imgExportProject = async (projectId) => {
  const records = await imgListByProject(projectId);
  const out = [];
  for (const r of records) {
    out.push({ stepId: r.stepId, name: r.name, w: r.w, h: r.h, created: r.created, dataUrl: await blobToDataURL(r.blob) });
  }
  return out;
};

const imgImportProject = async (projectId, images) => {
  if (!images || !images.length) return;
  const records = [];
  for (const im of images) {
    records.push({
      id: 'img_' + Date.now() + '_' + records.length + '_' + Math.random().toString(36).slice(2, 5),
      projectId, stepId: im.stepId, projectStep: `${projectId}_${im.stepId}`,
      name: im.name || 'imagem', w: im.w, h: im.h, created: im.created || Date.now(),
      blob: await dataURLToBlob(im.dataUrl),
    });
  }
  await imgTx('readwrite', store => { records.forEach(r => store.put(r)); });
};

// ─── Componente: galeria de imagens da etapa ───
const StepImages = ({ projectId, stepId }) => {
  const [images, setImages] = React.useState([]);
  const [urls, setUrls] = React.useState({});
  const [lightbox, setLightbox] = React.useState(null);
  const [confirmDel, setConfirmDel] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const fileRef = React.useRef(null);

  const reload = React.useCallback(async () => {
    if (!projectId) return;
    try {
      const recs = await imgListByStep(projectId, stepId);
      recs.sort((a, b) => a.created - b.created);
      setImages(recs);
      setUrls(prev => {
        Object.values(prev).forEach(u => URL.revokeObjectURL(u));
        const next = {};
        recs.forEach(r => { next[r.id] = URL.createObjectURL(r.blob); });
        return next;
      });
    } catch (e) { console.warn('imagens: falha ao carregar', e); }
  }, [projectId, stepId]);

  React.useEffect(() => {
    reload();
    return () => setUrls(prev => { Object.values(prev).forEach(u => URL.revokeObjectURL(u)); return {}; });
  }, [reload]);

  const addFiles = async (files) => {
    const list = [...files].filter(f => f.type.startsWith('image/'));
    if (!list.length) return;
    setBusy(true);
    try {
      for (const f of list) await imgAdd(projectId, stepId, f);
      await reload();
    } catch (e) { alert('Erro ao adicionar imagem: ' + e.message); }
    finally { setBusy(false); }
  };

  // Colar imagem (Ctrl+V) enquanto a etapa está aberta
  React.useEffect(() => {
    const onPaste = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      const items = [...(e.clipboardData?.items || [])].filter(i => i.type.startsWith('image/'));
      if (items.length) { e.preventDefault(); addFiles(items.map(i => i.getAsFile()).filter(Boolean)); }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [projectId, stepId]);

  const doDelete = async () => {
    if (!confirmDel) return;
    await imgDelete(confirmDel);
    setConfirmDel(null);
    reload();
  };

  if (!projectId) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
          Imagens e referências {images.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({images.length})</span>}
        </label>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>fotos do terreno, croquis, mapas — salvas neste dispositivo</span>
      </div>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 10, padding: 12,
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)', background: dragOver ? 'var(--accent-light)' : 'var(--bg-subtle)',
          transition: 'var(--transition)', minHeight: 96, alignItems: 'center',
        }}
      >
        {images.map(img => (
          <div key={img.id} style={{ position: 'relative', width: 110, height: 82, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'zoom-in', flexShrink: 0 }}>
            <img src={urls[img.id]} alt={img.name} onClick={() => setLightbox(img.id)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <button
              onClick={e => { e.stopPropagation(); setConfirmDel(img.id); }}
              title="Excluir imagem"
              style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, minHeight: 22, borderRadius: 7, border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 }}
            >✕</button>
          </div>
        ))}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          style={{ width: 110, height: 82, borderRadius: 'var(--radius-sm)', border: '1.5px dashed var(--border-strong)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, fontFamily: 'var(--font)', flexShrink: 0 }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>{busy ? '⏳' : '+'}</span>
          {busy ? 'Salvando...' : 'Adicionar'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
        {images.length === 0 && !busy && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Arraste imagens aqui, cole (Ctrl+V) ou clique em Adicionar</span>
        )}
      </div>

      {lightbox && (() => {
        const img = images.find(i => i.id === lightbox);
        if (!img) return null;
        return (
          <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', animation: 'fadeIn 0.2s ease', padding: 20 }}>
            <img src={urls[img.id]} alt={img.name} style={{ maxWidth: '94vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{img.name} — clique para fechar</div>
          </div>
        );
      })()}

      <ConfirmDialog
        open={!!confirmDel}
        title="Excluir imagem?"
        message="A imagem será removida permanentemente deste dispositivo."
        confirmLabel="Excluir"
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
};

window.imgAdd = imgAdd;
window.imgListByStep = imgListByStep;
window.imgListByProject = imgListByProject;
window.imgDelete = imgDelete;
window.imgDeleteProject = imgDeleteProject;
window.imgCopyProject = imgCopyProject;
window.imgExportProject = imgExportProject;
window.imgImportProject = imgImportProject;
window.blobToDataURL = blobToDataURL;
window.StepImages = StepImages;
