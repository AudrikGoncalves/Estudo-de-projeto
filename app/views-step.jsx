// ─── Painel: problemas priorizados na Hierarquização (etapas de Síntese/Avaliação) ───
// O método manda confrontar conceito, partido e EP com os problemas de GRANDE importância.
const PriorityProblemsPanel = ({ projectData, onNavigate }) => {
  const hier = projectData.hierarquizacao || {};
  const problems = window.HIERARQUIZACAO_PROBLEMS || [];
  const grandes = problems.filter(p => hier[p.id] === 'grande');
  const medias = problems.filter(p => hier[p.id] === 'media');
  const hasAny = Object.keys(hier).length > 0;

  if (!hasAny) {
    return (
      <Card
        style={{ marginBottom: 24, padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderLeft: '3px solid var(--red)' }}
        onClick={() => onNavigate('tools', null, 'hierarquizacao')}
      >
        <span style={{ fontSize: 20 }}>▲</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Hierarquização ainda não preenchida</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Classifique os problemas na etapa 16 para confrontá-los aqui com suas decisões</div>
        </div>
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</span>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: 24, padding: 18, background: 'var(--red-light)', border: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>PROBLEMAS DE GRANDE IMPORTÂNCIA</div>
        <button
          onClick={() => onNavigate('tools', null, 'hierarquizacao')}
          style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline', padding: 0, marginLeft: 'auto', fontFamily: 'var(--font)' }}
        >editar</button>
      </div>
      {grandes.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Nenhum problema classificado como GRANDE. Revise a Hierarquização.</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {grandes.map(p => (
            <span key={p.id} style={{ fontSize: 12.5, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: 'var(--bg-elevated)', color: 'var(--red)', border: '1px solid var(--red)' }}>
              {p.label}
            </span>
          ))}
        </div>
      )}
      {medias.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-secondary)' }}>
          <strong>Média:</strong> {medias.map(p => p.label).join(' · ')}
        </div>
      )}
      <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Confronte cada decisão desta etapa com os problemas acima — eles são o critério de avaliação do projeto.
      </div>
    </Card>
  );
};

// ─── Step Detail View ───
const StepView = ({ step, projectData, onSave, onNavigate, projectId }) => {
  const notes = (projectData.stepNotes || {})[step.id] || {};
  const completed = (projectData.completedSteps || []).includes(step.id);
  const [fieldValues, setFieldValues] = React.useState(() => notes.fields || {});
  const [generalNotes, setGeneralNotes] = React.useState(notes.general || '');
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const n = (projectData.stepNotes || {})[step.id] || {};
    setFieldValues(n.fields || {});
    setGeneralNotes(n.general || '');
    setSaved(false);
  }, [step.id]);

  const handleSave = (markComplete = false) => {
    const newData = { ...projectData };
    if (!newData.stepNotes) newData.stepNotes = {};
    newData.stepNotes[step.id] = { fields: fieldValues, general: generalNotes };
    if (markComplete) {
      if (!newData.completedSteps) newData.completedSteps = [];
      if (!newData.completedSteps.includes(step.id)) newData.completedSteps.push(step.id);
    }
    onSave(newData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUncomplete = () => {
    const newData = { ...projectData };
    newData.completedSteps = (newData.completedSteps || []).filter(id => id !== step.id);
    onSave(newData);
  };

  const prev = step.id > 1 ? STEPS_DATA.find(s => s.id === step.id - 1) : null;
  const next = step.id < 25 ? STEPS_DATA.find(s => s.id === step.id + 1) : null;

  return (
    <div data-step-view style={{ padding: '32px 40px 80px', maxWidth: 820, animation: 'fadeIn 0.25s ease', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Badge label={step.phase === 'analise' ? 'Análise' : step.phase === 'sintese' ? 'Síntese' : 'Avaliação'} color={step.color} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Etapa {step.id}/25</span>
        {completed && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--green-light)', color: 'var(--green)', fontWeight: 600 }}>✓ Concluída</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <span style={{ fontSize: 32, color: `var(--${step.color})` }}>{step.icon}</span>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>{step.title}</h1>
      </div>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>{step.subtitle}</p>

      {/* Tips */}
      {step.tips.length > 0 && (
        <Card style={{ marginBottom: 24, padding: 18, background: step.phase === 'analise' ? 'var(--accent-light)' : step.phase === 'sintese' ? 'var(--blue-light)' : 'var(--yellow-light)', border: 'none' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: `var(--${step.color})`, marginBottom: 8 }}>DICAS</div>
          {step.tips.map((t, i) => (
            <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ color: `var(--${step.color})` }}>•</span> {t}
            </div>
          ))}
        </Card>
      )}

      {/* Problemas priorizados — só nas etapas de Síntese/Avaliação (após a Hierarquização) */}
      {step.id > 16 && <PriorityProblemsPanel projectData={projectData} onNavigate={onNavigate} />}

      {/* Fields */}
      <div style={{ display: 'grid', gap: 20, marginBottom: 28 }}>
        {step.fields.map((f, i) => (
          <div key={i}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{f}</label>
            <TextArea value={fieldValues[i] || ''} onChange={v => setFieldValues(p => ({ ...p, [i]: v }))} placeholder="Registre suas observações..." rows={3} />
          </div>
        ))}
      </div>

      {/* Imagens da etapa */}
      <StepImages projectId={projectId} stepId={step.id} />

      {/* General notes */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Anotações gerais</label>
        <TextArea value={generalNotes} onChange={setGeneralNotes} placeholder="Observações, referências, links..." rows={4} />
      </div>

      {/* Tool shortcut */}
      {step.hasTool && (
        <Card style={{ marginBottom: 24, padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderLeft: '3px solid var(--accent)' }} onClick={() => onNavigate('tools', null, step.hasTool)}>
          <span style={{ fontSize: 20 }}>⚙</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Abrir Ferramenta</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Use a ferramenta específica para esta etapa</div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</span>
        </Card>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button onClick={() => handleSave(false)} variant="secondary">
          {saved ? '✓ Salvo!' : 'Salvar rascunho'}
        </Button>
        {!completed ? (
          <Button onClick={() => handleSave(true)}>✓ Concluir etapa</Button>
        ) : (
          <Button onClick={handleUncomplete} variant="ghost">Reabrir etapa</Button>
        )}
        <div style={{ flex: 1 }} />
        {prev && <Button variant="ghost" onClick={() => onNavigate('step', prev.id)}>← {prev.title}</Button>}
        {next && <Button variant="secondary" onClick={() => onNavigate('step', next.id)}>{next.title} →</Button>}
      </div>
    </div>
  );
};

window.StepView = StepView;
