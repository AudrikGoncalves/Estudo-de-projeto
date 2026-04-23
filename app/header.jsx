// ─── Header with project actions + auto-save indicator + exports ───
const AppHeader = ({ currentProject, saveStatus, onOpenProjects, onSave, onExportPDF, onExportMD, projectData, onUpdateMeta }) => {
  const [saved, setSaved] = React.useState(false);
  const [exportingPdf, setExportingPdf] = React.useState(false);
  const [exportingMd, setExportingMd] = React.useState(false);
  const [editingMeta, setEditingMeta] = React.useState(false);

  if (!currentProject) return null;

  const status = currentProject.status || 'Em andamento';
  const statusColors = {
    'Em andamento': { bg: 'var(--accent-light)', fg: 'var(--accent)' },
    'Concluído': { bg: 'var(--green-light)', fg: 'var(--green)' },
    'Pausado': { bg: 'var(--yellow-light)', fg: 'var(--yellow)' },
  };
  const sc = statusColors[status];

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePdf = async () => {
    setExportingPdf(true);
    try { await onExportPDF(); } finally { setExportingPdf(false); }
  };
  const handleMd = async () => {
    setExportingMd(true);
    try { await onExportMD(); } finally { setExportingMd(false); }
  };

  return (
    <div style={headerStyles.root}>
      <div style={headerStyles.left}>
        <button style={headerStyles.iconBtn} onClick={onOpenProjects} title="Meus projetos">
          <span style={{ fontSize: 16 }}>📁</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Projetos</span>
        </button>
        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
            {currentProject.name}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
            {currentProject.cliente && <span>• {currentProject.cliente}</span>}
            <button onClick={() => setEditingMeta(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11, padding: 0, textDecoration: 'underline' }}>editar</button>
          </div>
        </div>
        <span style={{ ...headerStyles.statusBadge, background: sc.bg, color: sc.fg }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.fg }} />
          {status}
        </span>
      </div>

      <div style={headerStyles.right}>
        <span style={{ fontSize: 11, color: saveStatus === 'saved' ? 'var(--green)' : saveStatus === 'saving' ? 'var(--text-muted)' : 'var(--yellow)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: saveStatus === 'saved' ? 'var(--green)' : saveStatus === 'saving' ? 'var(--text-muted)' : 'var(--yellow)', animation: saveStatus === 'saving' ? 'pulse 1s infinite' : 'none' }} />
          {saveStatus === 'saved' ? 'Salvo' : saveStatus === 'saving' ? 'Salvando...' : 'Não salvo'}
        </span>
        <button style={headerStyles.iconBtn} onClick={handleSave} title="Salvar agora">
          <span style={{ fontSize: 14 }}>{saved ? '✓' : '💾'}</span>
          <span style={{ fontSize: 12 }}>{saved ? 'Salvo!' : 'Salvar'}</span>
        </button>
        <button style={headerStyles.iconBtn} onClick={handlePdf} title="Exportar PDF" disabled={exportingPdf}>
          <span style={{ fontSize: 14 }}>{exportingPdf ? '⏳' : '📄'}</span>
          <span style={{ fontSize: 12 }}>{exportingPdf ? 'Gerando...' : 'PDF'}</span>
        </button>
        <button style={headerStyles.iconBtn} onClick={handleMd} title="Pronto para importar no Obsidian" disabled={exportingMd}>
          <span style={{ fontSize: 14 }}>{exportingMd ? '⏳' : '🔷'}</span>
          <span style={{ fontSize: 12 }}>{exportingMd ? '...' : 'Obsidian'}</span>
        </button>
      </div>

      {editingMeta && (
        <ProjectMetaModal project={currentProject} onSave={(meta) => { onUpdateMeta(meta); setEditingMeta(false); }} onClose={() => setEditingMeta(false)} />
      )}
    </div>
  );
};

const ProjectMetaModal = ({ project, onSave, onClose }) => {
  const [name, setName] = React.useState(project.name || '');
  const [cliente, setCliente] = React.useState(project.cliente || '');
  const [status, setStatus] = React.useState(project.status || 'Em andamento');
  const [anotacoes, setAnotacoes] = React.useState(project.anotacoes || '');

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.body} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Informações do Projeto</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>Metadados usados no cabeçalho e nas exportações.</div>
        <label style={mLabel}>Nome do projeto</label>
        <Input value={name} onChange={setName} />
        <label style={mLabel}>Cliente / Responsável</label>
        <Input value={cliente} onChange={setCliente} placeholder="Nome do cliente..." />
        <label style={mLabel}>Status</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Em andamento', 'Concluído', 'Pausado'].map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: '1px solid ' + (status === s ? 'var(--accent)' : 'var(--border)'),
              background: status === s ? 'var(--accent-light)' : 'var(--bg-card)',
              color: status === s ? 'var(--accent)' : 'var(--text-secondary)',
            }}>{s}</button>
          ))}
        </div>
        <label style={mLabel}>Anotações gerais</label>
        <TextArea value={anotacoes} onChange={setAnotacoes} rows={5} placeholder="Observações, lembretes, links importantes..." />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave({ name, cliente, status, anotacoes })}>Salvar</Button>
        </div>
      </div>
    </div>
  );
};

// ─── Projects Drawer ───
const ProjectsDrawer = ({ isOpen, onClose, projects, currentId, onSelect, onDelete, onDuplicate, onNew }) => {
  return (
    <>
      <div style={{ ...drawerStyles.backdrop, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }} onClick={onClose} />
      <div style={{ ...drawerStyles.drawer, transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Meus Projetos</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{projects.length} projeto{projects.length !== 1 ? 's' : ''} salvo{projects.length !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>
        <div style={{ padding: '0 20px 14px' }}>
          <Button onClick={() => { onNew(); onClose(); }} style={{ width: '100%', justifyContent: 'center' }}>+ Novo Projeto</Button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 20px' }}>
          {projects.length === 0 && (
            <div style={drawerStyles.empty}>
              <div style={{ fontSize: 42, opacity: 0.2, marginBottom: 8 }}>📁</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Nenhum projeto ainda</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Crie o seu primeiro!</div>
            </div>
          )}
          {projects.slice().reverse().map(p => {
            const isCurrent = p.id === currentId;
            const updated = p.updated || p.created || Date.now();
            const d = new Date(updated);
            const dateStr = d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const status = p.status || 'Em andamento';
            const sc = { 'Em andamento': { bg: 'var(--accent-light)', fg: 'var(--accent)' }, 'Concluído': { bg: 'var(--green-light)', fg: 'var(--green)' }, 'Pausado': { bg: 'var(--yellow-light)', fg: 'var(--yellow)' } }[status];
            return (
              <div key={p.id} style={{ ...drawerStyles.projCard, borderColor: isCurrent ? 'var(--accent)' : 'var(--border-light)', background: isCurrent ? 'var(--accent-light)' : 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8, marginBottom: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    {p.cliente && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.cliente}</div>}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: sc.bg, color: sc.fg, whiteSpace: 'nowrap' }}>{status}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Atualizado: {dateStr}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { onSelect(p.id); onClose(); }} style={drawerStyles.smallBtn}>Abrir</button>
                  <button onClick={() => onDuplicate(p.id)} style={drawerStyles.smallBtn}>Duplicar</button>
                  <button onClick={() => onDelete(p.id)} style={{ ...drawerStyles.smallBtn, color: 'var(--red)' }}>Excluir</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const headerStyles = {
  root: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', gap: 12, flexShrink: 0, zIndex: 50 },
  left: { display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  iconBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'var(--transition)' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20 },
};

const drawerStyles = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', transition: 'opacity 0.25s', zIndex: 99 },
  drawer: { position: 'fixed', top: 0, left: 0, bottom: 0, width: 360, maxWidth: '90vw', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)', display: 'flex', flexDirection: 'column', zIndex: 100, boxShadow: '4px 0 20px rgba(0,0,0,0.1)' },
  empty: { textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' },
  projCard: { padding: 12, borderRadius: 'var(--radius)', border: '1px solid', marginBottom: 8, transition: 'var(--transition)' },
  smallBtn: { padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font)' },
};

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, animation: 'fadeIn 0.2s' },
  body: { background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 24, width: 460, maxWidth: '92vw', boxShadow: 'var(--shadow-lg)', animation: 'slideUp 0.25s' },
};
const mLabel = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginTop: 14, marginBottom: 6 };

window.AppHeader = AppHeader;
window.ProjectsDrawer = ProjectsDrawer;
window.ProjectMetaModal = ProjectMetaModal;
