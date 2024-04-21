import React, { useState, useEffect } from 'react';
import CookieBanner from './components/CookieBanner';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import ThemeToggle from './components/ThemeToggle';
import MyButton from './components/MyButton';
import { useAuth } from './components/AuthContext'; 
import PersonalCabinet from './components/PersonalCabinet';
import GlobalAssets from './components/GlobalAssets';

function App() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showPersonalCabinet, setShowPersonalCabinet] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { isLoggedIn, setLoggedIn } = useAuth(); // Добавляем функцию для установки состояния входа

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (cookiesAccepted === 'true') {
      setShowCookieBanner(false);
    }
    // Проверяем сохранённое состояние входа в локальном хранилище
    const loggedInState = localStorage.getItem('isLoggedIn');
    if (loggedInState === 'true') {
      setShowPersonalCabinet(true);
    }
  }, []); 

  const handleLoginBtnClick = () => {
    setShowLoginForm(true);
    setShowRegistrationForm(false);
    setShowPersonalCabinet(false);
    console.log("Login button clicked");
  };

  const handleRegisterBtnClick = () => {
    setShowRegistrationForm(true);
    setShowLoginForm(false);
    setShowPersonalCabinet(false);
  };

  const handleThemeToggle = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleLoginSuccess = () => {
    setShowLoginForm(false);
    setShowRegistrationForm(false);
    setShowPersonalCabinet(true);
    setLoggedIn(true); // Устанавливаем состояние входа в true при успешной авторизации
    console.log("Login success");
  };

  const handleLogout = () => {
    setShowPersonalCabinet(false);
    setLoggedIn(false); // Устанавливаем состояние входа в false при выходе из аккаунта
  };

  const handleAcceptCookiesBtnClick = () => {
    setShowCookieBanner(false);
    localStorage.setItem('cookiesAccepted', true);
  };

  return (
    <div className="container">
      {isLoggedIn ? (
        <div>
          <GlobalAssets />
          <PersonalCabinet onLogout={handleLogout} />
        </div>        
      ) : (
        <div>
          <GlobalAssets />
          <h2>Приветствуем на нашем сайте</h2>
          <MyButton id="loginButton" onClick={handleLoginBtnClick} className="btn">Авторизация</MyButton>
          <MyButton id="registerButton" onClick={handleRegisterBtnClick} className="btn">Регистрация</MyButton>
          <ThemeToggle onClick={handleThemeToggle} darkMode={darkMode} />
          <div style={{ display: showLoginForm ? 'block' : 'none' }} className="form-container">
            <h3>Форма авторизации</h3>
            <div id="loginErrors"></div>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </div>
          <div style={{ display: showRegistrationForm ? 'block' : 'none' }} className="form-container">
            <h3>Форма регистрации</h3>
            <div id="registrationErrors"></div>
            <RegistrationForm />
          </div>
          <CookieBanner show={showCookieBanner} onAccept={handleAcceptCookiesBtnClick} />
        </div>
      )}
    </div>
  );
}

export default App;
