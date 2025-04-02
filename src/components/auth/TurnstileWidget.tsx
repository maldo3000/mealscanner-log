import React, { useRef, useEffect } from 'react';

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ siteKey, onVerify }) => {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>();

  useEffect(() => {
    // Load the Turnstile script if it's not already loaded
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Initialize widget when the script is loaded
    const renderWidget = () => {
      if (!ref.current || !window.turnstile) return;
      
      // Clean up any previous widget
      if (widgetId.current) {
        window.turnstile.remove(widgetId.current);
      }
      
      // Render new widget
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token);
        },
        theme: 'light',
      });
    };

    // Check if turnstile is already loaded
    if (window.turnstile) {
      renderWidget();
    } else {
      // Otherwise, wait for it to load
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      // Cleanup on component unmount
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [siteKey, onVerify]);

  return <div ref={ref} className="my-4"></div>;
};

export default TurnstileWidget;
