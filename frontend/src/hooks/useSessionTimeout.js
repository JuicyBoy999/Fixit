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
        window.location.assign('/admin-login');
      }, timeout);
    };

    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));

    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [logout, timeout]);
};

export default useSessionTimeout;
