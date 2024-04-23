import React, { useState, useEffect } from 'react';
import CookieBanner from './components/CookieBanner';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import ThemeToggle from './components/ThemeToggle';
import MyButton from './components/MyButton';
import { useAuth } from './components/AuthContext'; 
import PersonalCabinet from './components/PersonalCabinet';
import GlobalAssets from './components/GlobalAssets';
import { useCookie } from './components/useCookie';
import './css/mainstyle.css';
import './css/cockie.css';
import { jwtDecode } from "jwt-decode" ;
import clearExpiredTokens from './components/tokenUtils';
import checkRefreshToken from './components/refreshTokenUtils';

const schedule = require('node-schedule');

function App() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showPersonalCabinet, setShowPersonalCabinet] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { isLoggedIn, login, logout } = useAuth(); 
  const { cookieAccepted, acceptCookie } = useCookie('cookiesAccepted');


  useEffect(() => {
    const loggedInState = localStorage.getItem('isLoggedIn');
    if (loggedInState === 'true') {
      setShowPersonalCabinet(true);
      setShowLoginForm(false);
      // Извлекаем данные из токена
      const accessToken = localStorage.getItem('accessToken');
      console.log("accessToken: " + accessToken)
      if (accessToken) {
        const decodedToken = jwtDecode(accessToken);
        setUsername(decodedToken.username);
        setJwtToken(accessToken);
        setGuestMode(decodedToken.guestMode);
        setCurrentTheme(decodedToken.currentTheme);
        setError(decodedToken.error);
      }
    } else {
      setShowPersonalCabinet(false);
    }
  }, [isLoggedIn, login, logout]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const decodedToken = jwtDecode(accessToken);
      setUsername(decodedToken.username);
      setJwtToken(accessToken);
      setGuestMode(decodedToken.guestMode);
      setCurrentTheme(decodedToken.currentTheme);
      setError(decodedToken.error);
    }
  }, [localStorage.getItem('accessToken')]);
  

  // Определения переменных
  const [username, setUsername] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [guestMode, setGuestMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('');
  const [error, setError] = useState('');

  const handleLoginBtnClick = () => {
    setShowLoginForm(true);
    setShowRegistrationForm(false);
    setShowPersonalCabinet(false);
  };

  const handleRegisterBtnClick = () => {
    setShowRegistrationForm(true);
    setShowLoginForm(false);
    setShowPersonalCabinet(false);
  };

  const handleThemeToggle = () => {
    setDarkMode(prevMode => !prevMode);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      window.location.reload();
    };
  
    window.addEventListener('storage', handleStorageChange);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  

  useEffect(() => {
    const toggleTheme = () => {
      document.body.classList.toggle("dark-mode", darkMode);
    };

    toggleTheme();
  }, [darkMode]);

  const handleLoginSuccess = () => {
    setShowLoginForm(false);
    setShowRegistrationForm(false);
    setShowPersonalCabinet(true);
    login();
  };

  const handleLogout = () => {
    setShowPersonalCabinet(false);
    logout();
  };

  const handleAcceptCookiesBtnClick = () => {
    acceptCookie();
  };



  const job = schedule.scheduleJob('*/1 * * * *', () => {
    console.log("Вызвал 1 мин");
    clearExpiredTokens();
    setTimeout(() => {
      checkRefreshToken();
    }, 2000);
  });


  return (
    <div className="container">
      {(jwtToken) ? (
        <div className="containerPers">
          <GlobalAssets />
          <PersonalCabinet
            username={username}
            jwtToken={jwtToken}
            guestMode={guestMode}
            currentTheme={currentTheme}
            error={error}
            onLogout={handleLogout} 
          />
        </div>        
      ) : (
        <div className="containerGlobal">
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
          <CookieBanner show={!cookieAccepted} onAccept={handleAcceptCookiesBtnClick} />
        </div>  
      )}
    </div>
  );
}

export default App;
