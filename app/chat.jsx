// ─── AI Chat Assistant ───
const ChatPanel = ({ projectData, isOpen, onClose }) => {
  const [messages, setMessages] = React.useState([
    { role: 'assistant', content: 'Olá! Sou seu assistente de metodologia de projeto. Posso ajudá-lo a conduzir cada etapa do processo Análise › Síntese › Avaliação. Como posso ajudar?' }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const messagesRef = React.useRef(null);

  React.useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const buildContext = () => {
    const completed = (projectData.completedSteps || []).length;
    const prog = (projectData.programa || []).map(r => r.ambiente).filter(Boolean).join(', ');
    const hier = projectData.hierarquizacao || {};
    const hierStr = Object.entries(hier).map(([k, v]) => `${k}: ${v}`).join('; ');
    return `Contexto do projeto atual:
- Etapas concluídas: ${completed}/25
- Programa de necessidades: ${prog || 'não preenchido'}
- Hierarquização: ${hierStr || 'não preenchida'}
IMPORTANTE: Você é um guia de metodologia de projeto arquitetônico (Análise > Síntese > Avaliação). Regras:
1. Na Análise: NUNCA proponha soluções formais. Se o usuário tentar resolver durante a análise, alerte sobre RECOGNIÇÃO.
2. Conduza etapa por etapa. Solicite informações antes de avançar.
3. Respostas curtas e objetivas em português brasileiro.
4. Use a metodologia A-S-Av fielmente.`;
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(p => [...p, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const context = buildContext();
      const allMsgs = [...messages, { role: 'user', content: userMsg }];
      const apiMessages = [
        { role: 'user', content: context },
        { role: 'assistant', content: 'Entendido. Vou seguir a metodologia A-S-Av fielmente.' },
        ...allMsgs.slice(-8)
      ];
      const response = await window.claude.complete({ messages: apiMessages });
      setMessages(p => [...p, { role: 'assistant', content: response }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: 'Desculpe, não consegui processar sua mensagem. Tente novamente.' }]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div data-chat-overlay style={chatStyles.overlay}>
      <div data-chat-panel style={chatStyles.panel}>
        <div style={chatStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>AI</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Assistente MP</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Guia de metodologia</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
        </div>

        <div ref={messagesRef} style={chatStyles.messages}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12, animation: 'fadeIn 0.2s ease' }}>
              <div style={{
                maxWidth: '80%', padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-sidebar)',
                color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                borderBottomRightRadius: m.role === 'user' ? 4 : 12,
                borderBottomLeftRadius: m.role === 'user' ? 12 : 4,
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-sidebar)', fontSize: 14, color: 'var(--text-muted)', animation: 'pulse 1.2s infinite' }}>
                Pensando...
              </div>
            </div>
          )}
        </div>

        <div style={chatStyles.inputArea}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Pergunte sobre a metodologia..."
            style={chatStyles.input} />
          <button onClick={send} disabled={loading || !input.trim()}
            style={{ ...chatStyles.sendBtn, opacity: loading || !input.trim() ? 0.4 : 1 }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};

const chatStyles = {
  overlay: { position: 'fixed', bottom: 20, right: 20, zIndex: 1000, animation: 'scaleIn 0.2s ease' },
  panel: { width: 400, height: 520, background: 'var(--bg-card)', borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border-light)' },
  messages: { flex: 1, overflowY: 'auto', padding: '16px 18px' },
  inputArea: { display: 'flex', gap: 8, padding: '12px 14px', borderTop: '1px solid var(--border-light)', background: 'var(--bg)' },
  input: { flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg-card)' },
  sendBtn: { width: 38, height: 38, borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

// ─── Chat FAB ───
const ChatFab = ({ onClick, hasChat }) => (
  <button data-chat-fab onClick={onClick} style={{
    position: 'fixed', bottom: 20, right: 20, width: 52, height: 52, borderRadius: 14,
    background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 22, fontWeight: 700,
    cursor: 'pointer', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.2s', zIndex: 999,
  }}
    onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
  >
    {hasChat ? '×' : 'AI'}
  </button>
);

window.ChatPanel = ChatPanel;
window.ChatFab = ChatFab;
