// ─── Home / Project Selection ───
const HomeView = ({ projects, onCreateProject, onSelectProject, onDeleteProject, onImportBackup }) => {
  const [name, setName] = React.useState('');
  const [showNew, setShowNew] = React.useState(false);
  const [backingUp, setBackingUp] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [backupMsg, setBackupMsg] = React.useState(null);
  const importRef = React.useRef(null);

  const create = () => {
    if (!name.trim()) return;
    onCreateProject(name.trim());
    setName('');
    setShowNew(false);
  };

  const handleExportBackup = async () => {
    setBackingUp(true);
    try { await exportBackup(projects); }
    catch (e) { setBackupMsg({ type: 'error', text: 'Erro ao gerar backup: ' + e.message }); }
    finally { setBackingUp(false); }
  };

  const handleImportFile = async (file) => {
    if (!file) return;
    setImporting(true);
    setBackupMsg(null);
    try {
      const count = await onImportBackup(file);
      setBackupMsg({ type: 'ok', text: `${count} projeto${count !== 1 ? 's' : ''} restaurado${count !== 1 ? 's' : ''} com sucesso.` });
    } catch (e) {
      setBackupMsg({ type: 'error', text: e.message });
    } finally {
      setImporting(false);
      setTimeout(() => setBackupMsg(null), 6000);
    }
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
      {/* ─── Masthead editorial ─── */}
      <section
        style={{
          position: 'relative',
          padding: '36px 0 44px',
          marginBottom: 8,
          borderTop: '3px solid var(--text-primary)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Guia de projeto arquitetônico
          </span>
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ANÁLISE — SÍNTESE — AVALIAÇÃO
          </span>
        </div>
        <h1
          data-home-hero-title
          style={{
            fontSize: 58,
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 0.98,
            marginBottom: 18,
            color: 'var(--text-primary)',
            maxWidth: 720,
          }}
        >
          Metodologia<br />de Projeto<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p
          data-home-hero-sub
          style={{
            fontSize: 17,
            color: 'var(--text-secondary)',
            maxWidth: 520,
            lineHeight: 1.55,
            letterSpacing: '-0.01em',
            fontWeight: 400,
          }}
        >
          Do problema arquitetônico ao estudo preliminar, em 25 etapas estruturadas.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
          <Button size="lg" onClick={() => setShowNew(true)}>
            <Icon name="plus" size={16} /> Novo projeto
          </Button>
          {projects.length > 0 && (
            <Button size="lg" variant="secondary" onClick={() => onSelectProject(projects[0].id)}>
              Continuar último <Icon name="arrowRight" size={15} />
            </Button>
          )}
        </div>
      </section>

      {/* ─── New Project Inline Form ─── */}
      {showNew && (
        <Card
          style={{
            marginBottom: 28,
            animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.3, 0.64, 1)',
            padding: 20,
            borderColor: 'var(--text-primary)',
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
          marginBottom: 0,
          paddingTop: 22,
          paddingBottom: 14,
          borderTop: '1px solid var(--text-primary)',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em' }}>
          Projetos
          {projects.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-mono)', marginLeft: 10 }}>
              ({String(projects.length).padStart(2, '0')})
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {projects.length > 0 && (
            <Button size="sm" variant="ghost" onClick={handleExportBackup} disabled={backingUp} style={{ fontSize: 12 }}>
              <Icon name="download" size={13} /> {backingUp ? 'Gerando...' : 'Backup'}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => importRef.current?.click()} disabled={importing} style={{ fontSize: 12 }}>
            <Icon name="upload" size={13} /> {importing ? 'Restaurando...' : 'Restaurar'}
          </Button>
          <input ref={importRef} type="file" accept="application/json,.json" style={{ display: 'none' }}
            onChange={e => { handleImportFile(e.target.files[0]); e.target.value = ''; }} />
        </div>
      </div>

      {backupMsg && (
        <div style={{
          marginBottom: 16, padding: '10px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500,
          background: backupMsg.type === 'ok' ? 'var(--green-light)' : 'var(--red-light)',
          color: backupMsg.type === 'ok' ? 'var(--green)' : 'var(--red)',
        }}>
          {backupMsg.type === 'ok' ? '✓ ' : '✕ '}{backupMsg.text}
        </div>
      )}

      {projects.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '56px 32px',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
            Nenhum projeto ainda
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
            Comece pelo botão acima — o método cuida do resto.
          </p>
        </div>
      ) : (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          {projects.map((p, idx) => {
            const data = loadProject(p.id);
            const done = (data.completedSteps || []).length;
            const pct = Math.round((done / 25) * 100);
            return (
              <div
                key={p.id}
                data-premium-card="true"
                onClick={() => onSelectProject(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: '18px 8px',
                  borderTop: '1px solid var(--border)',
                  cursor: 'pointer',
                  animation: `fadeIn 0.35s ${idx * 40}ms cubic-bezier(0.4, 0, 0.2, 1) both`,
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', minWidth: 26 }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      letterSpacing: '-0.025em',
                      marginBottom: 3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {String(done).padStart(2, '0')}/25 ETAPAS
                    {p.cliente ? ` · ${p.cliente.toUpperCase()}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 90, height: 3, background: 'var(--border)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: pct === 100 ? 'var(--green)' : 'var(--text-primary)',
                        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: pct === 100 ? 'var(--green)' : 'var(--text-secondary)', minWidth: 40, textAlign: 'right' }}>
                    {pct}%
                  </span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteProject(p.id); }}
                  aria-label="Excluir projeto"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    width: 30,
                    height: 30,
                    borderRadius: 'var(--radius-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Método (editorial, três colunas com réguas) ─── */}
      <div style={{ marginTop: 56 }}>
        <div style={{ paddingTop: 22, paddingBottom: 22, borderTop: '1px solid var(--text-primary)' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--accent)',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
              marginBottom: 10,
            }}
          >
            O Método
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
            Três fases, vinte e cinco etapas
          </h3>
          <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', maxWidth: 540, lineHeight: 1.55 }}>
            Uma sequência estruturada para transformar o problema arquitetônico em estudo preliminar consistente.
          </p>
        </div>

        <div
          data-home-phases-grid
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}
        >
          {[
            { phase: 'Análise', desc: '15 etapas de levantamento — jamais resolver, apenas levantar.', n: '01–15', idx: 'I' },
            { phase: 'Síntese', desc: '6 etapas de conceituação, partido e decisões de projeto.', n: '16–21', idx: 'II' },
            { phase: 'Avaliação', desc: '4 etapas de verificação e estudo preliminar.', n: '22–25', idx: 'III' },
          ].map((p, idx) => (
            <div
              key={p.phase}
              style={{
                paddingTop: 16,
                borderTop: '1px solid var(--border-strong)',
                animation: `fadeIn 0.45s ${100 + idx * 70}ms cubic-bezier(0.4, 0, 0.2, 1) both`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>{p.phase}</span>
                <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                  ETAPAS {p.n}
                </span>
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Pendências inteligentes: cruza dados das etapas/ferramentas e aponta o que falta ───
// Retorna null se o projeto ainda não tem atividade (não poluir projeto recém-criado).
const computePendencias = (d) => {
  const out = [];
  const completed = d.completedSteps || [];
  const progRows = (d.programa || []).filter(r => (r.ambiente || '').trim());
  const leg = d.legislacaoData || {};
  const legFields = window.LEGISLACAO_FIELDS || [];
  const legFilled = legFields.filter(f => String(leg[f.key] || '').trim()).length;
  const hier = d.hierarquizacao || {};
  const hierCount = Object.keys(hier).length;

  const hasActivity = completed.length > 0 || progRows.length > 0 || legFilled > 0 || hierCount > 0;
  if (!hasActivity) return null;

  // Programa de Necessidades
  if (completed.includes(4) && progRows.length === 0)
    out.push({ level: 'red', text: 'Etapa 4 concluída, mas o Programa de Necessidades está vazio', go: { view: 'tools', tool: 'programa' } });
  const semArea = progRows.filter(r => !(parseFloat(r.area) > 0));
  if (progRows.length > 0 && semArea.length > 0)
    out.push({ level: 'yellow', text: `${semArea.length} ambiente${semArea.length > 1 ? 's' : ''} sem área no Programa de Necessidades`, go: { view: 'tools', tool: 'programa' } });

  // Legislação
  if (completed.includes(15) && legFilled === 0)
    out.push({ level: 'red', text: 'Etapa 15 concluída, mas a Legislação Urbanística está vazia', go: { view: 'tools', tool: 'legislacao' } });
  else if (legFilled > 0 && legFilled < legFields.length)
    out.push({ level: 'yellow', text: `Legislação urbanística incompleta: ${legFilled}/${legFields.length} parâmetros preenchidos`, go: { view: 'tools', tool: 'legislacao' } });

  // Viabilidade
  const progTotal = progRows.reduce((s, r) => s + (parseFloat(r.area) || 0), 0);
  const caMax = parseFloat(leg.ca_maximo) || 0;
  const areaTerreno = parseFloat(d.viabilidade?.areaTerreno) || 0;
  if (progTotal > 0 && caMax > 0 && areaTerreno === 0)
    out.push({ level: 'yellow', text: 'Viabilidade ainda não verificada (programa e CA já preenchidos)', go: { view: 'tools', tool: 'viabilidade' } });
  if (progTotal > 0 && caMax > 0 && areaTerreno > 0 && progTotal > areaTerreno * caMax)
    out.push({ level: 'red', text: `O programa (${progTotal.toFixed(0)}m²) NÃO cabe na área edificável (${(areaTerreno * caMax).toFixed(0)}m²)`, go: { view: 'tools', tool: 'viabilidade' } });

  // Hierarquização
  const sinteseStarted = completed.some(id => id >= 17);
  const analiseDone = completed.filter(id => id <= 15).length;
  if (sinteseStarted && hierCount === 0)
    out.push({ level: 'red', text: 'Etapas de Síntese concluídas sem a Hierarquização preenchida', go: { view: 'tools', tool: 'hierarquizacao' } });
  else if (hierCount > 0 && !Object.values(hier).includes('grande'))
    out.push({ level: 'yellow', text: 'Nenhum problema classificado como GRANDE importância na Hierarquização', go: { view: 'tools', tool: 'hierarquizacao' } });
  else if (analiseDone >= 12 && hierCount === 0)
    out.push({ level: 'yellow', text: 'Análise quase completa — hora de hierarquizar os problemas (etapa 16)', go: { view: 'step', step: 16 } });

  // Estudo de Papéis × legislação (TO/CA)
  const papeis = d.papeis;
  if (papeis?.rooms?.length > 0 && papeis.lotW > 0 && papeis.lotH > 0) {
    const lotArea = papeis.lotW * papeis.lotH;
    const toMax = parseFloat(leg.to_maxima) || 0;
    const terreo = papeis.rooms.filter(r => (r.floor || 0) === 0).reduce((s, r) => s + r.mw * r.mh, 0);
    const toAtual = (terreo / lotArea) * 100;
    if (toMax > 0 && toAtual > toMax)
      out.push({ level: 'red', text: `Taxa de ocupação estourada no Estudo de Papéis (${toAtual.toFixed(0)}% > máx ${toMax}%)`, go: { view: 'tools', tool: 'papeis' } });
    const caAtual = papeis.rooms.reduce((s, r) => s + r.mw * r.mh, 0) / lotArea;
    if (caMax > 0 && caAtual > caMax)
      out.push({ level: 'red', text: `Coeficiente de aproveitamento estourado no Estudo de Papéis (${caAtual.toFixed(2)} > máx ${caMax})`, go: { view: 'tools', tool: 'papeis' } });
  }

  // Etapas concluídas sem nenhuma anotação
  const semNotas = completed.filter(id => {
    const n = (d.stepNotes || {})[id];
    if (!n) return true;
    const hasField = Object.values(n.fields || {}).some(v => String(v || '').trim());
    return !hasField && !String(n.general || '').trim();
  });
  if (semNotas.length > 0)
    out.push({ level: 'yellow', text: `${semNotas.length} etapa${semNotas.length > 1 ? 's' : ''} concluída${semNotas.length > 1 ? 's' : ''} sem nenhuma anotação`, go: { view: 'step', step: semNotas[0] } });

  // Vermelhas primeiro
  out.sort((a, b) => (a.level === 'red' ? 0 : 1) - (b.level === 'red' ? 0 : 1));
  return out;
};

const PendenciasCard = ({ projectData, onNavigate }) => {
  const pend = computePendencias(projectData);
  if (!pend) return null;

  const go = (item) => {
    if (item.go.view === 'step') onNavigate('step', item.go.step);
    else onNavigate('tools', null, item.go.tool);
  };

  return (
    <Card style={{ marginBottom: 20, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: pend.length > 0 ? 14 : 0 }}>
        <span style={{ color: pend.length === 0 ? 'var(--green)' : 'var(--accent)', display: 'flex' }}>
          <Icon name={pend.length === 0 ? 'check' : 'alert'} size={16} />
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Pendências</span>
        {pend.length > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: pend.some(p => p.level === 'red') ? 'var(--red-light)' : 'var(--yellow-light)', color: pend.some(p => p.level === 'red') ? 'var(--red)' : 'var(--yellow)' }}>
            {pend.length}
          </span>
        )}
        {pend.length === 0 && (
          <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Nenhuma pendência detectada — dados consistentes até aqui.</span>
        )}
      </div>
      {pend.length > 0 && (
        <div style={{ display: 'grid', gap: 8 }}>
          {pend.map((p, i) => (
            <div
              key={i}
              onClick={() => go(p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'var(--transition)',
                background: p.level === 'red' ? 'var(--red-light)' : 'var(--yellow-light)',
                borderLeft: `3px solid var(--${p.level === 'red' ? 'red' : 'yellow'})`,
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1, lineHeight: 1.45 }}>{p.text}</span>
              <span style={{ color: `var(--${p.level === 'red' ? 'red' : 'yellow'})`, fontSize: 14, flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>
      )}
    </Card>
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
      <div style={{ marginBottom: 32, borderTop: '3px solid var(--text-primary)', paddingTop: 20 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--accent)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            marginBottom: 8,
          }}
        >
          Projeto
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 6, lineHeight: 1.05 }}>
          {projectName}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Visão geral do progresso
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
                fontSize: 54,
                fontWeight: 700,
                letterSpacing: '-0.05em',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              {pct}<span style={{ fontSize: 30, fontWeight: 500, color: 'var(--text-muted)' }}>%</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              {String(completed.length).padStart(2, '0')} / 25 ETAPAS CONCLUÍDAS
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', maxWidth: '100%' }}>
            {Array.from({ length: 25 }, (_, i) => {
              const isDone = completed.includes(i + 1);
              return (
                <div
                  key={i}
                  style={{
                    width: 9,
                    height: 32,
                    borderRadius: 1,
                    background: isDone ? 'var(--text-primary)' : 'var(--border)',
                    transition: 'background var(--transition), transform var(--transition)',
                    cursor: 'pointer',
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

      {/* ─── Pendências inteligentes ─── */}
      <PendenciasCard projectData={projectData} onNavigate={onNavigate} />

      {/* ─── Next step callout ─── */}
      {completed.length < 25 && (() => {
        const next = STEPS_DATA.find(s => !completed.includes(s.id));
        return next ? (
          <Card
            style={{
              padding: '22px 26px',
              cursor: 'pointer',
              borderLeft: '3px solid var(--accent)',
            }}
            onClick={() => onNavigate('step', next.id)}
          >
            <div
              style={{
                fontSize: 10,
                color: 'var(--accent)',
                marginBottom: 12,
                letterSpacing: '0.14em',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Próxima etapa
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.04em', flexShrink: 0, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {String(next.id).padStart(2, '0')}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    marginBottom: 2,
                  }}
                >
                  {next.title}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  {next.subtitle}
                </div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--text-primary)', display: 'flex' }}>
                <Icon name="arrowRight" size={18} />
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
          background: 'var(--bg-subtle)',
          borderLeft: '3px solid var(--yellow)',
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--yellow)', flexShrink: 0, marginTop: 2 }}><Icon name="alert" size={17} /></span>
          <div>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 6,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Lembrete — Recognição
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
