import { Alert, AlertDescription, AlertTitle } from '@/components/lib/ui/alert';
import React, { useEffect } from 'react';

const ErrorMessage: React.FC<{ message: string, timeout?: number, returnUrl?: string, onTimeout?: () => void }> = ({ message, timeout = 5000, returnUrl = "/auth/login", onTimeout }) => {
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
    <Alert variant="destructive" className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="w-16 h-16 rounded-full bg-red-200 flex items-center justify-center mb-4 shadow-inner">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ef4444" /><path d="M8 15l8-8M8 8l8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>
      <AlertTitle className="text-red-600 text-xl font-bold mb-2">Error!</AlertTitle>
      <AlertDescription className="text-red-500 text-center">{message}</AlertDescription>
    </Alert>
  );
};

export default ErrorMessage;
