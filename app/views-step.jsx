// ─── Step Detail View ───
const StepView = ({ step, projectData, onSave, onNavigate }) => {
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
    <div style={{ padding: '32px 40px', maxWidth: 820, animation: 'fadeIn 0.25s ease', overflowY: 'auto', height: '100vh', paddingBottom: 80 }}>
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

      {/* Fields */}
      <div style={{ display: 'grid', gap: 20, marginBottom: 28 }}>
        {step.fields.map((f, i) => (
          <div key={i}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{f}</label>
            <TextArea value={fieldValues[i] || ''} onChange={v => setFieldValues(p => ({ ...p, [i]: v }))} placeholder="Registre suas observações..." rows={3} />
          </div>
        ))}
      </div>

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
