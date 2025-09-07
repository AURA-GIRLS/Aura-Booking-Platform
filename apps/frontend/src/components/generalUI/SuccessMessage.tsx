import { Alert, AlertDescription, AlertTitle } from '@/components/lib/ui/alert';
import React, { useEffect } from 'react';

const SuccessMessage: React.FC<{ message: string, timeout?: number, returnUrl?: string, onTimeout?: () => void }> = ({ message, timeout = 5000, returnUrl = "/auth/login", onTimeout }) => {
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
    <Alert variant="default" className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center mb-4 shadow-inner">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22c55e" /><path d="M8 12l2.5 2.5L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>
      <AlertTitle className="text-green-600 text-xl font-bold mb-2">Success!</AlertTitle>
      <AlertDescription className="text-green-500 text-center">{message}</AlertDescription>
    </Alert>
  );
};

export default SuccessMessage;
