/* Minimal type declarations for Google Identity Services */
interface CredentialResponse {
  credential: string;
  select_by: string;
  client_id: string;
}

interface IdConfiguration {
  client_id: string;
  callback?: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: string;
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
}

interface accounts {
  id: {
    initialize(idConfiguration: IdConfiguration): void;
    prompt(momentListener?: (notification: unknown) => void): void;
    renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
    disableAutoSelect(): void;
    revoke(hint: string, callback: () => void): void;
  };
}

declare interface Window {
  google?: { accounts: accounts };
  handleGoogleCallback?: (response: CredentialResponse) => void;
}
