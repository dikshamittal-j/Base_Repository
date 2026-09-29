import { useEffect, useState } from 'react';

const tokenKey = 'goodform-session';

async function request(path, options = {}) {
  const token = localStorage.getItem(tokenKey);
  const response = await fetch(`/api/auth/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Something went wrong. Please try again.');
  return result;
}

export default function App() {
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return;

    request('me')
      .then((result) => setUser(result.user))
      .catch(() => localStorage.removeItem(tokenKey));
  }, []);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await request(mode === 'login' ? 'login' : 'signup', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      localStorage.setItem(tokenKey, result.token);
      setUser(result.user);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await request('logout', { method: 'POST' });
    } finally {
      localStorage.removeItem(tokenKey);
      setUser(null);
      setForm({ name: '', email: '', password: '' });
      changeMode('login');
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Goodform Market home">
          <span className="brand-mark" aria-hidden="true">g</span>
          goodform<span className="wordmark-light">market</span>
        </a>
        <span className="topbar-note">A little more considered.</span>
      </header>

      <section className="auth-layout" aria-label="Account access">
        <div className="image-panel">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1500&q=85"
            alt="Thoughtfully arranged home objects on a sunlit shelf"
          />
          <div className="image-shade" />
          <div className="image-copy">
            <span className="eyebrow">GOOD THINGS, FOUND</span>
            <h1>Make room<br />for better.</h1>
            <p>Objects for everyday rituals, chosen to last and made to be loved.</p>
            <span className="image-caption"><span className="caption-line" /> CURATED FOR YOUR EVERYDAY</span>
          </div>
          <div className="image-stamp" aria-hidden="true">01<br /><span>—</span><br />26</div>
        </div>

        <div className="form-panel">
          {user ? (
            <div className="welcome-state">
              <span className="welcome-icon" aria-hidden="true">✓</span>
              <span className="eyebrow">YOU’RE IN</span>
              <h2>Welcome, {user.name.split(' ')[0]}.</h2>
              <p>Your account is ready. Take a look around and find something good.</p>
              <button className="primary-button" type="button" onClick={handleLogout}>Sign out</button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <span className="eyebrow">YOUR GOODFORM ACCOUNT</span>
                <h2>{mode === 'login' ? 'Welcome back.' : 'Join the good ones.'}</h2>
                <p>{mode === 'login' ? 'Sign in to pick up where you left off.' : 'Create an account and make yourself at home.'}</p>
              </div>

              <div className="mode-switch" role="tablist" aria-label="Account action">
                <button
                  className={mode === 'login' ? 'mode-tab active' : 'mode-tab'}
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => changeMode('login')}
                >Sign in</button>
                <button
                  className={mode === 'signup' ? 'mode-tab active' : 'mode-tab'}
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  onClick={() => changeMode('signup')}
                >Create account</button>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <label>
                    <span>Your name</span>
                    <input
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder="Jamie Taylor"
                      required
                    />
                  </label>
                )}
                <label>
                  <span>Email address</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={mode === 'signup' ? 8 : undefined}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                    required
                  />
                </label>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="primary-button" type="submit" disabled={busy}>
                  {busy ? 'One moment…' : mode === 'login' ? 'Sign in to your account' : 'Create my account'}
                  <span aria-hidden="true">↗</span>
                </button>
              </form>

              {mode === 'login' && (
                <div className="demo-note">
                  <span className="demo-dot" />
                  <span>Demo access</span>
                  <code>alex@example.com</code>
                  <code>Market123!</code>
                </div>
              )}
              <p className="terms-note">By continuing, you agree to shop thoughtfully and treat your inbox kindly.</p>
            </>
          )}
        </div>
      </section>

      <footer className="page-footer">
        <span>© 2026 GOODFORM MARKET</span>
        <span>BETTER THINGS, FEWER THINGS</span>
      </footer>
    </main>
  );
}