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
  const [projects, setProjects] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const save = (p) => { setProjects(p); localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); };
  return { projects, save };
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
  root: { width: 260, minWidth: 260, height: '100vh', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, padding: '20px 18px 12px' },
  logoIcon: { width: 36, height: 36, borderRadius: 8, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, letterSpacing: 1 },
  logoTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 },
  logoSub: { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.2 },
  projectBadge: { margin: '4px 14px 8px', padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 2, cursor: 'pointer', transition: 'var(--transition)' },
  progressWrap: { padding: '6px 18px 12px' },
  progressTrack: { height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', background: 'var(--accent)', borderRadius: 2, transition: 'width 0.4s ease' },
  nav: { flex: 1, overflowY: 'auto', padding: '4px 10px 20px' },
  item: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)', color: 'var(--text-secondary)' },
  itemActive: { background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' },
  divider: { height: 1, background: 'var(--border)', margin: '10px 0' },
  sectionLabel: { fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', padding: '8px 10px 4px' },
  phaseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px 4px', cursor: 'pointer' },
  groupLabel: { fontSize: 11, color: 'var(--text-muted)', padding: '4px 10px 2px', fontStyle: 'italic' },
  stepItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)' },
  stepActive: { background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' },
  stepDot: { width: 22, height: 22, minWidth: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, transition: 'var(--transition)' },
};

// ─── Cards ───
const Card = ({ children, style, onClick }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', ...(onClick ? { cursor: 'pointer', transition: 'var(--transition)' } : {}), ...style }} onClick={onClick}>
    {children}
  </div>
);

const Badge = ({ label, color = 'accent' }) => (
  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', padding: '3px 10px', borderRadius: 20, background: `var(--${color}-light)`, color: `var(--${color})` }}>
    {label}
  </span>
);

const Button = ({ children, onClick, variant = 'primary', style, disabled }) => {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 'var(--radius)', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font)', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'var(--transition)', opacity: disabled ? 0.5 : 1 };
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    secondary: { background: 'var(--bg-sidebar)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)' },
    danger: { background: 'var(--red-light)', color: 'var(--red)' },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>{children}</button>;
};

const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 14, fontFamily: 'var(--font)', resize: 'vertical', lineHeight: 1.6, background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', transition: 'var(--transition)' }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}
  />
);

const Input = ({ value, onChange, placeholder, style }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: '100%', padding: '9px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 14, fontFamily: 'var(--font)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', transition: 'var(--transition)', ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}
  />
);

window.useProjectStore = useProjectStore;
window.loadProject = loadProject;
window.saveProject = saveProject;
window.Sidebar = Sidebar;
window.Card = Card;
window.Badge = Badge;
window.Button = Button;
window.TextArea = TextArea;
window.Input = Input;
