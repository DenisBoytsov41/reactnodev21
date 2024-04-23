/* global grecaptcha */
import React from 'react';
import { useAuth } from './AuthContext';
import MyButton from './MyButton';

const PersonalCabinet = ({ username, jwtToken, guestMode, currentTheme, error }) => {
  const { logout } = useAuth();
  console.log("Токен: " + jwtToken);

  const handleLogout = () => {
    try {
      const response = fetch('http://localhost:5000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          refreshToken: localStorage.getItem('refreshToken'),
          error: error
        })
      });
      logout();
      if (response.ok) {
        console.log('Успешно отправлен запрос на logout');
        logout();
        window.location.href = '/';
        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.reset();
        }
      } else {
        console.error('Ошибка при отправке запроса на logout:', response.status);
        logout();
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса на logout:', error);
      logout();
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
          <MyButton id="theme-switch-btn" type="button" value={currentTheme === 'light' ? 'dark' : 'light'}>
            {currentTheme === 'light' ? 'Темная тема' : 'Светлая тема'}
          </MyButton>
        </form>
      )}
      <form id="logout-form" onSubmit={handleLogout}>
        <MyButton type="submit" className="btn" id="logout-btn">Выйти</MyButton>
      </form>
      <div id="message-container"></div>
      <div id="dataContainer"></div>
    </div>
  );
};

export default PersonalCabinet;
