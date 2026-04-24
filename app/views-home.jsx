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
    <div
      data-home-view
      style={{
        padding: '56px 48px 64px',
        maxWidth: 980,
        margin: '0 auto',
        animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* ─── Hero ─── */}
      <section
        className="mp-gradient-bg"
        style={{
          position: 'relative',
          textAlign: 'center',
          padding: '56px 32px 52px',
          marginBottom: 40,
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: 'linear-gradient(135deg, oklch(0.62 0.17 30), oklch(0.48 0.17 25))',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 2,
            margin: '0 auto 24px',
            boxShadow: '0 12px 32px oklch(0.58 0.16 30 / 0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
            animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          MP
        </div>
        <h1
          data-home-hero-title
          style={{
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: 14,
            background: 'linear-gradient(180deg, var(--text-primary) 0%, var(--text-secondary) 120%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Metodologia de Projeto
        </h1>
        <p
          data-home-hero-sub
          style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            maxWidth: 560,
            margin: '0 auto',
            lineHeight: 1.55,
            letterSpacing: '-0.01em',
            fontWeight: 400,
          }}
        >
          Guia ativo para estudos preliminares de arquitetura.
          <br />
          Método Análise · Síntese · Avaliação.
        </p>

        {/* Hero CTA */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 30, flexWrap: 'wrap' }}>
          <Button size="lg" onClick={() => setShowNew(true)}>
            <span style={{ fontSize: 18, marginRight: 2 }}>+</span> Novo projeto
          </Button>
          {projects.length > 0 && (
            <Button size="lg" variant="secondary" onClick={() => onSelectProject(projects[0].id)}>
              Continuar último →
            </Button>
          )}
        </div>
      </section>

      {/* ─── New Project Inline Form ─── */}
      {showNew && (
        <Card
          style={{
            marginBottom: 28,
            animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            padding: 20,
            border: '1px solid var(--accent-light)',
            boxShadow: 'var(--shadow-accent)',
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Input
              value={name}
              onChange={setName}
              placeholder="Nome do projeto (ex: Residência Silva)"
              style={{ flex: 1, minWidth: 220 }}
            />
            <Button onClick={create}>Criar</Button>
            <Button variant="ghost" onClick={() => setShowNew(false)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* ─── Projects Section ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 18,
          padding: '0 4px',
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em' }}>
          Seus projetos
        </h2>
        {projects.length > 0 && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}
          </span>
        )}
      </div>

      {projects.length === 0 ? (
        <Card
          style={{
            textAlign: 'center',
            padding: '60px 32px',
            borderStyle: 'dashed',
            borderColor: 'var(--border)',
            background: 'var(--bg-subtle)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: 16,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: 'var(--text-muted)',
            }}
          >
            ◎
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
            Nenhum projeto ainda
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
            Crie seu primeiro projeto para começar a jornada.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {projects.map((p, idx) => {
            const data = loadProject(p.id);
            const done = (data.completedSteps || []).length;
            const pct = Math.round((done / 25) * 100);
            const initial = p.name[0].toUpperCase();
            return (
              <Card
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '20px 22px',
                  animation: `fadeIn 0.4s ${idx * 50}ms cubic-bezier(0.4, 0, 0.2, 1) both`,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    minWidth: 52,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, var(--accent-light), var(--bg-subtle))',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  {initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 12.5,
                      color: 'var(--text-muted)',
                      fontWeight: 500,
                    }}
                  >
                    <span>{done}/25 etapas</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.6 }} />
                    <span style={{ color: pct === 100 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {pct}% {pct === 100 && '✓'}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: 80,
                    height: 6,
                    background: 'var(--border-light)',
                    borderRadius: 99,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: pct === 100
                        ? 'linear-gradient(90deg, var(--green), var(--green))'
                        : 'linear-gradient(90deg, var(--accent), var(--accent-dark))',
                      borderRadius: 99,
                      transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteProject(p.id); }}
                  aria-label="Excluir projeto"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 18,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-light)'; e.currentTarget.style.color = 'var(--red)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  ×
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Método Section (premium) ─── */}
      <div
        style={{
          marginTop: 56,
          padding: '36px 32px',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--accent)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            O Método
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 6 }}>
            Três fases, vinte e cinco etapas
          </h3>
          <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', maxWidth: 540, lineHeight: 1.55 }}>
            Uma sequência estruturada para transformar o problema arquitetônico em estudo preliminar robusto.
          </p>
        </div>

        <div
          data-home-phases-grid
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 24 }}
        >
          {[
            { phase: 'Análise', desc: '15 etapas de levantamento — jamais resolver, apenas levantar.', color: 'accent', n: '01–15' },
            { phase: 'Síntese', desc: '6 etapas de conceituação, partido e decisões de projeto.', color: 'blue', n: '16–21' },
            { phase: 'Avaliação', desc: '4 etapas de verificação e estudo preliminar.', color: 'yellow', n: '22–25' },
          ].map((p, idx) => (
            <div
              key={p.phase}
              style={{
                padding: 22,
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-xs)',
                transition: 'var(--transition)',
                animation: `fadeIn 0.5s ${120 + idx * 80}ms cubic-bezier(0.4, 0, 0.2, 1) both`,
              }}
            >
              <Badge label={p.phase} color={p.color} />
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginTop: 12,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.02em',
                  fontWeight: 500,
                }}
              >
                ETAPAS {p.n}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.55 }}>
                {p.desc}
              </div>
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
    <div
      data-dashboard-view
      style={{
        padding: '40px 48px 56px',
        maxWidth: 1040,
        margin: '0 auto',
        animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--accent)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Projeto
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.035em', marginBottom: 6, lineHeight: 1.1 }}>
          {projectName}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Visão geral do progresso do projeto
        </p>
      </div>

      {/* ─── Progress hero card ─── */}
      <Card style={{ marginBottom: 24, padding: 32, position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-dark) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
              }}
            >
              {pct}%
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
              {completed.length} de 25 etapas concluídas
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', maxWidth: '100%' }}>
            {Array.from({ length: 25 }, (_, i) => {
              const isDone = completed.includes(i + 1);
              return (
                <div
                  key={i}
                  style={{
                    width: 11,
                    height: 32,
                    borderRadius: 4,
                    background: isDone ? 'var(--accent)' : 'var(--border)',
                    transition: 'background var(--transition), transform var(--transition)',
                    cursor: 'pointer',
                    boxShadow: isDone ? '0 2px 6px var(--accent-glow, rgba(0,0,0,0.08))' : 'none',
                  }}
                  onClick={() => onNavigate('step', i + 1)}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scaleY(1.12)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scaleY(1)')}
                  title={`Etapa ${i + 1}: ${STEPS_DATA[i].title}`}
                />
              );
            })}
          </div>
        </div>
      </Card>

      {/* ─── Phase cards ─── */}
      <div
        data-dashboard-grid
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
          marginBottom: 28,
        }}
      >
        {PHASES.map(phase => {
          const allSteps = phase.groups.flatMap(g => g.steps);
          const p = phaseProgress(allSteps);
          return (
            <Card key={phase.id} style={{ padding: 22 }}>
              <Badge label={phase.label} color={phase.color} />
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {p.done}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>/{p.total}</span>
                </div>
                <div
                  style={{
                    height: 5,
                    background: 'var(--border-light)',
                    borderRadius: 99,
                    marginTop: 10,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${p.pct}%`,
                      height: '100%',
                      background: `var(--${phase.color})`,
                      borderRadius: 99,
                      transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ─── Next step callout ─── */}
      {completed.length < 25 && (() => {
        const next = STEPS_DATA.find(s => !completed.includes(s.id));
        return next ? (
          <Card
            style={{
              padding: '22px 26px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-subtle))',
              border: `1px solid var(--${next.color}-light)`,
            }}
            onClick={() => onNavigate('step', next.id)}
          >
            <div
              style={{
                fontSize: 10,
                color: `var(--${next.color})`,
                marginBottom: 10,
                letterSpacing: '0.12em',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Próxima etapa
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 32, flexShrink: 0 }}>{next.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    marginBottom: 2,
                  }}
                >
                  Etapa {next.id} — {next.title}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  {next.subtitle}
                </div>
              </div>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 22,
                  color: `var(--${next.color})`,
                  fontWeight: 300,
                }}
              >
                →
              </span>
            </div>
          </Card>
        ) : null;
      })()}

      {/* ─── Recognição alert ─── */}
      <Card
        style={{
          marginTop: 20,
          padding: '20px 24px',
          background: 'var(--yellow-light)',
          border: '1px solid var(--yellow-light)',
          borderLeft: '3px solid var(--yellow)',
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 4,
                letterSpacing: '-0.015em',
              }}
            >
              Lembrete: Recognição
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
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
