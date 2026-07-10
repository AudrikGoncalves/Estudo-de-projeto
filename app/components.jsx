// ─── Persistence (localStorage, Vercel-safe) ───
// Migrate legacy key mp_projects → mp-projetos
const STORAGE_KEY = 'mp-projetos';
(function migrate() {
  try {
    const legacy = localStorage.getItem('mp_projects');
    const current = localStorage.getItem(STORAGE_KEY);
    if (legacy && !current) {
      localStorage.setItem(STORAGE_KEY, legacy);
    }
  } catch {}
})();

const useProjectStore = () => {
  const [projects, setProjectsState] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const save = (p) => { setProjectsState(p); localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); };
  const setProjects = (p) => { setProjectsState(p); localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); };
  return { projects, save, setProjects };
};

const loadProject = (id) => {
  try { return JSON.parse(localStorage.getItem(`mp_proj_${id}`) || '{}'); } catch { return {}; }
};
const saveProject = (id, data) => {
  localStorage.setItem(`mp_proj_${id}`, JSON.stringify(data));
};

// ─── Sidebar ───
const Sidebar = ({ currentView, onNavigate, projectName, completedSteps, currentStep, mobileOpen, onCloseMobile }) => {
  const [expanded, setExpanded] = React.useState({ analise: true, sintese: false, avaliacao: false });

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const progress = Math.round((completedSteps.length / 25) * 100);

  const handleNavClick = (view, stepId, toolId) => {
    onNavigate(view, stepId, toolId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      <div
        data-sidebar-backdrop
        data-mobile-open={mobileOpen ? 'true' : 'false'}
        onClick={onCloseMobile}
      />
    <div data-sidebar data-mobile-open={mobileOpen ? 'true' : 'false'} style={sidebarStyles.root}>
      <div style={sidebarStyles.logo}>
        <div style={sidebarStyles.logoIcon}>MP</div>
        <div style={{ flex: 1 }}>
          <div style={sidebarStyles.logoTitle}>Metodologia</div>
          <div style={sidebarStyles.logoSub}>de Projeto</div>
        </div>
        <button
          onClick={onCloseMobile}
          aria-label="Fechar menu"
          style={{
            display: 'none', background: 'none', border: 'none',
            fontSize: 22, color: 'var(--text-muted)', cursor: 'pointer',
            padding: 4, marginRight: -4,
          }}
          className="sidebar-close-btn"
        >×</button>
      </div>

      <div style={sidebarStyles.projectBadge} onClick={() => handleNavClick('home')}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Projeto atual</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{projectName || 'Sem projeto'}</span>
      </div>

      {projectName && (
        <>
          <div style={sidebarStyles.progressWrap}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <div style={sidebarStyles.progressTrack}>
              <div style={{ ...sidebarStyles.progressBar, width: `${progress}%` }} />
            </div>
          </div>

          <nav style={sidebarStyles.nav}>
            <SidebarItem icon="⊞" label="Visão Geral" active={currentView === 'dashboard'} onClick={() => handleNavClick('dashboard')} />
            <SidebarItem icon="⚙" label="Ferramentas" active={currentView === 'tools'} onClick={() => handleNavClick('tools')} />

            <div style={sidebarStyles.divider} />
            <div style={sidebarStyles.sectionLabel}>ETAPAS</div>

            {PHASES.map(phase => (
              <div key={phase.id}>
                <div style={sidebarStyles.phaseHeader} onClick={() => toggle(phase.id)}>
                  <span style={{ fontSize: 11, color: `var(--${phase.color})`, fontWeight: 700, letterSpacing: '0.05em' }}>
                    {phase.label.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', transform: expanded[phase.id] ? 'rotate(90deg)' : 'none', transition: 'var(--transition)' }}>▶</span>
                </div>
                {expanded[phase.id] && phase.groups.map(g => (
                  <div key={g.id}>
                    <div style={sidebarStyles.groupLabel}>{g.label}</div>
                    {g.steps.map(sId => {
                      const s = STEPS_DATA.find(x => x.id === sId);
                      const done = completedSteps.includes(sId);
                      const active = currentStep === sId && currentView === 'step';
                      return (
                        <div key={sId} style={{ ...sidebarStyles.stepItem, ...(active ? sidebarStyles.stepActive : {}), ...(done ? { opacity: 0.7 } : {}) }}
                          onClick={() => handleNavClick('step', sId)}>
                          <span style={{ ...sidebarStyles.stepDot, background: done ? `var(--${s.color})` : 'var(--border)', color: done ? '#fff' : 'var(--text-muted)', fontSize: done ? 9 : 10 }}>
                            {done ? '✓' : sId}
                          </span>
                          <span style={{ fontSize: 13, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.title}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </>
      )}
    </div>
    </>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div style={{ ...sidebarStyles.item, ...(active ? sidebarStyles.itemActive : {}) }} onClick={onClick}>
    <span style={{ fontSize: 15 }}>{icon}</span>
    <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 400 }}>{label}</span>
  </div>
);

const sidebarStyles = {
  root: { width: 272, minWidth: 272, height: '100vh', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  logo: { display: 'flex', alignItems: 'center', gap: 12, padding: '22px 20px 16px' },
  logoIcon: { width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, oklch(0.62 0.17 30), oklch(0.5 0.16 25))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, letterSpacing: 1, boxShadow: 'var(--shadow-accent)' },
  logoTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.02em' },
  logoSub: { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.2, letterSpacing: '-0.005em' },
  projectBadge: { margin: '6px 16px 10px', padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 3, cursor: 'pointer', transition: 'var(--transition)', boxShadow: 'var(--shadow-xs)' },
  progressWrap: { padding: '8px 20px 14px' },
  progressTrack: { height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' },
  progressBar: { height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-dark))', borderRadius: 99, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' },
  nav: { flex: 1, overflowY: 'auto', padding: '4px 12px 24px' },
  item: { display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)', color: 'var(--text-secondary)' },
  itemActive: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' },
  divider: { height: 1, background: 'var(--border-light)', margin: '12px 4px' },
  sectionLabel: { fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '10px 12px 6px', textTransform: 'uppercase' },
  phaseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px 6px', cursor: 'pointer', borderRadius: 'var(--radius-xs)' },
  groupLabel: { fontSize: 11, color: 'var(--text-muted)', padding: '6px 12px 4px', fontWeight: 500, letterSpacing: '-0.005em' },
  stepItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 'var(--radius-xs)', cursor: 'pointer', transition: 'var(--transition)' },
  stepActive: { background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-sm)' },
  stepDot: { width: 22, height: 22, minWidth: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 10, transition: 'var(--transition)' },
};

// ─── Cards ───
const Card = ({ children, style, onClick, interactive }) => {
  const isInteractive = Boolean(onClick) || interactive;
  return (
    <div
      data-premium-card={isInteractive ? 'true' : undefined}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: 26,
        boxShadow: 'var(--shadow-sm)',
        ...(isInteractive ? { cursor: 'pointer', transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)' } : {}),
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const Badge = ({ label, color = 'accent' }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    padding: '4px 11px',
    borderRadius: 999,
    background: `var(--${color}-light)`,
    color: `var(--${color})`,
    lineHeight: 1.3,
  }}>
    {label}
  </span>
);

const Button = ({ children, onClick, variant = 'primary', style, disabled, size = 'md' }) => {
  const sizes = {
    sm: { padding: '8px 14px', fontSize: 13, borderRadius: 'var(--radius-sm)' },
    md: { padding: '11px 20px', fontSize: 14, borderRadius: 'var(--radius)' },
    lg: { padding: '14px 26px', fontSize: 15, borderRadius: 'var(--radius)' },
  };
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontWeight: 600,
    fontFamily: 'var(--font)',
    letterSpacing: '-0.01em',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'transform var(--transition), box-shadow var(--transition), background var(--transition), filter var(--transition)',
    opacity: disabled ? 0.45 : 1,
    whiteSpace: 'nowrap',
    ...sizes[size],
  };
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' },
    secondary: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)' },
    danger: { background: 'var(--red-light)', color: 'var(--red)' },
    outline: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' },
  };
  return (
    <button
      data-premium-btn="true"
      style={{ ...base, ...variants[variant], ...style }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    style={{
      width: '100%',
      padding: '14px 16px',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      fontSize: 14.5,
      fontFamily: 'var(--font)',
      resize: 'vertical',
      lineHeight: 1.6,
      background: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      outline: 'none',
      transition: 'border-color var(--transition), box-shadow var(--transition)',
      letterSpacing: '-0.005em',
    }}
    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 4px var(--accent-light)'; }}
    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
  />
);

const Input = ({ value, onChange, placeholder, style }) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: '100%',
      padding: '12px 16px',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      fontSize: 14.5,
      fontFamily: 'var(--font)',
      background: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      outline: 'none',
      transition: 'border-color var(--transition), box-shadow var(--transition)',
      letterSpacing: '-0.005em',
      ...style,
    }}
    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 4px var(--accent-light)'; }}
    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
  />
);

// ─── Dialogs (substituem confirm()/prompt() nativos) ───
const dialogStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, animation: 'fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)' },
  body: { background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)', padding: 26, width: 400, maxWidth: '92vw', boxShadow: 'var(--shadow-xl)', animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)', border: '1px solid var(--border-light)' },
};

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirmar', danger, onConfirm, onCancel }) => {
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onCancel(); if (e.key === 'Enter') onConfirm(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onConfirm, onCancel]);
  if (!open) return null;
  return (
    <div style={dialogStyles.overlay} onClick={onCancel}>
      <div style={dialogStyles.body} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</div>
        {message && <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 20 }}>{message}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
};

const PromptDialog = ({ open, title, message, placeholder, initialValue = '', submitLabel = 'OK', onSubmit, onCancel }) => {
  const [value, setValue] = React.useState(initialValue);
  React.useEffect(() => { if (open) setValue(initialValue); }, [open]);
  if (!open) return null;
  const submit = () => { if (value.trim()) onSubmit(value.trim()); };
  return (
    <div style={dialogStyles.overlay} onClick={onCancel}>
      <div style={dialogStyles.body} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</div>
        {message && <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 14 }}>{message}</div>}
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
          placeholder={placeholder}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 14.5, fontFamily: 'var(--font)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', marginBottom: 18 }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button onClick={submit} disabled={!value.trim()}>{submitLabel}</Button>
        </div>
      </div>
    </div>
  );
};

// ─── Undo history for canvas tools (Ctrl+Z) ───
const useCanvasHistory = (max = 40) => {
  const past = React.useRef([]);
  const push = (snapshot) => {
    past.current.push(JSON.stringify(snapshot));
    if (past.current.length > max) past.current.shift();
  };
  const undo = () => {
    const prev = past.current.pop();
    return prev ? JSON.parse(prev) : null;
  };
  return { push, undo, canUndo: () => past.current.length > 0 };
};

// ─── Download canvas as PNG ───
const downloadCanvasPNG = (canvas, filename) => {
  if (!canvas) return;
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename.replace(/\s+/g, '-').toLowerCase() + '.png';
  a.click();
};

// ─── Force-directed layout (usado por Diagrama e Fluxograma) ───
// items: [{id, x, y}], links: [{from, to}], getRadius(item) -> px
const forceLayout = (items, links, { width = 800, height = 500, getRadius, iterations = 220, linkStrength = 0.012 }) => {
  const pos = {};
  items.forEach((it, i) => {
    // Se não tem posição, distribui em círculo
    const angle = (i / items.length) * Math.PI * 2;
    pos[it.id] = { x: it.x || width / 2 + Math.cos(angle) * 150, y: it.y || height / 2 + Math.sin(angle) * 120 };
  });
  const radii = {};
  items.forEach(it => { radii[it.id] = getRadius(it); });

  for (let iter = 0; iter < iterations; iter++) {
    const cooling = 1 - iter / iterations;
    // Repulsão entre todos + colisão
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = pos[items[i].id], b = pos[items[j].id];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = radii[items[i].id] + radii[items[j].id] + 24;
        if (d < minDist) {
          const push = (minDist - d) / 2 * 0.5 * cooling + 0.5;
          dx /= d; dy /= d;
          a.x -= dx * push; a.y -= dy * push;
          b.x += dx * push; b.y += dy * push;
        }
      }
    }
    // Atração pelas ligações
    links.forEach(l => {
      const a = pos[l.from], b = pos[l.to];
      if (!a || !b) return;
      const ideal = radii[l.from] + radii[l.to] + 40;
      let dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (d - ideal) * linkStrength * cooling;
      dx /= d; dy /= d;
      a.x += dx * force * d * 0.05; a.y += dy * force * d * 0.05;
      b.x -= dx * force * d * 0.05; b.y -= dy * force * d * 0.05;
    });
    // Gravidade para o centro
    items.forEach(it => {
      const p = pos[it.id];
      p.x += (width / 2 - p.x) * 0.004 * cooling;
      p.y += (height / 2 - p.y) * 0.004 * cooling;
    });
  }
  // Clamp nos limites
  items.forEach(it => {
    const p = pos[it.id], r = radii[it.id];
    p.x = Math.max(r + 8, Math.min(width - r - 8, p.x));
    p.y = Math.max(r + 8, Math.min(height - r - 8, p.y));
  });
  return pos;
};

window.useProjectStore = useProjectStore;
window.loadProject = loadProject;
window.saveProject = saveProject;
window.Sidebar = Sidebar;
window.Card = Card;
window.Badge = Badge;
window.Button = Button;
window.TextArea = TextArea;
window.Input = Input;
window.ConfirmDialog = ConfirmDialog;
window.PromptDialog = PromptDialog;
window.useCanvasHistory = useCanvasHistory;
window.downloadCanvasPNG = downloadCanvasPNG;
window.forceLayout = forceLayout;
