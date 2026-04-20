// ─── Main App ───
const App = () => {
  const { projects, save: saveProjects } = useProjectStore();
  const [currentProjectId, setCurrentProjectId] = React.useState(() => localStorage.getItem('mp_current') || null);
  const [currentView, setCurrentView] = React.useState(currentProjectId ? 'dashboard' : 'home');
  const [currentStep, setCurrentStep] = React.useState(null);
  const [activeTool, setActiveTool] = React.useState(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [projectData, setProjectData] = React.useState(() => currentProjectId ? loadProject(currentProjectId) : {});

  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleNavigate = (view, stepId, toolId) => {
    setCurrentView(view);
    if (stepId) setCurrentStep(stepId);
    if (toolId) setActiveTool(toolId);
    else if (view !== 'tools') setActiveTool(null);
  };

  const handleCreateProject = (name) => {
    const id = 'p_' + Date.now();
    const newProjects = [...projects, { id, name, created: Date.now() }];
    saveProjects(newProjects);
    saveProject(id, { completedSteps: [], stepNotes: {} });
    setCurrentProjectId(id);
    localStorage.setItem('mp_current', id);
    setProjectData({ completedSteps: [], stepNotes: {} });
    setCurrentView('dashboard');
  };

  const handleSelectProject = (id) => {
    setCurrentProjectId(id);
    localStorage.setItem('mp_current', id);
    setProjectData(loadProject(id));
    setCurrentView('dashboard');
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

  const handleSaveData = (newData) => {
    setProjectData(newData);
    if (currentProjectId) saveProject(currentProjectId, newData);
  };

  const handleGoHome = () => {
    setCurrentProjectId(null);
    localStorage.removeItem('mp_current');
    setCurrentView('home');
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
        />
      )}
      <main style={{ flex: 1, overflow: 'hidden' }}>
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
      </main>

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
