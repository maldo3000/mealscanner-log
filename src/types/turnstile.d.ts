
interface Window {
  turnstile?: {
    render: (container: HTMLElement, options: {
      sitekey: string;
      callback: (token: string) => void;
      theme?: 'light' | 'dark' | 'auto';
      tabindex?: number;
      refresh_expired?: string;
      action?: string;
      cData?: string;
      callback_timeout?: number;
      expired_callback?: () => void;
      error_callback?: () => void;
      before_interactive_callback?: () => void;
      after_interactive_callback?: () => void;
    }) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
  };
}
