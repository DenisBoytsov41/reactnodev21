/* global grecaptcha */
import React, { useState,useEffect } from 'react';
import { useAuth } from './AuthContext';
import MyButton from './MyButton';
import '../css/personal_cabinet.css';
import '../css/secondstyle.css';
import Api from '../components/api/api'

const PersonalCabinet = ({ username, jwtToken, guestMode, currentTheme, error }) => {
  const { logout } = useAuth();
  const [userData, setUserData] = useState('');
  const [showData, setShowData] = useState(false);
  const { fetchDataFromDatabase } = Api();
  const [darkMode, setDarkMode] = useState(false);
  console.log("Токен: " + jwtToken);

  const handleFetchData = async () => {
    const data = await fetchDataFromDatabase();
    if (data && Array.isArray(data)) {
      const logins = data.map(item => item.login);
      setUserData(logins);
      setShowData(true);
      setTimeout(() => {
        setShowData(false);
        setUserData([]);
      }, 3000); 
    }
  };
  useEffect(() => {
    const toggleTheme = () => {
      document.body.classList.toggle("dark-mode", darkMode);
    };

    toggleTheme();
  }, [darkMode]);


  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
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
  const handleThemeToggle = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <div className={darkMode ? 'dark' : 'light'}>
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
          <button id="theme-switch-btn" type="button" onClick={handleThemeToggle}>
            {darkMode ? 'Светлая тема' : 'Темная тема'}
          </button>
        </form> 
      )}
      <form id="logout-form" onSubmit={handleLogout}>
        <MyButton type="submit" className="btn" id="logout-btn">Выйти</MyButton>
      </form>
      <div id="message-container"></div>
      <div id="dataContainer">
        {showData && userData.length > 0 && (
          <div>
            <p>Данные из базы данных:</p>
            <ul>
              {userData.map((login, index) => (
                <li key={index}>{login}</li>
              ))}
            </ul>
          </div>
        )}
        <MyButton className="btn" onClick={handleFetchData}>Вывод данных из базы на страницу</MyButton>
        <form method="post" action="total_records.php">
          <button className="btn" type="submit">Общее количество записей в таблице</button>
        </form>
        <form method="post" action="count_records_last_month.php">
          <button className="btn" type="submit">Подсчет количества записей за последний месяц</button>
        </form>
        <form method="post" action="last_added_record.php">
          <button className="btn" type="submit">Какая запись была сделана последней</button>
        </form>
        <form method="post" action="display_results.php">
          <button className="btn" type="submit">Размещение данных на странице</button>
        </form>
        <form method="get" action="search_results.php">
          <label htmlFor="usersearch">Поиск по ключевому слову:</label>
          <input type="text" id="usersearch" name="usersearch" placeholder="Введите ключевое слово" />
          <button className="btn" type="submit">Искать</button>
        </form>
        <form method="get" action="search_results_2.php">
          <label htmlFor="usersearch">Реализация поиска по фразе:</label>
          <input type="text" id="usersearch" name="usersearch" placeholder="Введите фразу поиска" />
          <button className="btn" type="submit">Искать</button>
        </form>
      </div>
    </div>
  );
};

export default PersonalCabinet;
