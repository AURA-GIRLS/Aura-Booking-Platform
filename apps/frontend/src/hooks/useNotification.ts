import { useState, useCallback } from 'react';

interface NotificationState {
  isVisible: boolean;
  type: 'success' | 'error';
  message: string;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isVisible: false,
    type: 'success',
    message: ''
  });

  const showSuccess = useCallback((message: string) => {
    setNotification({
      isVisible: true,
      type: 'success',
      message
    });
  }, []);

  const showError = useCallback((message: string) => {
    setNotification({
      isVisible: true,
      type: 'error',
      message
    });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  return {
    notification,
    showSuccess,
    showError,
    closeNotification
  };
};
