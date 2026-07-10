// ─── Tools View ───
const ToolsView = ({ projectData, onSave, activeTool: initialTool }) => {
  const [activeTool, setActiveTool] = React.useState(initialTool || null);

  React.useEffect(() => { if (initialTool) setActiveTool(initialTool); }, [initialTool]);

  const tools = [
    { id: 'entrevista', title: 'Entrevista com o Cliente', desc: 'Roteiro opcional de perguntas — alimenta o Programa de Necessidades', icon: '💬', color: 'accent' },
    { id: 'programa', title: 'Programa de Necessidades', desc: 'Tabela editável de ambientes, áreas e observações', icon: '▦', color: 'accent' },
    { id: 'predimensionamento', title: 'Pré-dimensionamento', desc: 'Cálculo de áreas por ambiente e total', icon: '⊡', color: 'accent' },
    { id: 'hierarquizacao', title: 'Hierarquização', desc: 'Classificar problemas por importância', icon: '▲', color: 'blue' },
    { id: 'legislacao', title: 'Legislação Urbanística', desc: 'Checklist completo de parâmetros', icon: '§', color: 'green' },
    { id: 'viabilidade', title: 'Viabilidade', desc: 'Verificar se o programa cabe no terreno', icon: '✓', color: 'green' },
    { id: 'setorizacao', title: 'Setorização', desc: 'Organizar ambientes em setores', icon: '⊞', color: 'blue' },
    { id: 'fluxograma', title: 'Fluxograma', desc: 'Diagrama de fluxos estilo rede neural com conectores visuais', icon: '⇢', color: 'accent' },
    { id: 'diagrama', title: 'Diagrama de Setores', desc: 'Diagrama de bolhas com relações de proximidade', icon: '⊙', color: 'blue' },
    { id: 'papeis', title: 'Estudo de Papéis', desc: 'Retângulos em escala sobre o lote — layout preliminar', icon: '▦', color: 'accent' },
  ];

  if (!activeTool) {
    return (
      <div data-tools-view style={{ padding: '32px 40px', maxWidth: 960, animation: 'fadeIn 0.25s ease', overflowY: 'auto', height: '100%' }}>
        <div style={{ borderTop: '3px solid var(--text-primary)', paddingTop: 20, marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.035em' }}>Ferramentas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Instrumentos de apoio para cada etapa do processo projetual.</p>
        </div>
        <div data-tools-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {tools.map((t, i) => (
            <Card key={t.id} onClick={() => setActiveTool(t.id)} style={{ padding: '18px 20px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <span style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 500, marginTop: 1 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em' }}>{t.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.45 }}>{t.desc}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const toolTitle = tools.find(t => t.id === activeTool)?.title || '';

  return (
    <div data-tools-view style={{ padding: '32px 40px 80px', maxWidth: 960, animation: 'fadeIn 0.25s ease', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button variant="ghost" onClick={() => setActiveTool(null)}>← Ferramentas</Button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{toolTitle}</h2>
      </div>
      {activeTool === 'entrevista' && <EntrevistaTool data={projectData} onSave={onSave} />}
      {activeTool === 'programa' && <ProgramaTool data={projectData} onSave={onSave} />}
      {activeTool === 'predimensionamento' && <PreDimensionamentoTool data={projectData} onSave={onSave} />}
      {activeTool === 'hierarquizacao' && <HierarquizacaoTool data={projectData} onSave={onSave} />}
      {activeTool === 'legislacao' && <LegislacaoTool data={projectData} onSave={onSave} />}
      {activeTool === 'viabilidade' && <ViabilidadeTool data={projectData} onSave={onSave} />}
      {activeTool === 'setorizacao' && <SetorizacaoTool data={projectData} onSave={onSave} />}
      {activeTool === 'fluxograma' && <FluxogramaTool data={projectData} onSave={onSave} />}
      {activeTool === 'diagrama' && <DiagramaSetoresTool data={projectData} onSave={onSave} />}
      {activeTool === 'papeis' && <EstudoPapeisTool data={projectData} onSave={onSave} />}
    </div>
  );
};

// ─── Entrevista com o Cliente (roteiro opcional e editável) ───
const EntrevistaTool = ({ data, onSave }) => {
  const sections = window.ENTREVISTA_SECTIONS || [];
  const [questions, setQuestions] = React.useState(() => {
    if (data.entrevista?.questions?.length) return data.entrevista.questions;
    return (window.ENTREVISTA_DEFAULT_QUESTIONS || []).map((q, i) => ({ id: 'q' + i, section: q.section, q: q.q, a: '' }));
  });
  const [ambientes, setAmbientes] = React.useState(() => data.entrevista?.ambientes || [{ nome: '', area: '' }]);
  const [saved, setSaved] = React.useState(false);
  const [sentMsg, setSentMsg] = React.useState(null);

  const setQ = (id, key, val) => setQuestions(p => p.map(q => q.id === id ? { ...q, [key]: val } : q));
  const removeQ = (id) => setQuestions(p => p.filter(q => q.id !== id));
  const addQ = (section) => setQuestions(p => [...p, { id: 'q' + Date.now(), section, q: '', a: '' }]);

  const setAmb = (i, key, val) => setAmbientes(p => { const n = [...p]; n[i] = { ...n[i], [key]: val }; return n; });
  const addAmb = () => setAmbientes(p => [...p, { nome: '', area: '' }]);
  const removeAmb = (i) => setAmbientes(p => p.filter((_, idx) => idx !== i));

  const save = () => {
    onSave({ ...data, entrevista: { questions, ambientes } });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const answered = questions.filter(q => (q.a || '').trim()).length;
  const validAmbientes = ambientes.filter(a => (a.nome || '').trim());

  const enviarAoPrograma = () => {
    if (!validAmbientes.length) return;
    const existing = (data.programa || []).filter(p => (p.ambiente || '').trim() || (p.area || '').trim() || (p.obs || '').trim());
    const names = new Set(existing.map(p => (p.ambiente || '').trim().toLowerCase()));
    const novos = validAmbientes
      .filter(a => !names.has(a.nome.trim().toLowerCase()))
      .map(a => ({ ambiente: a.nome.trim(), area: a.area || '', obs: 'Identificado na entrevista' }));
    onSave({ ...data, programa: [...existing, ...novos], entrevista: { questions, ambientes } });
    setSentMsg(novos.length > 0
      ? `✓ ${novos.length} ambiente${novos.length > 1 ? 's' : ''} enviado${novos.length > 1 ? 's' : ''} ao Programa de Necessidades`
      : 'Todos os ambientes já estavam no Programa');
    setTimeout(() => setSentMsg(null), 4000);
  };

  return (
    <div>
      {/* Aviso: roteiro opcional */}
      <Card style={{ marginBottom: 20, padding: 18, background: 'var(--blue-light)', border: 'none' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginBottom: 6 }}>ROTEIRO OPCIONAL</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Este roteiro é apenas um <strong>ponto de partida</strong> — nenhuma pergunta é obrigatória.
          Edite o texto de qualquer pergunta, remova as que não fizerem sentido e acrescente as suas.
          Você pode conduzir a entrevista da maneira que preferir; o objetivo é só não deixar nada importante escapar.
        </div>
      </Card>

      {answered > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          {answered} de {questions.length} perguntas respondidas
        </div>
      )}

      {sections.map(sec => {
        const qs = questions.filter(q => q.section === sec.id);
        return (
          <div key={sec.id} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 10, textTransform: 'uppercase' }}>{sec.label}</div>
            <div style={{ display: 'grid', gap: 12 }}>
              {qs.map(q => (
                <div key={q.id} style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <input
                      value={q.q}
                      onChange={e => setQ(q.id, 'q', e.target.value)}
                      placeholder="Escreva sua pergunta..."
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)', outline: 'none', padding: 0 }}
                    />
                    <button onClick={() => removeQ(q.id)} title="Remover pergunta" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 4px', lineHeight: 1 }}>✕</button>
                  </div>
                  <TextArea value={q.a || ''} onChange={v => setQ(q.id, 'a', v)} placeholder="Resposta do cliente..." rows={2} />
                </div>
              ))}
            </div>
            <button onClick={() => addQ(sec.id)} style={{ marginTop: 8, background: 'none', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, padding: '6px 14px', fontFamily: 'var(--font)' }}>+ Pergunta</button>
          </div>
        );
      })}

      {/* Ambientes identificados */}
      <Card style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>AMBIENTES IDENTIFICADOS NA ENTREVISTA</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
          Anote os ambientes que surgirem durante a conversa e envie de uma vez ao Programa de Necessidades.
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {ambientes.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input value={a.nome} onChange={v => setAmb(i, 'nome', v)} placeholder="Ex: Home office" style={{ flex: 1 }} />
              <Input value={a.area} onChange={v => setAmb(i, 'area', v)} placeholder="m² (opcional)" style={{ width: 110 }} />
              <button onClick={() => removeAmb(i)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="secondary" onClick={addAmb}>+ Ambiente</Button>
          <Button onClick={enviarAoPrograma} disabled={validAmbientes.length === 0}>→ Enviar ao Programa ({validAmbientes.length})</Button>
          {sentMsg && <span style={{ fontSize: 12.5, color: 'var(--green)', fontWeight: 600 }}>{sentMsg}</span>}
        </div>
      </Card>

      <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar entrevista'}</Button>
    </div>
  );
};

// ─── Programa de Necessidades ───
const ProgramaTool = ({ data, onSave }) => {
  const [rows, setRows] = React.useState(() => data.programa || [{ ambiente: '', area: '', obs: '' }]);
  const [saved, setSaved] = React.useState(false);

  const addRow = () => setRows([...rows, { ambiente: '', area: '', obs: '' }]);
  const updateRow = (i, key, val) => { const n = [...rows]; n[i] = { ...n[i], [key]: val }; setRows(n); };
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));
  const save = () => { const d = { ...data, programa: rows }; onSave(d); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const total = rows.reduce((s, r) => s + (parseFloat(r.area) || 0), 0);

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
        <thead>
          <tr>
            <th style={thStyle}>Ambiente</th>
            <th style={{ ...thStyle, width: 120 }}>Área (m²)</th>
            <th style={thStyle}>Observações</th>
            <th style={{ ...thStyle, width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={tdStyle}><Input value={r.ambiente} onChange={v => updateRow(i, 'ambiente', v)} placeholder="Ex: Sala de estar" /></td>
              <td style={tdStyle}><Input value={r.area} onChange={v => updateRow(i, 'area', v)} placeholder="m²" /></td>
              <td style={tdStyle}><Input value={r.obs} onChange={v => updateRow(i, 'obs', v)} placeholder="Fonte, observações..." /></td>
              <td style={tdStyle}><button onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16 }}>×</button></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ ...tdStyle, fontWeight: 700 }}>TOTAL</td>
            <td style={{ ...tdStyle, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{total.toFixed(1)}</td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
          </tr>
        </tfoot>
      </table>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <Button variant="secondary" onClick={addRow}>+ Adicionar ambiente</Button>
        <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar'}</Button>
      </div>
    </div>
  );
};

// ─── Pré-dimensionamento ───
const PreDimensionamentoTool = ({ data, onSave }) => {
  const [rows, setRows] = React.useState(() => data.predimensionamento || [{ ambiente: '', areaLeg: '', areaCaso: '', areaAf: '', areaFinal: '' }]);
  const [saved, setSaved] = React.useState(false);

  const addRow = () => setRows([...rows, { ambiente: '', areaLeg: '', areaCaso: '', areaAf: '', areaFinal: '' }]);
  const updateRow = (i, key, val) => { const n = [...rows]; n[i] = { ...n[i], [key]: val }; setRows(n); };
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));
  const save = () => { onSave({ ...data, predimensionamento: rows }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const total = rows.reduce((s, r) => s + (parseFloat(r.areaFinal) || 0), 0);

  // Auto-import from programa
  const importFromPrograma = () => {
    if (data.programa && data.programa.length) {
      setRows(data.programa.map(p => ({ ambiente: p.ambiente, areaLeg: '', areaCaso: '', areaAf: p.area || '', areaFinal: p.area || '' })));
    }
  };

  return (
    <div>
      {data.programa?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Button variant="secondary" onClick={importFromPrograma}>↓ Importar do Programa de Necessidades</Button>
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
        <thead>
          <tr>
            <th style={thStyle}>Ambiente</th>
            <th style={{ ...thStyle, width: 95 }}>Legislação</th>
            <th style={{ ...thStyle, width: 95 }}>Est. Caso</th>
            <th style={{ ...thStyle, width: 95 }}>Aferição</th>
            <th style={{ ...thStyle, width: 95 }}>Final (m²)</th>
            <th style={{ ...thStyle, width: 36 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={tdStyle}><Input value={r.ambiente} onChange={v => updateRow(i, 'ambiente', v)} placeholder="Ambiente" /></td>
              <td style={tdStyle}><Input value={r.areaLeg} onChange={v => updateRow(i, 'areaLeg', v)} placeholder="m²" /></td>
              <td style={tdStyle}><Input value={r.areaCaso} onChange={v => updateRow(i, 'areaCaso', v)} placeholder="m²" /></td>
              <td style={tdStyle}><Input value={r.areaAf} onChange={v => updateRow(i, 'areaAf', v)} placeholder="m²" /></td>
              <td style={tdStyle}><Input value={r.areaFinal} onChange={v => updateRow(i, 'areaFinal', v)} placeholder="m²" style={{ fontWeight: 600 }} /></td>
              <td style={tdStyle}><button onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16 }}>×</button></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ ...tdStyle, fontWeight: 700 }}>TOTAL</td>
            <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
            <td style={{ ...tdStyle, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{total.toFixed(1)}</td>
            <td style={tdStyle}></td>
          </tr>
        </tfoot>
      </table>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <Button variant="secondary" onClick={addRow}>+ Adicionar</Button>
        <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar'}</Button>
      </div>
    </div>
  );
};

// ─── Hierarquização ───
const HierarquizacaoTool = ({ data, onSave }) => {
  const problems = window.HIERARQUIZACAO_PROBLEMS;

  const [values, setValues] = React.useState(() => data.hierarquizacao || {});
  const [saved, setSaved] = React.useState(false);

  const set = (id, val) => setValues(p => ({ ...p, [id]: val }));
  const save = () => { onSave({ ...data, hierarquizacao: values }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const levels = ['grande', 'media', 'pequena'];
  const levelLabels = { grande: 'GRANDE', media: 'MÉDIA', pequena: 'PEQUENA' };
  const levelColors = { grande: 'red', media: 'yellow', pequena: 'green' };

  let currentGroup = '';

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
        Classifique cada problema levantado na análise por importância, relevância e interferência no projeto.
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {problems.map(p => {
          const showGroup = p.group !== currentGroup;
          currentGroup = p.group;
          return (
            <React.Fragment key={p.id}>
              {showGroup && <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: 12, marginBottom: 4 }}>{p.group.toUpperCase()}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)' }}>
                <span style={{ flex: 1, fontSize: 14 }}>{p.label}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {levels.map(l => (
                    <button key={l} onClick={() => set(p.id, l)} style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid transparent', cursor: 'pointer', transition: 'var(--transition)',
                      background: values[p.id] === l ? `var(--${levelColors[l]}-light)` : 'var(--bg)',
                      color: values[p.id] === l ? `var(--${levelColors[l]})` : 'var(--text-muted)',
                      borderColor: values[p.id] === l ? `var(--${levelColors[l]})` : 'var(--border)',
                    }}>
                      {levelLabels[l]}
                    </button>
                  ))}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ marginTop: 20 }}>
        <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar hierarquização'}</Button>
      </div>
    </div>
  );
};

// ─── Legislação ───
const LegislacaoTool = ({ data, onSave }) => {
  const [values, setValues] = React.useState(() => data.legislacaoData || {});
  const [saved, setSaved] = React.useState(false);
  const set = (key, val) => setValues(p => ({ ...p, [key]: val }));
  const save = () => { onSave({ ...data, legislacaoData: values }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <div style={{ display: 'grid', gap: 12 }}>
        {LEGISLACAO_FIELDS.map(f => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ width: 220, minWidth: 220, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{f.label}</label>
            <Input value={values[f.key] || ''} onChange={v => set(f.key, v)} placeholder={f.placeholder} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar legislação'}</Button>
      </div>
    </div>
  );
};

// ─── Viabilidade ───
const ViabilidadeTool = ({ data, onSave }) => {
  const leg = data.legislacaoData || {};
  const progTotal = (data.programa || []).reduce((s, r) => s + (parseFloat(r.area) || 0), 0);
  const [terreno, setTerreno] = React.useState(() => data.viabilidade || { areaTerreno: '', cubRegional: '', orcamento: '' });
  const [saved, setSaved] = React.useState(false);

  const areaTerreno = parseFloat(terreno.areaTerreno) || 0;
  const caMax = parseFloat(leg.ca_maximo) || 0;
  const toMax = parseFloat(leg.to_maxima) || 0;
  const areaEdificavel = areaTerreno * caMax;
  const areaOcupacao = areaTerreno * (toMax / 100);
  const cub = parseFloat(terreno.cubRegional) || 0;
  const custoEstimado = progTotal * cub;
  const orcamento = parseFloat(terreno.orcamento) || 0;

  const cabe = areaEdificavel > 0 ? progTotal <= areaEdificavel : null;

  const save = () => { onSave({ ...data, viabilidade: terreno }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const set = (k, v) => setTerreno(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Área do terreno (m²)</label>
          <Input value={terreno.areaTerreno} onChange={v => set('areaTerreno', v)} placeholder="Ex: 360" />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>CUB regional (R$/m²)</label>
          <Input value={terreno.cubRegional} onChange={v => set('cubRegional', v)} placeholder="Ex: 2800" />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Orçamento do cliente (R$)</label>
          <Input value={terreno.orcamento} onChange={v => set('orcamento', v)} placeholder="Ex: 500000" />
        </div>
      </div>

      <Card style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>RESULTADO DA VIABILIDADE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <ResultBox label="Programa total" value={`${progTotal.toFixed(1)} m²`} sub="Do programa de necessidades" />
          <ResultBox label="Área edificável" value={areaEdificavel > 0 ? `${areaEdificavel.toFixed(1)} m²` : '—'} sub={`CA máx: ${caMax || '—'}`} />
          <ResultBox label="Área de ocupação" value={areaOcupacao > 0 ? `${areaOcupacao.toFixed(1)} m²` : '—'} sub={`TO máx: ${toMax || '—'}%`} />
        </div>

        {cabe !== null && (
          <div style={{ marginTop: 20, padding: 14, borderRadius: 'var(--radius)', background: cabe ? 'var(--green-light)' : 'var(--red-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{cabe ? '✓' : '✗'}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: cabe ? 'var(--green)' : 'var(--red)' }}>
              {cabe ? 'O programa CABE no terreno' : 'O programa NÃO CABE no terreno'}
            </span>
          </div>
        )}

        {cub > 0 && (
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <ResultBox label="Custo estimado" value={`R$ ${custoEstimado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} sub={`${progTotal.toFixed(0)}m² × R$${cub}/m²`} />
            {orcamento > 0 && (
              <ResultBox label="vs Orçamento" value={custoEstimado <= orcamento ? 'Dentro do orçamento' : 'Acima do orçamento'} sub={`Orç: R$ ${orcamento.toLocaleString('pt-BR')}`} color={custoEstimado <= orcamento ? 'green' : 'red'} />
            )}
          </div>
        )}
      </Card>

      <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar dados'}</Button>
    </div>
  );
};

const ResultBox = ({ label, value, sub, color }) => (
  <div style={{ padding: 14, background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color: color ? `var(--${color})` : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
  </div>
);

// ─── Setorização ───
const SetorizacaoTool = ({ data, onSave }) => {
  const [sectors, setSectors] = React.useState(() => data.setores || [{ nome: '', ambientes: '', justificativa: '' }]);
  const [saved, setSaved] = React.useState(false);

  const addRow = () => setSectors([...sectors, { nome: '', ambientes: '', justificativa: '' }]);
  const updateRow = (i, k, v) => { const n = [...sectors]; n[i] = { ...n[i], [k]: v }; setSectors(n); };
  const removeRow = (i) => setSectors(sectors.filter((_, idx) => idx !== i));
  const save = () => { onSave({ ...data, setores: sectors }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 160 }}>Setor</th>
            <th style={thStyle}>Ambientes</th>
            <th style={thStyle}>Justificativa</th>
            <th style={{ ...thStyle, width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {sectors.map((r, i) => (
            <tr key={i}>
              <td style={tdStyle}><Input value={r.nome} onChange={v => updateRow(i, 'nome', v)} placeholder="Ex: Setor Social" /></td>
              <td style={tdStyle}><Input value={r.ambientes} onChange={v => updateRow(i, 'ambientes', v)} placeholder="Sala, varanda..." /></td>
              <td style={tdStyle}><Input value={r.justificativa} onChange={v => updateRow(i, 'justificativa', v)} placeholder="Justificativa" /></td>
              <td style={tdStyle}><button onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16 }}>×</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <Button variant="secondary" onClick={addRow}>+ Adicionar setor</Button>
        <Button onClick={save}>{saved ? '✓ Salvo!' : 'Salvar'}</Button>
      </div>
    </div>
  );
};

const thStyle = { textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '2px solid var(--border)', letterSpacing: '0.03em' };
const tdStyle = { padding: '6px 8px', borderBottom: '1px solid var(--border-light)' };

window.ToolsView = ToolsView;
