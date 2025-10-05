import { useRouter } from 'next/navigation';

export const useAuthCheck = () => {
  const router = useRouter();

  const checkAuthAndExecute = (callback: () => void) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Redirect to login page
      router.push('/auth/login');
      return;
    }
    
    // Execute the callback if authenticated
    callback();
  };

  const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  return {
    checkAuthAndExecute,
    isAuthenticated
  };
};

// Non-hook version for use in regular functions
export const checkAuthToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token;
};

export const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
};