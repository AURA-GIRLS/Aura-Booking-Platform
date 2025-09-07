import { Alert, AlertTitle } from '@/components/lib/ui/alert';
import React, { useEffect } from 'react';

const LoadingMessage: React.FC<{ message?: string, timeout?: number, returnUrl?: string, onTimeout?: () => void }> = ({ message, timeout = 5000, returnUrl = "/auth/login", onTimeout }) => {
  useEffect(() => {
    if (timeout) {
      const timer = setTimeout(() => {
        if (onTimeout) {
          onTimeout();
        } else if (returnUrl) {
          window.location.assign(returnUrl);
        }
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [timeout, returnUrl, onTimeout]);
  return (
    <Alert variant="default" className="flex flex-col items-center justify-center min-h-[200px] text-pink-500 text-center">
      <svg className="animate-spin mb-4" width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#f472b6" strokeWidth="4" fill="none" opacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#f472b6" strokeWidth="4" strokeLinecap="round"/></svg>
      <AlertTitle>{message || 'Loading...'}</AlertTitle>
    </Alert>
  );
};

export default LoadingMessage;
