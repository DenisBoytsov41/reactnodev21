import { useState } from 'react';

export const useCookie = (cookieName) => {
  const [cookieAccepted, setCookieAccepted] = useState(() => {
    const cookieValue = localStorage.getItem(cookieName);
    return cookieValue === 'true';
  });

  const acceptCookie = () => {
    setCookieAccepted(true);
    localStorage.setItem(cookieName, 'true');
  };

  return { cookieAccepted, acceptCookie };
};
