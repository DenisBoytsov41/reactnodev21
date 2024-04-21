import React from 'react';
import { useAuth } from './AuthContext';

const PersonalCabinet = ({ username, jwtToken, guestMode, currentTheme, error }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          token: jwtToken,
          error: error
        })
      });

      if (response.ok) {
        console.log('Успешно отправлен запрос на logout');
        window.location.href = '/';
      } else {
        console.error('Ошибка при отправке запроса на logout:', response.status);
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса на logout:', error);
    }
  };

  return (
    <div>
      <h1>Личный кабинет</h1>
      <p id="cookie-content"></p>
      {guestMode ? (
        <p>Добро пожаловать, {username}, в гостевой режим!</p>
      ) : (
        <p>Добро пожаловать, {username}!</p>
      )}
      {!guestMode && (
        <form id="theme-form">
          <label>Выберите тему:</label>
          <button id="theme-switch-btn" type="button" value={currentTheme === 'light' ? 'dark' : 'light'}>
            {currentTheme === 'light' ? 'Темная тема' : 'Светлая тема'}
          </button>
        </form>
      )}
      <form method="post" id="logout-form" onSubmit={handleLogout}>
        <button type="submit" className="btn" id="logout-btn" onClick={logout}>Выйти</button>
      </form>
      <div id="message-container"></div>
      <div id="dataContainer"></div>
    </div>
  );
};

export default PersonalCabinet;
