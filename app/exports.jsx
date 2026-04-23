// ─── Export helpers: PDF and Obsidian Markdown ───

// Try to screenshot any canvas that exists in the DOM (fluxograma, diagrama, papéis)
const captureCanvases = async () => {
  const canvases = {};
  // Find all canvas elements - we need to render the tools to screenshot them
  // Since canvases may not be mounted, capture the current DOM + any stored images
  document.querySelectorAll('canvas').forEach(c => {
    try {
      const id = c.closest('[data-tool-id]')?.dataset.toolId || 'canvas-' + Math.random().toString(36).slice(2, 6);
      canvases[id] = c.toDataURL('image/png');
    } catch (e) { /* ignore */ }
  });
  return canvases;
};

// ─── Export to Markdown (Obsidian-flavored) ───
const exportToMarkdown = (project, projectData) => {
  const dateIso = new Date().toISOString().slice(0, 10);
  const updatedIso = new Date(project.updated || project.created || Date.now()).toISOString().slice(0, 10);
  const createdIso = new Date(project.created || Date.now()).toISOString().slice(0, 10);
  const dateTime = new Date().toLocaleString('pt-BR');
  const status = project.status || 'Em andamento';
  const statusTag = { 'Em andamento': 'em-andamento', 'Concluído': 'concluido', 'Pausado': 'pausado' }[status] || 'em-andamento';

  let md = '';
  // Frontmatter
  md += '---\n';
  md += 'tags:\n  - metodologia\n  - projeto\n  - arquitetura\n';
  md += `status: "${status}"\n`;
  md += `cliente: "${project.cliente || ''}"\n`;
  md += `created: ${createdIso}\n`;
  md += `updated: ${updatedIso}\n`;
  md += '---\n\n';

  md += `# ${project.name}\n\n`;
  md += '## Metadados\n';
  md += `- **Cliente:** ${project.cliente || '_não informado_'}\n`;
  md += `- **Status:** #status/${statusTag}\n`;
  md += `- **Criado em:** ${createdIso}\n`;
  md += `- **Atualizado em:** ${updatedIso}\n\n`;
  md += '---\n\n';

  // Group steps by phase/group
  const phases = window.PHASES || [];
  const stepsData = window.STEPS_DATA || [];
  let sectionNum = 0;

  phases.forEach(phase => {
    sectionNum++;
    md += `## ${sectionNum}. ${phase.label}\n\n`;
    phase.groups.forEach(group => {
      md += `### ${group.label}\n\n`;
      group.steps.forEach(sId => {
        const step = stepsData.find(s => s.id === sId);
        if (!step) return;
        const isDone = (projectData.completedSteps || []).includes(sId);
        md += `#### ${step.id}. ${step.title} ${isDone ? '✅' : ''}\n\n`;

        // Render fields
        if (step.fields) {
          step.fields.forEach(field => {
            const key = `${sId}_${field.id}`;
            const value = (projectData.stepFields || {})[key] || '';
            if (value) {
              md += `- **${field.label}:** ${value}\n`;
            }
          });
        }

        // Notes
        const note = (projectData.stepNotes || {})[sId];
        if (note) {
          md += `\n> [!NOTE] Anotação\n`;
          note.split('\n').forEach(line => { md += `> ${line}\n`; });
          md += '\n';
        }
        md += '\n';
      });
    });
  });

  // Programa de necessidades
  if (projectData.programa?.length > 0) {
    md += '---\n\n## Programa de Necessidades\n\n';
    md += '| Ambiente | Usuários | Uso | Área (m²) | Observações |\n';
    md += '|---|---|---|---|---|\n';
    projectData.programa.forEach(p => {
      md += `| ${p.ambiente || ''} | ${p.usuarios || ''} | ${p.uso || ''} | ${p.area || ''} | ${p.obs || ''} |\n`;
    });
    const total = projectData.programa.reduce((s, p) => s + (parseFloat(p.area) || 0), 0);
    md += `\n**Área total:** ${total.toFixed(2)} m²\n\n`;
  }

  // Viabilidade
  if (projectData.viabilidade) {
    const v = projectData.viabilidade;
    md += '## Viabilidade\n\n';
    Object.entries(v).forEach(([k, val]) => {
      if (val) md += `- **${k}:** ${val}\n`;
    });
    md += '\n';
  }

  // Setorização
  if (projectData.setores?.length > 0) {
    md += '## Setorização\n\n';
    projectData.setores.forEach(s => {
      if (s.nome) {
        md += `### ${s.nome}\n`;
        if (s.ambientes) md += `- **Ambientes:** ${s.ambientes}\n`;
        if (s.justificativa) md += `- **Justificativa:** ${s.justificativa}\n\n`;
      }
    });
  }

  // Diagrams (textual summary)
  if (projectData.fluxogramaNodes?.length > 0) {
    md += '## Fluxograma\n\n';
    md += `**Nós (${projectData.fluxogramaNodes.length}):**\n`;
    projectData.fluxogramaNodes.forEach(n => { md += `- ${n.name} _(${n.type})_\n`; });
    if (projectData.fluxogramaConns?.length > 0) {
      md += `\n**Conexões (${projectData.fluxogramaConns.length}):**\n`;
      projectData.fluxogramaConns.forEach(c => {
        const from = projectData.fluxogramaNodes.find(n => n.id === c.from);
        const to = projectData.fluxogramaNodes.find(n => n.id === c.to);
        if (from && to) md += `- ${from.name} → ${to.name} _(${c.type}${c.label ? ': ' + c.label : ''})_\n`;
      });
    }
    md += '\n> [!TIP] Ver o diagrama visual completo na exportação em PDF.\n\n';
  }

  if (projectData.diagramaBubbles?.length > 0) {
    md += '## Diagrama de Setores\n\n';
    projectData.diagramaBubbles.forEach(b => { md += `- **${b.name}** — ${b.area} m²\n`; });
    md += '\n> [!TIP] Ver o diagrama visual completo na exportação em PDF.\n\n';
  }

  if (projectData.papeis?.rooms?.length > 0) {
    md += '## Estudo de Papéis\n\n';
    const p = projectData.papeis;
    md += `- **Lote:** ${p.lotW}m × ${p.lotH}m (${(p.lotW * p.lotH).toFixed(1)}m²)\n`;
    md += `- **Recuos:** frente ${p.recuoFrente || 0}m · fundos ${p.recuoFundos || 0}m · esq ${p.recuoEsq || 0}m · dir ${p.recuoDir || 0}m\n\n`;
    md += '**Ambientes:**\n';
    p.rooms.forEach(r => {
      md += `- ${r.name}: ${r.mw}×${r.mh}m (${r.area}m²) — pavimento ${r.floor || 0}\n`;
    });
    md += '\n> [!TIP] Ver o estudo visual na exportação em PDF.\n\n';
  }

  // Anotações
  if (project.anotacoes) {
    md += '---\n\n## Notas e Anotações\n\n';
    md += `> [!NOTE] Observações gerais\n`;
    project.anotacoes.split('\n').forEach(line => { md += `> ${line}\n`; });
    md += '\n';
  }

  md += '---\n\n## Referências Cruzadas\n\n';
  md += '- [[Projetos/Index]]\n- [[Templates/Metodologia de Projeto]]\n\n';
  md += '---\n';
  md += `*Exportado em ${dateTime} via Metodologia de Projeto*\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = project.name.replace(/\s+/g, '-').toLowerCase().replace(/[^\w\-]/g, '') + '-metodologia.md';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};

// ─── Render a visual representation of a diagram to a canvas (off-screen) ───
const renderFluxogramaToCanvas = (data) => {
  const nodes = data.fluxogramaNodes || [];
  const conns = data.fluxogramaConns || [];
  if (nodes.length === 0) return null;
  const W = 800, H = 500;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FAFAF8'; ctx.fillRect(0, 0, W, H);

  // draw connections
  conns.forEach(conn => {
    const from = nodes.find(n => n.id === conn.from);
    const to = nodes.find(n => n.id === conn.to);
    if (!from || !to) return;
    const midX = (from.x + to.x) / 2, midY = (from.y + to.y) / 2;
    const dx = to.x - from.x, dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const cp = { x: midX - dy / dist * 20, y: midY + dx / dist * 20 };
    ctx.beginPath(); ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(cp.x, cp.y, to.x, to.y);
    ctx.strokeStyle = '#888'; ctx.lineWidth = 2; ctx.stroke();
  });

  // draw nodes
  nodes.forEach(n => {
    const r = 30;
    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#C27856'; ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = '600 11px sans-serif'; ctx.fillStyle = '#1A1917';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(n.name.slice(0, 14), n.x, n.y);
  });
  return c.toDataURL('image/png');
};

const renderDiagramaToCanvas = (data) => {
  const bubbles = data.diagramaBubbles || [];
  if (bubbles.length === 0) return null;
  const W = 800, H = 500;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FAFAF8'; ctx.fillRect(0, 0, W, H);

  (data.diagramaProx || []).forEach(pr => {
    const f = bubbles.find(b => b.id === pr.from);
    const t = bubbles.find(b => b.id === pr.to);
    if (!f || !t) return;
    ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(t.x, t.y);
    ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 2; ctx.stroke();
  });

  bubbles.forEach(b => {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(194,120,86,0.25)'; ctx.fill();
    ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = '600 12px sans-serif'; ctx.fillStyle = '#1A1917';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(b.name, b.x, b.y - 5);
    ctx.font = '400 10px monospace'; ctx.fillStyle = '#6B6860';
    ctx.fillText(`${b.area}m²`, b.x, b.y + 10);
  });
  return c.toDataURL('image/png');
};

const renderPapeisToCanvas = (data) => {
  const p = data.papeis;
  if (!p || !p.rooms || p.rooms.length === 0) return null;
  const CW = 800, CH = 560, PAD = 60;
  const c = document.createElement('canvas');
  c.width = CW; c.height = CH;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#F8F7F5'; ctx.fillRect(0, 0, CW, CH);

  const pxPerM = Math.min((CW - PAD * 2) / p.lotW, (CH - PAD * 2) / p.lotH);
  const lpW = p.lotW * pxPerM, lpH = p.lotH * pxPerM;
  const lx = (CW - lpW) / 2, ly = (CH - lpH) / 2;

  // Grid
  ctx.strokeStyle = '#EDEAE4'; ctx.lineWidth = 0.5;
  for (let x = 0; x <= p.lotW; x++) {
    ctx.beginPath(); ctx.moveTo(lx + x * pxPerM, ly); ctx.lineTo(lx + x * pxPerM, ly + lpH); ctx.stroke();
  }
  for (let y = 0; y <= p.lotH; y++) {
    ctx.beginPath(); ctx.moveTo(lx, ly + y * pxPerM); ctx.lineTo(lx + lpW, ly + y * pxPerM); ctx.stroke();
  }

  // Lot
  ctx.strokeStyle = '#1A1917'; ctx.lineWidth = 2;
  ctx.strokeRect(lx, ly, lpW, lpH);
  ctx.font = '600 11px monospace'; ctx.fillStyle = '#1A1917'; ctx.textAlign = 'center';
  ctx.fillText(`${p.lotW}m`, lx + lpW / 2, ly - 8);
  ctx.save(); ctx.translate(lx - 12, ly + lpH / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${p.lotH}m`, 0, 0); ctx.restore();

  // Rooms (floor 0 only in export)
  p.rooms.filter(r => (r.floor || 0) === 0).forEach(r => {
    const rx = lx + r.mx * pxPerM, ry = ly + r.my * pxPerM;
    const rw = r.mw * pxPerM, rh = r.mh * pxPerM;
    ctx.fillStyle = 'rgba(194,120,86,0.25)'; ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 1.5; ctx.strokeRect(rx, ry, rw, rh);
    ctx.font = '600 11px sans-serif'; ctx.fillStyle = '#1A1917';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(r.name, rx + rw / 2, ry + rh / 2 - 6);
    ctx.font = '400 9px monospace'; ctx.fillStyle = '#6B6860';
    ctx.fillText(`${r.area}m²`, rx + rw / 2, ry + rh / 2 + 7);
  });
  return c.toDataURL('image/png');
};

// ─── Export to PDF (jsPDF) ───
const exportToPDF = async (project, projectData) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 20;
  let y = M;

  const addPageHeader = (pageNum) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8); doc.setTextColor(140);
    doc.text('Metodologia de Projeto', M, 10);
    doc.text(`${pageNum}`, W - M, 10, { align: 'right' });
    doc.setDrawColor(220); doc.line(M, 12, W - M, 12);
  };
  const addPageFooter = () => {
    const d = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(8); doc.setTextColor(140);
    doc.text(`Exportado em ${d}`, M, H - 8);
  };

  let pageNum = 1;
  addPageHeader(pageNum);

  const ensureSpace = (needed) => {
    if (y + needed > H - 20) {
      addPageFooter();
      doc.addPage(); pageNum++; y = M;
      addPageHeader(pageNum);
    }
  };

  const heading = (text, size = 16) => {
    ensureSpace(size + 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size); doc.setTextColor(30);
    doc.text(text, M, y); y += size * 0.5 + 2;
    if (size >= 14) {
      doc.setDrawColor(194, 120, 86); doc.setLineWidth(0.8);
      doc.line(M, y, M + 30, y); y += 4;
    }
  };
  const para = (text, size = 10) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size); doc.setTextColor(60);
    const lines = doc.splitTextToSize(text, W - M * 2);
    lines.forEach(l => { ensureSpace(size * 0.5); doc.text(l, M, y); y += size * 0.5; });
  };
  const kv = (k, v) => {
    if (!v) return;
    ensureSpace(6);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30);
    doc.text(`${k}:`, M, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(60);
    const kw = doc.getTextWidth(`${k}: `);
    const lines = doc.splitTextToSize(String(v), W - M * 2 - kw);
    lines.forEach((l, i) => { if (i > 0) { ensureSpace(5); } doc.text(l, M + kw, y); y += 5; });
    y += 1;
  };

  // ─── COVER ───
  doc.setFillColor(250, 249, 247);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(194, 120, 86); doc.rect(0, 0, W, 3, 'F');

  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(140);
  doc.text('METODOLOGIA DE PROJETO', W / 2, 60, { align: 'center' });

  doc.setFont('helvetica', 'bold'); doc.setFontSize(28); doc.setTextColor(30);
  const titleLines = doc.splitTextToSize(project.name, W - 40);
  titleLines.forEach((l, i) => doc.text(l, W / 2, 90 + i * 12, { align: 'center' }));

  doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(100);
  let coverY = 90 + titleLines.length * 12 + 16;
  if (project.cliente) { doc.text(`Cliente: ${project.cliente}`, W / 2, coverY, { align: 'center' }); coverY += 7; }
  doc.text(`Status: ${project.status || 'Em andamento'}`, W / 2, coverY, { align: 'center' }); coverY += 7;
  const cd = new Date(project.created || Date.now()).toLocaleDateString('pt-BR');
  doc.text(`Criado em: ${cd}`, W / 2, coverY, { align: 'center' }); coverY += 7;
  const ud = new Date(project.updated || Date.now()).toLocaleDateString('pt-BR');
  doc.text(`Atualizado: ${ud}`, W / 2, coverY, { align: 'center' });

  addPageFooter();
  doc.addPage(); pageNum++; y = M; addPageHeader(pageNum);

  // ─── CONTENT: Steps by Phase ───
  const phases = window.PHASES || [];
  const stepsData = window.STEPS_DATA || [];

  phases.forEach(phase => {
    heading(phase.label, 18);
    phase.groups.forEach(group => {
      heading(group.label, 13);
      group.steps.forEach(sId => {
        const step = stepsData.find(s => s.id === sId);
        if (!step) return;
        const done = (projectData.completedSteps || []).includes(sId);
        heading(`${step.id}. ${step.title} ${done ? '✓' : ''}`, 11);
        if (step.fields) {
          step.fields.forEach(f => {
            const key = `${sId}_${f.id}`;
            const val = (projectData.stepFields || {})[key];
            if (val) kv(f.label, val);
          });
        }
        const note = (projectData.stepNotes || {})[sId];
        if (note) {
          ensureSpace(10);
          doc.setFillColor(245, 242, 235); doc.rect(M, y - 3, W - M * 2, 4, 'F');
          para(`💡 ${note}`, 9);
          y += 2;
        }
        y += 3;
      });
    });
  });

  // ─── Programa ───
  if (projectData.programa?.length > 0) {
    doc.addPage(); pageNum++; y = M; addPageHeader(pageNum);
    heading('Programa de Necessidades', 18);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(30);
    const cols = ['Ambiente', 'Usuários', 'Uso', 'Área (m²)', 'Obs.'];
    const widths = [45, 25, 35, 25, 40];
    let x = M;
    cols.forEach((c, i) => { doc.text(c, x, y); x += widths[i]; });
    y += 2; doc.setDrawColor(200); doc.line(M, y, W - M, y); y += 4;
    doc.setFont('helvetica', 'normal');
    projectData.programa.forEach(p => {
      ensureSpace(5);
      x = M;
      [p.ambiente, p.usuarios, p.uso, p.area, p.obs].forEach((v, i) => {
        const s = doc.splitTextToSize(String(v || ''), widths[i] - 2);
        doc.text(s[0] || '', x, y); x += widths[i];
      });
      y += 5;
    });
  }

  // ─── Diagrams with screenshots ───
  const addDiagramPage = (title, dataUrl) => {
    if (!dataUrl) return;
    doc.addPage(); pageNum++; y = M; addPageHeader(pageNum);
    heading(title, 18);
    try {
      const imgW = W - M * 2;
      const imgH = imgW * 500 / 800;
      doc.addImage(dataUrl, 'PNG', M, y, imgW, imgH);
      y += imgH + 4;
    } catch (e) {
      para('(erro ao renderizar diagrama)', 9);
    }
  };

  addDiagramPage('Fluxograma', renderFluxogramaToCanvas(projectData));
  addDiagramPage('Diagrama de Setores', renderDiagramaToCanvas(projectData));

  const papeisUrl = renderPapeisToCanvas(projectData);
  if (papeisUrl) {
    doc.addPage(); pageNum++; y = M; addPageHeader(pageNum);
    heading('Estudo de Papéis', 18);
    const p = projectData.papeis;
    para(`Lote: ${p.lotW}m × ${p.lotH}m (${(p.lotW * p.lotH).toFixed(1)}m²)`);
    para(`Recuos: frente ${p.recuoFrente || 0}m · fundos ${p.recuoFundos || 0}m · esq ${p.recuoEsq || 0}m · dir ${p.recuoDir || 0}m`);
    y += 2;
    const imgW = W - M * 2;
    const imgH = imgW * 560 / 800;
    doc.addImage(papeisUrl, 'PNG', M, y, imgW, imgH);
    y += imgH + 4;
  }

  // ─── Anotações ───
  if (project.anotacoes) {
    doc.addPage(); pageNum++; y = M; addPageHeader(pageNum);
    heading('Anotações Gerais', 18);
    para(project.anotacoes);
  }

  addPageFooter();

  const filename = project.name.replace(/\s+/g, '-').toLowerCase().replace(/[^\w\-]/g, '') + '-metodologia.pdf';
  doc.save(filename);
};

window.exportToMarkdown = exportToMarkdown;
window.exportToPDF = exportToPDF;
