import { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useSessionTimeout = (timeout = 15 * 60 * 1000) => {
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        alert('Session expired due to inactivity');
      }, timeout);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [logout, timeout]);
};

export default useSessionTimeout;
