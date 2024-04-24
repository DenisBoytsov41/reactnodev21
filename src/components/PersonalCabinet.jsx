/* global grecaptcha */
import React, { useState,useEffect } from 'react';
import { useAuth } from './AuthContext';
import MyButton from './MyButton';
import '../css/personal_cabinet.css';
import '../css/secondstyle.css';
import Api from '../components/api/api'
import { jwtDecode } from "jwt-decode" ;

const PersonalCabinet = ({ username, jwtToken, guestMode, currentTheme, error }) => {
  const { logout } = useAuth();
  const [userData, setUserData] = useState('');
  const [showData, setShowData] = useState(false);
  const { fetchDataFromDatabase, totalRecords, countRecordsLastMonth, lastAddedRecord, fetchDataAll } = Api();
  const [darkMode, setDarkMode] = useState(currentTheme === 'dark');
  const { login, isLoggedIn } = useAuth(); 
  const [userSearch, setUserSearch] = useState('');
  const [userSearch_2, setUserSearch2] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [errorr, setErrorr] = useState(null);
  const [searchResults2, setSearchResults2] = useState([]);
  const [errorr2, setErrorr2] = useState(null);
  console.log("Токен: " + jwtToken);

  const handleFetchData = async (dataCategory) => {
    let data;
    if (dataCategory === 'login') {
      data = await fetchDataFromDatabase();
    } else if (dataCategory === 'total') {
      data = await totalRecords();
    } else if (dataCategory === 'record_count') {
      data = await countRecordsLastMonth();
      console.log(data);
    }
    else if (dataCategory === 'name'){
      data = await lastAddedRecord();
      console.log(data);
    }
    else if (dataCategory === 'all'){
      data = await fetchDataAll();
      console.log(data);
    }
    if (data && Array.isArray(data)) {
      const mappedData = data.map(item => {
        if (dataCategory === 'login') {
          return item.login;
        } else if (dataCategory === 'total') {
          return item.total;
        } else if (dataCategory === 'record_count'){
          return item.record_count;
        } else if (dataCategory === 'name'){
          return item.name;
        } else if (dataCategory === 'all'){
          return item;
        }
      });
      setUserData(mappedData);
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
    const newTheme = darkMode ? 'light' : 'dark';
    setDarkMode(prevMode => !prevMode);
    updateTheme(newTheme);
  };

  const updateTheme = async (newTheme) => {
    try {
      const themeResponse = await fetch('http://localhost:5000/updateTheme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          newTheme: newTheme
        })
      });
      if (!themeResponse.ok) {
        console.error('Ошибка при обновлении темы в базе данных:', themeResponse.status);
        return;
      }
      console.log('Тема успешно обновлена в базе данных');

      const decodedAccessToken = jwtDecode(localStorage.getItem('accessToken'));
      const decodedRefreshToken = jwtDecode(localStorage.getItem('refreshToken'));
      const newAccessTokenDate = { ...decodedAccessToken, currentTheme: newTheme };
      console.log(newAccessTokenDate)
      const newRefreshTokenDate = { ...decodedRefreshToken, currentTheme: newTheme };
      console.log(newRefreshTokenDate)

      const tokensResponse = await fetch('http://localhost:5000/updateTokensWithTheme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          loginUsername: username,
          newAccessTokenDate: newAccessTokenDate,
          newRefreshTokenDate: newRefreshTokenDate,
        })
      });
      if (!tokensResponse.ok) {
        console.error('Ошибка при обновлении токенов в базе данных:', tokensResponse.status);
        return;
      }
      if (tokensResponse.ok) {
        const data = await tokensResponse.json();
        console.log('Токены успешно обновлены в базе данных');
        console.log(data);
        login(data.refreshToken,data.accessToken);
      } 
      else {
        const errorData = await tokensResponse.json();
        console.error(errorData.error);
      }
    } catch (error) {
      console.error('Ошибка при обновлении темы и токенов:', error);
    }
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const response = await fetch(`http://localhost:5000/search/${userSearch}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Ошибка при получении данных из базы данных');
        }
        const data = await response.json();
        console.log(data);
        setSearchResults(data);
        setErrorr(null);
        setTimeout(() => {
          setSearchResults([]);
        }, 3000);
        return data;
      } catch (error) {
        console.error('Ошибка при получении данных из базы данных:', error);
        setErrorr('Ошибка при поиске. Пожалуйста, попробуйте снова.');
        setTimeout(() => {
          setErrorr([]);
        }, 3000);
        return null;
      }
    };

    const handleSubmit_2 = async (e) => {
      e.preventDefault();
      
      try {
        const response = await fetch(`http://localhost:5000/search_2/${userSearch_2}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Ошибка при получении данных из базы данных');
        }
        const data = await response.json();
        console.log(data);
        setSearchResults2(data);
        setErrorr2(null);
        setTimeout(() => {
          setSearchResults2([]);
        }, 3000);
        return data;
      } catch (error) {
        console.error('Ошибка при получении данных из базы данных:', error);
        setErrorr2('Ошибка при поиске. Пожалуйста, попробуйте снова.');
        setTimeout(() => {
          setErrorr2([]);
        }, 3000);
        return null;
      }
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
            {userData.map((dataItem, index) => {
              if (dataItem.description && dataItem.result) {
                let renderedData;
                switch (dataItem.description) {
                  case 'Получить общее количество записей':
                    renderedData = <><strong>Total:</strong> {dataItem.result[0].total}</>;
                    break;
                  case 'Получить список логинов':
                    renderedData = <><strong>Login:</strong><ul>{dataItem.result.map((item, index) => <li key={index}>{item.login}</li>)}</ul></>;
                    break;
                  case 'Получить количество записей за последний месяц':
                    renderedData = <><strong>Record Count:</strong> {dataItem.result[0].record_count}</>;
                    break;
                  case 'Получить последнюю добавленную запись':
                    renderedData = (
                      <div>
                        <strong>ID:</strong> {dataItem.result[0].id}, <strong>Name:</strong> {dataItem.result[0].name}, <strong>Created At:</strong> {dataItem.result[0].created_at}
                      </div>
                    );
                    break;
                  default:
                    renderedData = null;
                }
                return <li key={index}>{renderedData}</li>;
              } else {
                return <li key={index}>{dataItem}</li>;
              }
            })}
          </ul>
        </div>
      )}

        <MyButton className="btn" onClick={() => handleFetchData('login')}>
          Вывести данные по логину
        </MyButton>
        <MyButton className="btn" onClick={() => handleFetchData('total')}>
          Вывести общее количество записей
        </MyButton>
        <MyButton className="btn" onClick={() => handleFetchData('record_count')}>
          Подсчет количества записей за последний месяц
        </MyButton>
        <MyButton className="btn" onClick={() => handleFetchData('name')}>
          Какая запись была сделана последней
        </MyButton>
        <MyButton className="btn" onClick={() => handleFetchData('all')}>
          Размещение данных на странице
        </MyButton>
        <div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="usersearch">Поиск по ключевому слову:</label>
            <input
              type="text"
              id="usersearch"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Введите ключевое слово"
            />
            <button className="btn" type="submit">Искать</button>
          </form>
          {errorr && <p>{errorr}</p>}
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>{result.login}</li>
            ))}
          </ul>
        </div>
        <div>
          <form onSubmit={handleSubmit_2}>
            <label htmlFor="usersearch_2">Реализация поиска по фразе:</label>
            <input
              type="text"
              id="usersearch_2"
              value={userSearch_2}
              onChange={(e) => setUserSearch2(e.target.value)}
              placeholder="Введите ключевое слово"
            />
            <button className="btn" type="submit">Искать</button>
          </form>
          {errorr2 && <p>{errorr2}</p>}
          <ul>
            {searchResults2.map((result, index) => (
              <li key={index}>{result.login}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PersonalCabinet;
