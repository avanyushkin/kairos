// ── Config ────────────────────────────────────────────────────
// Replace with your real Client ID from Google Cloud Console:
// https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// ── Google Sign-In ────────────────────────────────────────────

function handleGoogleCredential(response: CredentialResponse): void {
  // response.credential is a signed JWT. Verify it on your backend before trusting.
  // POST /api/auth/google  { token: response.credential }
  console.info('[Kairos] Google Sign-In successful.');

  try {
    const payloadB64 = response.credential.split('.')[1];
    const payload = JSON.parse(atob(payloadB64)) as { name?: string; email?: string };
    console.info('[Kairos] User:', payload.name, payload.email);
  } catch { /* ignore decode errors */ }

  // TODO: redirect or update UI after successful sign-in
}

function initGoogleSignIn(): void {
  if (!window.google?.accounts?.id) return;

  if (GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
    console.warn('[Kairos] Google Sign-In: set GOOGLE_CLIENT_ID in src/auth.ts');
    return;
  }

  window.google.accounts.id.initialize({
    client_id:            GOOGLE_CLIENT_ID,
    callback:             handleGoogleCredential,
    cancel_on_tap_outside: false,
    context:              'signin',
  });
}

// ── Init ──────────────────────────────────────────────────────

export function initAuth(): void {
  const googleSignInBtn  = document.getElementById('google-sign-in-btn')!;
  const createAccountBtn = document.getElementById('create-account-btn')!;
  const tabButtons       = document.querySelectorAll<HTMLButtonElement>('.auth-card__tab');

  // Personal / Business tab switching
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

  // Wire Google Sign-In once GSI script is ready
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

  // "Create account" triggers the same Google flow
  createAccountBtn.addEventListener('click', () => googleSignInBtn.click());
}
