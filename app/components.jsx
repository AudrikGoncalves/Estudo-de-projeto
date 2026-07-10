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

// ─── Ícones de linha (substituem os emojis) ───
const ICON_PATHS = {
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>,
  diamond: <path d="M12 2l9 10-9 10-9-10 9-10z" />,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="M18 6L6 18M6 6l12 12" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 18l-6-6 6-6" />,
  alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></>,
  check: <path d="M20 6L9 17l-5-5" />,
  download: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
  compass: <><circle cx="12" cy="12" r="10" /><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
};

const Icon = ({ name, size = 16, strokeWidth = 1.6, style }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: 'block', ...style }}
    aria-hidden="true"
  >
    {ICON_PATHS[name] || null}
  </svg>
);

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
        <div style={{ flex: 1 }}>
          <div style={sidebarStyles.logoTitle}>Metodologia<br/>de Projeto<span style={{ color: 'var(--accent)' }}>.</span></div>
          <div style={sidebarStyles.logoSub}>ANÁLISE — SÍNTESE — AVALIAÇÃO</div>
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
                  <span style={{ fontSize: 10, color: `var(--${phase.color})`, fontWeight: 600, letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
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
                          <span style={{ ...sidebarStyles.stepDot, background: done ? 'var(--text-primary)' : 'transparent', border: done ? '1px solid var(--text-primary)' : '1px solid var(--border-strong)', color: done ? 'var(--bg)' : 'var(--text-muted)', fontSize: done ? 9 : 9.5 }}>
                            {done ? '✓' : String(sId).padStart(2, '0')}
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
  root: { width: 272, minWidth: 272, height: '100vh', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  logo: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' },
  logoTitle: { fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.03em' },
  logoSub: { fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.2, letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginTop: 8 },
  projectBadge: { margin: '14px 16px 10px', padding: '11px 13px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 3, cursor: 'pointer', transition: 'var(--transition)' },
  progressWrap: { padding: '8px 20px 14px' },
  progressTrack: { height: 3, background: 'var(--border)', overflow: 'hidden' },
  progressBar: { height: '100%', background: 'var(--text-primary)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' },
  nav: { flex: 1, overflowY: 'auto', padding: '4px 12px 24px' },
  item: { display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)', color: 'var(--text-secondary)' },
  itemActive: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
  divider: { height: 1, background: 'var(--border)', margin: '12px 4px' },
  sectionLabel: { fontSize: 9.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.14em', padding: '10px 12px 6px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' },
  phaseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px 6px', cursor: 'pointer', borderRadius: 'var(--radius-xs)' },
  groupLabel: { fontSize: 11, color: 'var(--text-muted)', padding: '6px 12px 4px', fontWeight: 500, letterSpacing: '-0.005em' },
  stepItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 'var(--radius-xs)', cursor: 'pointer', transition: 'var(--transition)' },
  stepActive: { background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-sm)' },
  stepDot: { width: 22, height: 22, minWidth: 22, borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 10, transition: 'var(--transition)', fontFamily: 'var(--font-mono)' },
};

// ─── Cards ───
const Card = ({ children, style, onClick, interactive }) => {
  const isInteractive = Boolean(onClick) || interactive;
  return (
    <div
      data-premium-card={isInteractive ? 'true' : undefined}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 26,
        ...(isInteractive ? { cursor: 'pointer' } : {}),
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
    fontSize: 9.5,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-mono)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-xs)',
    border: `1px solid var(--${color})`,
    background: 'transparent',
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
    primary: { background: 'var(--text-primary)', color: 'var(--bg)' },
    secondary: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)' },
    danger: { background: 'var(--accent)', color: '#fff' },
    outline: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' },
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
window.Icon = Icon;
window.ConfirmDialog = ConfirmDialog;
window.PromptDialog = PromptDialog;
window.useCanvasHistory = useCanvasHistory;
window.downloadCanvasPNG = downloadCanvasPNG;
window.forceLayout = forceLayout;
