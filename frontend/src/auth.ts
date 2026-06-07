const GOOGLE_CLIENT_ID = '574464533205-j96ct2rhjsqkov2j721glf3rk653lupu.apps.googleusercontent.com';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';

// ── Backend verification ──────────────────────────────────────

interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

async function verifyWithBackend(token: string): Promise<UserInfo> {
  const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<UserInfo>;
}

// ── UI state ──────────────────────────────────────────────────

function showUser(user: UserInfo): void {
  const form   = document.getElementById('auth-panel')!;
  const panel  = document.getElementById('auth-user')!;
  const avatar = document.getElementById('auth-user-avatar') as HTMLImageElement;
  const name   = document.getElementById('auth-user-name')!;
  const email  = document.getElementById('auth-user-email')!;

  avatar.src        = user.picture;
  name.textContent  = user.name;
  email.textContent = user.email;

  form.hidden  = true;
  panel.hidden = false;
}

// ── Lazy GSI loader ───────────────────────────────────────────
//
// GSI script is NOT loaded at page start — it sets 19 third-party
// cookies that hurt Lighthouse Best Practices score.
// We load it on demand (first click), then cache the result.

let gsiReady: Promise<void> | null = null;

function loadGSI(): Promise<void> {
  if (gsiReady) return gsiReady;

  gsiReady = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(); return; }

    const script = document.createElement('script');
    script.src   = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });

  return gsiReady;
}

// ── Google Sign-In ────────────────────────────────────────────

function handleGoogleCredential(response: CredentialResponse): void {
  verifyWithBackend(response.credential)
    .then(showUser)
    .catch((err: Error) => console.error('[Kairos] Auth error:', err.message));
}

let gsiInitialized = false;

function ensureGSIInitialized(): void {
  if (gsiInitialized || !window.google?.accounts?.id) return;
  if (GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
    console.warn('[Kairos] Set GOOGLE_CLIENT_ID in src/auth.ts');
    return;
  }
  window.google.accounts.id.initialize({
    client_id:             GOOGLE_CLIENT_ID,
    callback:              handleGoogleCredential,
    cancel_on_tap_outside: false,
    context:               'signin',
  });
  gsiInitialized = true;
}

// ── Init ──────────────────────────────────────────────────────

export function initAuth(): void {
  const googleSignInBtn  = document.getElementById('google-sign-in-btn')!;
  const createAccountBtn = document.getElementById('create-account-btn')!;
  const tabButtons       = document.querySelectorAll<HTMLButtonElement>('.auth-card__tab');
  const authPanel        = document.getElementById('auth-panel') as HTMLElement | null;

  // Tab switching with roving tabindex
  tabButtons.forEach(tab => {
    tab.addEventListener('click', () => {
      tabButtons.forEach(t => {
        t.classList.remove('auth-card__tab--active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });
      tab.classList.add('auth-card__tab--active');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
      if (authPanel && tab.id) authPanel.setAttribute('aria-labelledby', tab.id);
    });
  });

  // Load GSI on first click, then prompt
  const triggerGoogleSignIn = (): void => {
    googleSignInBtn.setAttribute('aria-busy', 'true');

    loadGSI()
      .then(() => {
        ensureGSIInitialized();
        window.google?.accounts?.id.prompt();
      })
      .catch(() => console.warn('[Kairos] Google Identity Services unavailable.'))
      .finally(() => googleSignInBtn.setAttribute('aria-busy', 'false'));
  };

  googleSignInBtn.addEventListener('click', triggerGoogleSignIn);
  createAccountBtn.addEventListener('click', () => googleSignInBtn.click());
}
