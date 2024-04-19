import React from 'react';

function CookieBanner({ show, onAccept }) {
  return (
    <div style={{ display: show ? 'block' : 'none' }} className="cookie-banner">
      <p>Мы используем куки (cookies), чтобы обеспечить лучшее пользовательское взаимодействие на нашем сайте. Продолжая использовать сайт, вы соглашаетесь с нашей политикой использования куки.</p>
      <button onClick={onAccept} className="accept-cookies-btn">Принять</button>
    </div>
  );
}

export default CookieBanner;
