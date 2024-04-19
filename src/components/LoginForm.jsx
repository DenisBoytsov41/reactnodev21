import React, { useState } from 'react';
import { InputField, SubmitButton } from './FormComponents';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Username:', username);
    console.log('Password:', password);
  };

  return (
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
      <div className="g-recaptcha" data-sitekey="6LeUYYgpAAAAAHjo3qZ8wEhMcl4YkW-N6lQIvJGX"></div>
      <SubmitButton label="Войти" />
    </form>
  );
};

export default LoginForm;
