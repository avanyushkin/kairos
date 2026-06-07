const GOOGLE_CLIENT_ID = '574464533205-j96ct2rhjsqkov2j721glf3rk653lupu.apps.googleusercontent.com';
const BACKEND_URL      = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';

interface UserInfo {
  email:   string;
  name:    string;
  picture: string;
}

export class AuthManager {
  private gsiReady:       Promise<void> | null = null;
  private gsiInitialized: boolean = false;

  private readonly googleSignInBtn  = document.getElementById('google-sign-in-btn')!;
  private readonly createAccountBtn = document.getElementById('create-account-btn')!;
  private readonly tabButtons       = document.querySelectorAll<HTMLButtonElement>('.auth-card__tab');
  private readonly authPanel        = document.getElementById('auth-panel') as HTMLElement | null;

  constructor() {
    this.googleSignInBtn.addEventListener('click',  () => this.triggerGoogleSignIn());
    this.createAccountBtn.addEventListener('click', () => this.googleSignInBtn.click());
    this.tabButtons.forEach(tab => tab.addEventListener('click', () => this.onTabClick(tab)));
  }

  private onTabClick(tab: HTMLButtonElement): void {
    this.tabButtons.forEach(t => {
      t.classList.remove('auth-card__tab--active');
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    tab.classList.add('auth-card__tab--active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    if (this.authPanel && tab.id) this.authPanel.setAttribute('aria-labelledby', tab.id);
  }

  private triggerGoogleSignIn(): void {
    this.googleSignInBtn.setAttribute('aria-busy', 'true');
    this.loadGSI()
      .then(() => {
        this.ensureGSIInitialized();
        window.google?.accounts?.id.prompt();
      })
      .catch(() => console.warn('[Kairos] Google Identity Services unavailable.'))
      .finally(() => this.googleSignInBtn.setAttribute('aria-busy', 'false'));
  }

  private loadGSI(): Promise<void> {
    if (this.gsiReady) return this.gsiReady;
    this.gsiReady = new Promise<void>((resolve, reject) => {
      if (window.google?.accounts?.id) { resolve(); return; }
      const script     = document.createElement('script');
      script.src       = 'https://accounts.google.com/gsi/client';
      script.async     = true;
      script.defer     = true;
      script.onload    = () => resolve();
      script.onerror   = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
    return this.gsiReady;
  }

  private ensureGSIInitialized(): void {
    if (this.gsiInitialized || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id:             GOOGLE_CLIENT_ID,
      callback:              (r: CredentialResponse) => this.handleCredential(r),
      cancel_on_tap_outside: false,
      context:               'signin',
    });
    this.gsiInitialized = true;
  }

  private handleCredential(response: CredentialResponse): void {
    this.verifyWithBackend(response.credential)
      .then(user => this.showUser(user))
      .catch((err: Error) => console.error('[Kairos] Auth error:', err.message));
  }

  private async verifyWithBackend(token: string): Promise<UserInfo> {
    const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<UserInfo>;
  }

  private showUser(user: UserInfo): void {
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
}
