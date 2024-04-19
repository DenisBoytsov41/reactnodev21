import React, { useState, useEffect } from 'react';
import { InputField, CheckboxField, SelectField, RadioButton, SubmitButton } from './FormComponents';
import '../css/mainstyle.css';

function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const addStylesAndScripts = () => {
      const scriptJQuery = document.createElement('script');
      scriptJQuery.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
      document.body.appendChild(scriptJQuery);
    };

    addStylesAndScripts();

    return () => {
      const scriptsToRemove = document.querySelectorAll('script[src^="https://"]');
      scriptsToRemove.forEach((script) => document.body.removeChild(script));
    };
  }, []);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div>
      <form id="registrationForm" method="POST" action="php/process.php">
        <InputField label="Имя" id="firstName" type="text" name="firstName" required minLength={2} maxLength={15} />
        <InputField label="Фамилия" id="lastName" type="text" name="lastName" required minLength={2} maxLength={15} />
        <InputField label="Email" id="email" type="email" name="email" required />
        <InputField label="Логин" id="username" type="text" name="username" required minLength={6} />
        <InputField label="Пароль" id="password" type={showPassword ? 'text' : 'password'} name="password" required minLength={8} />
        <InputField label="Подтверждение пароля" id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" required />
        <CheckboxField label="Принимаю правила..." id="agreeTerms" name="agreeTerms" required />
        <SelectField label="Мне 18 лет" id="age" name="age" required options={[{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }]} />
        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="off"
              className="form-control"
              id="password"
              name="password"
              required
            />
            <div className="input-group-append">
              <span className="input-group-text" onClick={handleTogglePassword}>
                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
              </span>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Подтверждение пароля:</label>
          <div className="input-group">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="off"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              required
            />
            <div className="input-group-append">
              <span className="input-group-text" onClick={handleToggleConfirmPassword}>
                <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
              </span>
            </div>
          </div>
        </div>
        <SubmitButton label="Зарегистрироваться" />
      </form>
    </div>
  );
}

export default RegistrationForm;
