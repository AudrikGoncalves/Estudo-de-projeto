// ─── Main App ───
const App = () => {
  const { session, loading: authLoading, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { projects, save: saveProjects, setProjects } = useProjectStore();
  const [showAuth, setShowAuth] = React.useState(() => !localStorage.getItem('mp_auth_skipped') && !localStorage.getItem('mp-auth'));
  const [syncing, setSyncing] = React.useState(false);
  const [currentProjectId, setCurrentProjectId] = React.useState(() => localStorage.getItem('mp_current') || null);
  const [currentView, setCurrentView] = React.useState(currentProjectId ? 'dashboard' : 'home');
  const [currentStep, setCurrentStep] = React.useState(null);
  const [activeTool, setActiveTool] = React.useState(null);
  const [projectData, setProjectData] = React.useState(() => currentProjectId ? loadProject(currentProjectId) : {});
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState('saved'); // saved | saving | dirty
  const saveTimerRef = React.useRef(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null); // id do projeto a excluir
  const [confirmLeave, setConfirmLeave] = React.useState(false);
  const [showNewProjectPrompt, setShowNewProjectPrompt] = React.useState(false);

  const currentProject = projects.find(p => p.id === currentProjectId);
  const userId = session?.user?.id;

  // Ao autenticar, puxa/sincroniza projetos da nuvem
  React.useEffect(() => {
    if (!userId) return;
    setSyncing(true);
    cloudSyncOnLogin(userId).then((merged) => {
      if (merged) setProjects(merged);
    }).finally(() => setSyncing(false));
  }, [userId]);

  // Auto-save with debounce 800ms
  const scheduleAutoSave = (data, projId) => {
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (projId) {
        saveProject(projId, data);
        const now = Date.now();
        const updatedProjects = projects.map(p => p.id === projId ? { ...p, updated: now } : p);
        saveProjects(updatedProjects);
        if (userId) {
          const proj = updatedProjects.find(p => p.id === projId);
          if (proj) { try { await cloudUpsertProject(userId, proj, data); } catch (e) { console.warn('cloud save fail', e); } }
        }
        setSaveStatus('saved');
      }
    }, 800);
  };

  // Warn on unsaved close
  React.useEffect(() => {
    const handler = (e) => {
      if (saveStatus !== 'saved') { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveStatus]);

  const handleNavigate = (view, stepId, toolId) => {
    setCurrentView(view);
    if (stepId) setCurrentStep(stepId);
    if (toolId) setActiveTool(toolId);
    else if (view !== 'tools') setActiveTool(null);
  };

  const handleCreateProject = async (name) => {
    const id = 'p_' + Date.now();
    const now = Date.now();
    const newProj = { id, name, created: now, updated: now, status: 'Em andamento', cliente: '', anotacoes: '' };
    const newProjects = [...projects, newProj];
    saveProjects(newProjects);
    const initialData = { completedSteps: [], stepNotes: {} };
    saveProject(id, initialData);
    setCurrentProjectId(id);
    localStorage.setItem('mp_current', id);
    setProjectData(initialData);
    setCurrentView('dashboard');
    setSaveStatus('saved');
    if (userId) { try { await cloudUpsertProject(userId, newProj, initialData); } catch (e) { console.warn('cloud create fail', e); } }
  };

  const handleSelectProject = (id) => {
    setCurrentProjectId(id);
    localStorage.setItem('mp_current', id);
    setProjectData(loadProject(id));
    setCurrentView('dashboard');
    setSaveStatus('saved');
  };

  const handleDeleteProject = (id) => setConfirmDelete(id);

  const doDeleteProject = async () => {
    const id = confirmDelete;
    setConfirmDelete(null);
    if (!id) return;
    saveProjects(projects.filter(p => p.id !== id));
    localStorage.removeItem(`mp_proj_${id}`);
    try { await imgDeleteProject(id); } catch (e) { console.warn('img delete fail', e); }
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      localStorage.removeItem('mp_current');
      setCurrentView('home');
    }
    if (userId) { try { await cloudDeleteProject(userId, id); } catch (e) { console.warn('cloud delete fail', e); } }
  };

  const handleDuplicateProject = async (id) => {
    const src = projects.find(p => p.id === id);
    if (!src) return;
    const newId = 'p_' + Date.now();
    const now = Date.now();
    const newProj = { ...src, id: newId, name: src.name + ' (cópia)', created: now, updated: now };
    saveProjects([...projects, newProj]);
    const srcData = loadProject(id);
    saveProject(newId, srcData);
    try { await imgCopyProject(id, newId); } catch (e) { console.warn('img copy fail', e); }
    if (userId) { try { await cloudUpsertProject(userId, newProj, srcData); } catch (e) { console.warn('cloud dup fail', e); } }
  };

  const handleImportBackup = async (file) => {
    const backupProjects = await parseBackupFile(file);
    const { merged, count } = await importBackup(backupProjects, projects);
    saveProjects(merged);
    if (userId) {
      for (const bp of backupProjects) {
        const proj = merged.find(p => p.name === bp.meta.name || p.id === bp.meta.id);
        if (proj) { try { await cloudUpsertProject(userId, proj, loadProject(proj.id)); } catch (e) { console.warn('cloud backup sync fail', e); } }
      }
    }
    return count;
  };

  const handleSaveData = (newData) => {
    setProjectData(newData);
    if (currentProjectId) scheduleAutoSave(newData, currentProjectId);
  };

  const handleManualSave = async () => {
    if (!currentProjectId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveProject(currentProjectId, projectData);
    const now = Date.now();
    const updatedProjects = projects.map(p => p.id === currentProjectId ? { ...p, updated: now } : p);
    saveProjects(updatedProjects);
    if (userId) {
      const proj = updatedProjects.find(p => p.id === currentProjectId);
      if (proj) { try { await cloudUpsertProject(userId, proj, projectData); } catch (e) { console.warn('cloud manual save fail', e); } }
    }
    setSaveStatus('saved');
  };

  const handleUpdateMeta = async (meta) => {
    if (!currentProjectId) return;
    const now = Date.now();
    const updatedProjects = projects.map(p => p.id === currentProjectId ? { ...p, ...meta, updated: now } : p);
    saveProjects(updatedProjects);
    if (userId) {
      const proj = updatedProjects.find(p => p.id === currentProjectId);
      if (proj) { try { await cloudUpsertProject(userId, proj, projectData); } catch (e) { console.warn('cloud meta fail', e); } }
    }
  };

  const goHomeNow = () => {
    setConfirmLeave(false);
    setCurrentProjectId(null);
    localStorage.removeItem('mp_current');
    setCurrentView('home');
  };

  const handleGoHome = () => {
    if (saveStatus !== 'saved') { setConfirmLeave(true); return; }
    goHomeNow();
  };

  const handleExportPDF = async () => {
    if (!currentProject) return;
    try { await exportToPDF(currentProject, projectData); }
    catch (e) { console.error(e); alert('Erro ao gerar PDF: ' + e.message); }
  };
  const handleExportMD = async () => {
    if (!currentProject) return;
    try { exportToMarkdown(currentProject, projectData); }
    catch (e) { console.error(e); alert('Erro ao gerar Markdown: ' + e.message); }
  };

  const step = currentStep ? STEPS_DATA.find(s => s.id === currentStep) : null;

  if (authLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>;
  }

  if (showAuth && !session) {
    return (
      <AuthScreen
        onSkip={() => { localStorage.setItem('mp_auth_skipped', '1'); setShowAuth(false); }}
        onAuthed={() => { localStorage.removeItem('mp_auth_skipped'); setShowAuth(false); }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {currentView !== 'home' && (
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          projectName={currentProject?.name || ''}
          completedSteps={projectData.completedSteps || []}
          currentStep={currentStep}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      )}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {currentView !== 'home' && currentProject && (
          <AppHeader
            currentProject={currentProject}
            saveStatus={saveStatus}
            onOpenProjects={() => setDrawerOpen(true)}
            onSave={handleManualSave}
            onExportPDF={handleExportPDF}
            onExportMD={handleExportMD}
            projectData={projectData}
            onUpdateMeta={handleUpdateMeta}
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            session={session}
            onSignOut={async () => { await signOut(); localStorage.removeItem('mp_auth_skipped'); setShowAuth(true); }}
            onShowAuth={() => setShowAuth(true)}
            syncing={syncing}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
        {currentView === 'home' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px 0' }}>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <AccountBadge
              session={session}
              onSignOut={async () => { await signOut(); localStorage.removeItem('mp_auth_skipped'); setShowAuth(true); }}
              onShowAuth={() => setShowAuth(true)}
            />
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {currentView === 'home' && (
            <HomeView
              projects={projects}
              onCreateProject={handleCreateProject}
              onSelectProject={handleSelectProject}
              onDeleteProject={handleDeleteProject}
              onImportBackup={handleImportBackup}
            />
          )}
          {currentView === 'dashboard' && (
            <DashboardView
              projectData={projectData}
              projectName={currentProject?.name || ''}
              onNavigate={handleNavigate}
            />
          )}
          {currentView === 'step' && step && (
            <StepView
              step={step}
              projectData={projectData}
              onSave={handleSaveData}
              onNavigate={handleNavigate}
              projectId={currentProjectId}
            />
          )}
          {currentView === 'tools' && (
            <ToolsView
              projectData={projectData}
              onSave={handleSaveData}
              activeTool={activeTool}
            />
          )}
        </div>
      </main>

      <ProjectsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        projects={projects}
        currentId={currentProjectId}
        onSelect={handleSelectProject}
        onDelete={handleDeleteProject}
        onDuplicate={handleDuplicateProject}
        onNew={() => setShowNewProjectPrompt(true)}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Excluir este projeto?"
        message="Todas as etapas, ferramentas e imagens deste projeto serão removidas. Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={doDeleteProject}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={confirmLeave}
        title="Alterações não salvas"
        message="Há alterações que ainda não foram salvas. Deseja sair mesmo assim?"
        confirmLabel="Sair sem salvar"
        danger
        onConfirm={goHomeNow}
        onCancel={() => setConfirmLeave(false)}
      />

      <PromptDialog
        open={showNewProjectPrompt}
        title="Novo projeto"
        placeholder="Nome do projeto (ex: Residência Silva)"
        submitLabel="Criar"
        onSubmit={(name) => { setShowNewProjectPrompt(false); handleCreateProject(name); }}
        onCancel={() => setShowNewProjectPrompt(false)}
      />

    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
