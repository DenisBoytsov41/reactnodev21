/* global grecaptcha */
import React, { useState } from 'react';
import { InputField, SubmitButton } from './FormComponents';
import { useAuth } from './AuthContext';
import PersonalCabinet from './PersonalCabinet'; // Импортируем компонент PersonalCabinet

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [loginError, setLoginError] = useState('');
  const { login, isLoggedIn } = useAuth(); // Добавляем isLoggedIn из контекста аутентификации

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRecaptchaChange = (response) => {
    console.log('Ответ капчи:', response);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          loginUsername: username,
          loginPassword: password
        })
      });
      setShowPassword(false);
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        setLoginMessage(data.message);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.reset();
        }
        login();
      } else {
        const errorData = await response.json();
        console.error(errorData.error);
        setLoginError(errorData.error);
        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.reset();
        }
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса: ', error);
    }
  };

  return (
    <div>
      {loginMessage && <div className="alert alert-success">{loginMessage}</div>}
      {loginError && <div className="alert alert-danger">{loginError}</div>}
      <form id="logForm" onSubmit={handleSubmit}>
        <InputField
          label="Логин"
          id="loginUsername"
          type="text"
          name="loginUsername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <div className="form-group">
          <label htmlFor="loginPassword">Пароль:</label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="off"
              className="form-control"
              id="loginPassword"
              name="loginPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="8"
            />
            <div className="input-group-append">
              <span className="input-group-text" id="togglePassword1" onClick={handleTogglePassword}>
                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
              </span>
            </div>
          </div>
        </div>
        <div className="g-recaptcha" data-sitekey="6LeUYYgpAAAAAHjo3qZ8wEhMcl4YkW-N6lQIvJGX" onChange={handleRecaptchaChange}></div>
        <SubmitButton label="Войти" />
      </form>
    </div>
  );
};

export default LoginForm;
