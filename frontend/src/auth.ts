const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

const BACKEND_URL = 'http://localhost:8080';

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
  const form   = document.getElementById('auth-form')!;
  const panel  = document.getElementById('auth-user')!;
  const avatar = document.getElementById('auth-user-avatar') as HTMLImageElement;
  const name   = document.getElementById('auth-user-name')!;
  const email  = document.getElementById('auth-user-email')!;

  avatar.src       = user.picture;
  name.textContent = user.name;
  email.textContent = user.email;

  form.hidden  = true;
  panel.hidden = false;
}

// ── Google Sign-In ────────────────────────────────────────────

function handleGoogleCredential(response: CredentialResponse): void {
  verifyWithBackend(response.credential)
    .then(showUser)
    .catch((err: Error) => console.error('[Kairos] Auth error:', err.message));
}

function initGoogleSignIn(): void {
  if (!window.google?.accounts?.id) return;

  if (GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
    console.warn('[Kairos] Google Sign-In: set GOOGLE_CLIENT_ID in src/auth.ts');
    return;
  }

  window.google.accounts.id.initialize({
    client_id:             GOOGLE_CLIENT_ID,
    callback:              handleGoogleCredential,
    cancel_on_tap_outside: false,
    context:               'signin',
  });
}

// ── Init ──────────────────────────────────────────────────────

export function initAuth(): void {
  const googleSignInBtn  = document.getElementById('google-sign-in-btn')!;
  const createAccountBtn = document.getElementById('create-account-btn')!;
  const tabButtons       = document.querySelectorAll<HTMLButtonElement>('.auth-card__tab');

  tabButtons.forEach(tab => {
    tab.addEventListener('click', () => {
      tabButtons.forEach(t => {
        t.classList.remove('auth-card__tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('auth-card__tab--active');
      tab.setAttribute('aria-selected', 'true');
    });
  });

  const gsiReady = (): void => {
    if (window.google) initGoogleSignIn();
    else window.addEventListener('load', initGoogleSignIn, { once: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', gsiReady, { once: true });
  } else {
    gsiReady();
  }

  googleSignInBtn.addEventListener('click', () => {
    if (!window.google?.accounts?.id) {
      console.warn('[Kairos] Google Identity Services not available.');
      return;
    }
    window.google.accounts.id.prompt();
  });

  createAccountBtn.addEventListener('click', () => googleSignInBtn.click());
}
