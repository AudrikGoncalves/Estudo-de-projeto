// ─── Home / Project Selection ───
const HomeView = ({ projects, onCreateProject, onSelectProject, onDeleteProject }) => {
  const [name, setName] = React.useState('');
  const [showNew, setShowNew] = React.useState(false);

  const create = () => {
    if (!name.trim()) return;
    onCreateProject(name.trim());
    setName('');
    setShowNew(false);
  };

  return (
    <div style={{ padding: 48, maxWidth: 800, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, letterSpacing: 2, margin: '0 auto 16px' }}>MP</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Metodologia de Projeto</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
          Guia ativo para estudos preliminares de arquitetura. Método Análise › Síntese › Avaliação.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Seus Projetos</h2>
        <Button onClick={() => setShowNew(true)}>+ Novo Projeto</Button>
      </div>

      {showNew && (
        <Card style={{ marginBottom: 20, animation: 'scaleIn 0.2s ease' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Input value={name} onChange={setName} placeholder="Nome do projeto (ex: Residência Silva)" style={{ flex: 1 }} />
            <Button onClick={create}>Criar</Button>
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
          </div>
        </Card>
      )}

      {projects.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>◎</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nenhum projeto ainda. Crie seu primeiro projeto para começar.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {projects.map(p => {
            const data = loadProject(p.id);
            const done = (data.completedSteps || []).length;
            const pct = Math.round((done / 25) * 100);
            return (
              <Card key={p.id} onClick={() => onSelectProject(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18, cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
                  {p.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{done}/25 etapas · {pct}% concluído</div>
                </div>
                <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
                </div>
                <button onClick={e => { e.stopPropagation(); onDeleteProject(p.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: 4 }}>×</button>
              </Card>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 48, padding: 24, background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Sobre o Método</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { phase: 'Análise', desc: '15 etapas de levantamento — jamais resolver, apenas levantar.', color: 'accent', n: '01–15' },
            { phase: 'Síntese', desc: '6 etapas de conceituação, partido e decisões de projeto.', color: 'blue', n: '16–21' },
            { phase: 'Avaliação', desc: '4 etapas de verificação e estudo preliminar.', color: 'yellow', n: '22–25' },
          ].map(p => (
            <div key={p.phase} style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
              <Badge label={p.phase} color={p.color} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>Etapas {p.n}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ───
const DashboardView = ({ projectData, projectName, onNavigate }) => {
  const completed = projectData.completedSteps || [];
  const pct = Math.round((completed.length / 25) * 100);

  const phaseProgress = (steps) => {
    const done = steps.filter(s => completed.includes(s)).length;
    return { done, total: steps.length, pct: Math.round((done / steps.length) * 100) };
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, animation: 'fadeIn 0.3s ease', overflowY: 'auto', height: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{projectName}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Visão geral do progresso do projeto</p>
      </div>

      {/* Progress overview */}
      <Card style={{ marginBottom: 24, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--accent)' }}>{pct}%</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{completed.length} de 25 etapas concluídas</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: 25 }, (_, i) => (
              <div key={i} style={{ width: 10, height: 28, borderRadius: 3, background: completed.includes(i + 1) ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s', cursor: 'pointer' }}
                onClick={() => onNavigate('step', i + 1)}
                title={`Etapa ${i + 1}: ${STEPS_DATA[i].title}`} />
            ))}
          </div>
        </div>
      </Card>

      {/* Phase cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {PHASES.map(phase => {
          const allSteps = phase.groups.flatMap(g => g.steps);
          const p = phaseProgress(allSteps);
          return (
            <Card key={phase.id} style={{ padding: 20 }}>
              <Badge label={phase.label} color={phase.color} />
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{p.done}/{p.total}</div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${p.pct}%`, height: '100%', background: `var(--${phase.color})`, borderRadius: 2, transition: 'width 0.4s' }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Next step */}
      {completed.length < 25 && (() => {
        const next = STEPS_DATA.find(s => !completed.includes(s.id));
        return next ? (
          <Card style={{ padding: 20, borderLeft: `3px solid var(--${next.color})`, cursor: 'pointer' }} onClick={() => onNavigate('step', next.id)}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>PRÓXIMA ETAPA</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{next.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Etapa {next.id} — {next.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{next.subtitle}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 20, color: 'var(--text-muted)' }}>→</span>
            </div>
          </Card>
        ) : null;
      })()}

      {/* Recognição alert */}
      <Card style={{ marginTop: 24, padding: 20, background: 'var(--yellow-light)', border: '1px solid var(--yellow)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Lembrete: Recognição</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Na etapa de Análise: jamais resolver, apenas levantar. Se perceber que está propondo soluções formais durante a análise, pause e registre como intuição inicial para a síntese.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

window.HomeView = HomeView;
window.DashboardView = DashboardView;
