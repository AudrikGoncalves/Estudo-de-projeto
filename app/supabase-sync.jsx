// ─── Supabase Client + Auth + Sync ───
const SUPABASE_URL = 'https://qlnthjpympeqxnybcprz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oujVJ8nBa67vN_etodHzBw_IeLESe57';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'mp-auth' },
});

// Hook global: observa mudanças de sessão
const useAuth = () => {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabaseClient.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) throw error;
  };
  const signIn = async (email, password) => {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };
  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };

  return { session, loading, signUp, signIn, signOut };
};

// ─── Sync helpers ───
const cloudListProjects = async (userId) => {
  const { data, error } = await supabaseClient
    .from('projects').select('*')
    .eq('user_id', userId).order('updated', { ascending: false });
  if (error) throw error;
  return data || [];
};

const cloudUpsertProject = async (userId, project, projectData) => {
  const payload = {
    id: project.id,
    user_id: userId,
    name: project.name,
    cliente: project.cliente || '',
    status: project.status || 'Em andamento',
    anotacoes: project.anotacoes || '',
    data: projectData || {},
    created: project.created,
    updated: project.updated || Date.now(),
  };
  const { error } = await supabaseClient.from('projects').upsert(payload);
  if (error) throw error;
};

const cloudDeleteProject = async (userId, projectId) => {
  const { error } = await supabaseClient
    .from('projects').delete()
    .eq('user_id', userId).eq('id', projectId);
  if (error) throw error;
};

// Sincroniza na entrada: puxa da nuvem e faz merge com localStorage (mais recente vence)
const cloudSyncOnLogin = async (userId) => {
  try {
    const remote = await cloudListProjects(userId);
    const localRaw = JSON.parse(localStorage.getItem('mp-projetos') || '[]');
    const byId = new Map();

    // index local
    localRaw.forEach(p => byId.set(p.id, { src: 'local', meta: p }));

    // index remote (vence se mais recente)
    remote.forEach(r => {
      const existing = byId.get(r.id);
      const rMeta = { id: r.id, name: r.name, cliente: r.cliente, status: r.status,
                      anotacoes: r.anotacoes, created: Number(r.created), updated: Number(r.updated) };
      if (!existing || (rMeta.updated || 0) >= (existing.meta.updated || 0)) {
        byId.set(r.id, { src: 'remote', meta: rMeta, data: r.data });
      }
    });

    // Materializa
    const merged = [];
    for (const { src, meta, data } of byId.values()) {
      merged.push(meta);
      if (src === 'remote') {
        localStorage.setItem(`mp_proj_${meta.id}`, JSON.stringify(data || {}));
      } else {
        // projeto local ainda não enviado — envia para nuvem
        const localData = JSON.parse(localStorage.getItem(`mp_proj_${meta.id}`) || '{}');
        try { await cloudUpsertProject(userId, meta, localData); } catch (e) { console.warn('push fail', e); }
      }
    }
    merged.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    localStorage.setItem('mp-projetos', JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Sync falhou:', e);
    return null;
  }
};

// ─── Auth Screen ───
const AuthScreen = ({ onSkip, onAuthed }) => {
  const [mode, setMode] = React.useState('signin'); // signin | signup
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          onAuthed();
        } else {
          setMsg('Conta criada! Verifique seu e-mail para confirmar.');
        }
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthed();
      }
    } catch (err) {
      setMsg(err.message || 'Erro ao autenticar');
    } finally { setBusy(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 500, padding: 20, animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        width: '100%', maxWidth: 400, background: 'var(--bg-card)',
        border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
        padding: 32, boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'var(--accent)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, letterSpacing: 2, margin: '0 auto 12px',
          }}>MP</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Metodologia de Projeto</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {mode === 'signup' ? 'Crie sua conta para sincronizar entre aparelhos' : 'Entre para acessar seus projetos'}
          </p>
        </div>

        <form onSubmit={submit}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>E-mail</label>
          <input
            type="email" required autoFocus
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="voce@email.com"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', fontSize: 15, fontFamily: 'var(--font)',
              background: 'var(--bg)', outline: 'none', marginBottom: 14,
            }}
          />
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Senha</label>
          <input
            type="password" required minLength={6}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', fontSize: 15, fontFamily: 'var(--font)',
              background: 'var(--bg)', outline: 'none', marginBottom: 18,
            }}
          />
          {msg && (
            <div style={{
              fontSize: 12.5, padding: '10px 12px', borderRadius: 8, marginBottom: 14,
              background: msg.includes('Verifique') ? 'var(--green-light)' : 'var(--red-light)',
              color: msg.includes('Verifique') ? 'var(--green)' : 'var(--red)',
            }}>{msg}</div>
          )}
          <button type="submit" disabled={busy} style={{
            width: '100%', padding: '12px', borderRadius: 'var(--radius)',
            background: 'var(--accent)', color: '#fff', border: 'none',
            fontSize: 14, fontWeight: 600, fontFamily: 'var(--font)',
            cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1, marginBottom: 12,
          }}>
            {busy ? 'Aguarde...' : (mode === 'signup' ? 'Criar conta' : 'Entrar')}
          </button>
        </form>

        <div style={{ fontSize: 13, textAlign: 'center', color: 'var(--text-muted)' }}>
          {mode === 'signup' ? 'Já tem conta? ' : 'Não tem conta? '}
          <button type="button" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMsg(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {mode === 'signup' ? 'Entrar' : 'Criar conta'}
          </button>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '20px 0 16px' }} />

        <button type="button" onClick={onSkip} style={{
          width: '100%', padding: '10px', borderRadius: 'var(--radius)',
          background: 'transparent', color: 'var(--text-secondary)',
          border: '1px solid var(--border)', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'var(--font)',
        }}>
          Continuar sem login (apenas neste dispositivo)
        </button>
      </div>
    </div>
  );
};

// ─── Account Menu (usado no header) ───
const AccountBadge = ({ session, onSignOut, onShowAuth }) => {
  const [open, setOpen] = React.useState(false);

  if (!session) {
    return (
      <button
        data-header-btn
        onClick={onShowAuth}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px',
          borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          background: 'var(--bg)', color: 'var(--text-primary)', cursor: 'pointer',
          fontFamily: 'var(--font)',
        }}>
        <span data-header-btn-icon style={{ fontSize: 14 }}>👤</span>
        <span data-header-btn-label style={{ fontSize: 12, fontWeight: 600 }}>Entrar</span>
      </button>
    );
  }

  const email = session.user.email;
  const initials = (email || '?').slice(0, 2).toUpperCase();

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} title={email} style={{
        width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)',
        color: '#fff', border: 'none', fontSize: 12, fontWeight: 700,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{initials}</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{
            position: 'absolute', top: 42, right: 0, minWidth: 220,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
            padding: 8, zIndex: 100, animation: 'scaleIn 0.15s ease',
          }}>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-light)', marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Conectado como</div>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
            </div>
            <button onClick={() => { setOpen(false); onSignOut(); }} style={{
              width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 6,
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 13, color: 'var(--red)', fontFamily: 'var(--font)',
            }}>Sair</button>
          </div>
        </>
      )}
    </div>
  );
};

window.supabaseClient = supabaseClient;
window.useAuth = useAuth;
window.cloudUpsertProject = cloudUpsertProject;
window.cloudDeleteProject = cloudDeleteProject;
window.cloudSyncOnLogin = cloudSyncOnLogin;
window.AuthScreen = AuthScreen;
window.AccountBadge = AccountBadge;
