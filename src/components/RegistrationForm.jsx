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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    age: 'Мне 18 лет',
    gender: 'Мужской'
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (e) => {
    console.log("Я тут");
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    if (type === 'checkbox') {
      setFormData(prevState => ({
        ...prevState,
        [name]: newValue
      }));
    } else {
      setFormData({
        ...formData,
        [name]: newValue
      });
    }
  };
  
  const handleSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        const errorData = await response.json();
        console.error(errorData);
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса: ', error);
    }
  };

  return (
    <div>
      <form id="registrationForm" onSubmit={handleSubmit}>
        <InputField
          label="Имя"
          id="firstName"
          type="text"
          name="firstName"
          defaultValue={formData.firstName}
          onChange={handleChange}
          required
          minLength={2}
          maxLength={15}
        />
        <InputField
          label="Фамилия"
          id="lastName"
          type="text"
          name="lastName"
          defaultValue={formData.lastName}
          onChange={handleChange}
          required
          minLength={2}
          maxLength={15}
        />
        <InputField
          label="Email"
          id="email"
          type="email"
          name="email"
          defaultValue={formData.email}
          onChange={handleChange}
          required
        />
        <InputField
          label="Логин"
          id="username"
          type="text"
          name="username"
          defaultValue={formData.username}
          onChange={handleChange}
          required
          minLength={6}
        />
        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="off"
              className="form-control"
              id="password"
              name="password"
              value={formData.password} onChange={handleChange}
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
              value={formData.confirmPassword} onChange={handleChange}
              required
            />
            <div className="input-group-append">
              <span className="input-group-text" onClick={handleToggleConfirmPassword}>
                <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
              </span>
            </div>
          </div>
        </div>
        <CheckboxField
          label="Принимаю правила..."
          id="agreeTerms"
          defaultChecked={formData.agreeTerms}
          onChange={handleChange}
          name="agreeTerms"
          required
        />
        <SelectField label="Мне 18 лет" id="age" name="age" value={formData.age} onChange={handleChange} required options={[{ value: 'Мне 18 лет', label: 'Да' }, { value: 'Нет 18 лет', label: 'Нет' }]} />
        <label>Пол:</label><br></br>
        <RadioButton
          id="maleGender"
          name="gender"
          value="Мужской"
          label="Мужской"
          required
          onChange={handleChange}
        />
        <RadioButton
          id="femaleGender"
          name="gender"
          value="Женский"
          label="Женский"
          required
          onChange={handleChange}
        />
        <SubmitButton label="Зарегистрироваться" />
      </form>
    </div>
  );
  
}

export default RegistrationForm;