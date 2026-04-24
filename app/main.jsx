// ─── Main App ───
const App = () => {
  const { projects, save: saveProjects } = useProjectStore();
  const [currentProjectId, setCurrentProjectId] = React.useState(() => localStorage.getItem('mp_current') || null);
  const [currentView, setCurrentView] = React.useState(currentProjectId ? 'dashboard' : 'home');
  const [currentStep, setCurrentStep] = React.useState(null);
  const [activeTool, setActiveTool] = React.useState(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [projectData, setProjectData] = React.useState(() => currentProjectId ? loadProject(currentProjectId) : {});
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState('saved'); // saved | saving | dirty
  const saveTimerRef = React.useRef(null);

  const currentProject = projects.find(p => p.id === currentProjectId);

  // Auto-save with debounce 800ms
  const scheduleAutoSave = (data, projId) => {
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (projId) {
        saveProject(projId, data);
        // update project's updated timestamp
        const updatedProjects = projects.map(p => p.id === projId ? { ...p, updated: Date.now() } : p);
        saveProjects(updatedProjects);
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

  const handleCreateProject = (name) => {
    const id = 'p_' + Date.now();
    const now = Date.now();
    const newProj = { id, name, created: now, updated: now, status: 'Em andamento', cliente: '', anotacoes: '' };
    const newProjects = [...projects, newProj];
    saveProjects(newProjects);
    saveProject(id, { completedSteps: [], stepNotes: {} });
    setCurrentProjectId(id);
    localStorage.setItem('mp_current', id);
    setProjectData({ completedSteps: [], stepNotes: {} });
    setCurrentView('dashboard');
    setSaveStatus('saved');
  };

  const handleSelectProject = (id) => {
    setCurrentProjectId(id);
    localStorage.setItem('mp_current', id);
    setProjectData(loadProject(id));
    setCurrentView('dashboard');
    setSaveStatus('saved');
  };

  const handleDeleteProject = (id) => {
    if (!confirm('Excluir este projeto?')) return;
    saveProjects(projects.filter(p => p.id !== id));
    localStorage.removeItem(`mp_proj_${id}`);
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      localStorage.removeItem('mp_current');
      setCurrentView('home');
    }
  };

  const handleDuplicateProject = (id) => {
    const src = projects.find(p => p.id === id);
    if (!src) return;
    const newId = 'p_' + Date.now();
    const now = Date.now();
    const newProj = { ...src, id: newId, name: src.name + ' (cópia)', created: now, updated: now };
    saveProjects([...projects, newProj]);
    const srcData = loadProject(id);
    saveProject(newId, srcData);
  };

  const handleSaveData = (newData) => {
    setProjectData(newData);
    if (currentProjectId) scheduleAutoSave(newData, currentProjectId);
  };

  const handleManualSave = () => {
    if (!currentProjectId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveProject(currentProjectId, projectData);
    const updatedProjects = projects.map(p => p.id === currentProjectId ? { ...p, updated: Date.now() } : p);
    saveProjects(updatedProjects);
    setSaveStatus('saved');
  };

  const handleUpdateMeta = (meta) => {
    if (!currentProjectId) return;
    const updatedProjects = projects.map(p => p.id === currentProjectId ? { ...p, ...meta, updated: Date.now() } : p);
    saveProjects(updatedProjects);
  };

  const handleGoHome = () => {
    if (saveStatus !== 'saved' && !confirm('Há alterações não salvas. Deseja sair mesmo assim?')) return;
    setCurrentProjectId(null);
    localStorage.removeItem('mp_current');
    setCurrentView('home');
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
          />
        )}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {currentView === 'home' && (
            <HomeView
              projects={projects}
              onCreateProject={handleCreateProject}
              onSelectProject={handleSelectProject}
              onDeleteProject={handleDeleteProject}
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
        onNew={() => { const name = prompt('Nome do novo projeto:'); if (name?.trim()) handleCreateProject(name.trim()); }}
      />

      {currentView !== 'home' && (
        <>
          <ChatFab onClick={() => setChatOpen(!chatOpen)} hasChat={chatOpen} />
          <ChatPanel projectData={projectData} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        </>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
