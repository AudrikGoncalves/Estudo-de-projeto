// ─── Backup: exportar/restaurar todos os projetos em JSON ───
// Inclui metadados, dados das etapas/ferramentas e imagens (base64).

const exportBackup = async (projects) => {
  const payload = {
    app: 'metodologia-projeto',
    version: 2,
    exported: new Date().toISOString(),
    projects: [],
  };
  for (const p of projects) {
    const data = loadProject(p.id);
    let images = [];
    try { images = await imgExportProject(p.id); } catch (e) { console.warn('backup: sem imagens', e); }
    payload.projects.push({ meta: p, data, images });
  }
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = URL.createObjectURL(blob);
  a.download = `metodologia-backup-${stamp}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};

// Lê e valida o arquivo; retorna a lista de projetos do backup
const parseBackupFile = (file) => new Promise((resolve, reject) => {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const json = JSON.parse(fr.result);
      if (json.app !== 'metodologia-projeto' || !Array.isArray(json.projects)) {
        reject(new Error('Este arquivo não é um backup válido do Metodologia de Projeto.'));
        return;
      }
      resolve(json.projects);
    } catch (e) {
      reject(new Error('Arquivo inválido: não foi possível ler o JSON.'));
    }
  };
  fr.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
  fr.readAsText(file);
});

// Importa os projetos do backup. Nunca sobrescreve: em conflito de id, gera novo id.
// Retorna o novo array de projetos (metadados) para salvar no store.
const importBackup = async (backupProjects, existingProjects) => {
  const existingIds = new Set(existingProjects.map(p => p.id));
  const merged = [...existingProjects];
  let count = 0;
  for (const bp of backupProjects) {
    if (!bp.meta || !bp.meta.id || !bp.meta.name) continue;
    let meta = { ...bp.meta };
    if (existingIds.has(meta.id)) {
      meta = { ...meta, id: 'p_' + Date.now() + '_' + count, name: meta.name + ' (importado)' };
    }
    existingIds.add(meta.id);
    merged.push(meta);
    saveProject(meta.id, bp.data || {});
    try { await imgImportProject(meta.id, bp.images || []); } catch (e) { console.warn('backup: falha ao importar imagens', e); }
    count++;
  }
  return { merged, count };
};

window.exportBackup = exportBackup;
window.parseBackupFile = parseBackupFile;
window.importBackup = importBackup;
