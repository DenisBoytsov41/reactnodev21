import React, { useState, useEffect } from 'react';
import CookieBanner from './components/CookieBanner';
import LoginForm from './components/LoginForm';
import './css/mainstyle.css';
import './css/cockie.css';
import RegistrationForm from './components/RegistrationForm';
import ThemeToggle from './components/ThemeToggle';
import MyButton from './components/MyButton';
import GlobalAssets from './components/GlobalAssets';

function App() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (cookiesAccepted === 'true') {
      setShowCookieBanner(false);
    }
  }, []);

  const handleLoginBtnClick = () => {
    setShowLoginForm(true);
    setShowRegistrationForm(false);
  };

  const handleRegisterBtnClick = () => {
    setShowRegistrationForm(true);
    setShowLoginForm(false);
  };

  const handleAcceptCookiesBtnClick = () => {
    setShowCookieBanner(false);
    localStorage.setItem('cookiesAccepted', true);
  };
  const handleThemeToggle = () => {
    setDarkMode(prevMode => !prevMode);
  };

  useEffect(() => {
    const toggleTheme = () => {
      document.body.classList.toggle("dark-mode", darkMode);
    };

    toggleTheme();

    return () => {};
  }, [darkMode]);

  

  return (
    <div className="container">
      <GlobalAssets />
      <h2>Приветствуем на нашем сайте</h2>
      <MyButton id="loginButton" onClick={handleLoginBtnClick} className="btn">Авторизация</MyButton>
      <MyButton id="registerButton" onClick={handleRegisterBtnClick} className="btn">Регистрация</MyButton>
      <ThemeToggle onClick={handleThemeToggle} darkMode={darkMode} />
      <div style={{ display: showLoginForm ? 'block' : 'none' }} className="form-container">
        <h3>Форма авторизации</h3>
        <div id="loginErrors"></div>
        <LoginForm />
      </div>
      <div style={{ display: showRegistrationForm ? 'block' : 'none' }} className="form-container">
        <h3>Форма регистрации</h3>
        <div id="registrationErrors"></div>
        <RegistrationForm />
      </div>
      <CookieBanner show={showCookieBanner} onAccept={handleAcceptCookiesBtnClick} />
    </div>
  );
}

export default App;
