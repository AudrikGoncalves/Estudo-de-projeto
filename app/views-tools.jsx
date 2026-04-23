// ─── Tools View ───
const ToolsView = ({ projectData, onSave, activeTool: initialTool }) => {
  const [activeTool, setActiveTool] = React.useState(initialTool || null);

  React.useEffect(() => { if (initialTool) setActiveTool(initialTool); }, [initialTool]);

  const tools = [
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
      <div style={{ padding: '32px 40px', maxWidth: 960, animation: 'fadeIn 0.25s ease', overflowY: 'auto', height: '100vh' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Ferramentas</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Ferramentas interativas para auxiliar em cada etapa do processo projetual.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {tools.map(t => (
            <Card key={t.id} onClick={() => setActiveTool(t.id)} style={{ padding: 20, cursor: 'pointer', transition: 'var(--transition)', borderLeft: `3px solid var(--${t.color})` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 26, color: `var(--${t.color})` }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{t.desc}</div>
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
    <div style={{ padding: '32px 40px', maxWidth: 960, animation: 'fadeIn 0.25s ease', overflowY: 'auto', height: '100vh', paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button variant="ghost" onClick={() => setActiveTool(null)}>← Ferramentas</Button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{toolTitle}</h2>
      </div>
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
  const problems = [
    { id: 'tema', label: 'Tema', group: 'Usuário/Uso' },
    { id: 'usuario', label: 'Usuário / Cliente', group: 'Usuário/Uso' },
    { id: 'usos', label: 'Usos / Funções', group: 'Usuário/Uso' },
    { id: 'programa', label: 'Programa de necessidades', group: 'Usuário/Uso' },
    { id: 'setores', label: 'Setores', group: 'Usuário/Uso' },
    { id: 'fluxos', label: 'Fluxos / Funcionamento', group: 'Usuário/Uso' },
    { id: 'predim', label: 'Pré-Dimensionamento', group: 'Usuário/Uso' },
    { id: 'forma', label: 'Forma e dimensão do terreno', group: 'Lugar/Terreno' },
    { id: 'topografia', label: 'Topografia', group: 'Lugar/Terreno' },
    { id: 'sol_ventos', label: 'Sol e ventos', group: 'Lugar/Terreno' },
    { id: 'acessos', label: 'Acessos', group: 'Lugar/Terreno' },
    { id: 'entorno', label: 'Entorno', group: 'Lugar/Terreno' },
    { id: 'legislacao', label: 'Legislação', group: 'Lugar/Terreno' },
  ];

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
