/* global ACCESS_TOKEN_EXPIRATION */
/* global REFRESH_TOKEN_EXPIRATION */
/* global ACCESS_TOKEN_SECRET */
/* global REFRESH_TOKEN_SECRET */
const db = require('../db');
const jwt = require('jsonwebtoken');
const { validateRegistration, hashPassword, comparePasswords } = require('../validation');
const crypto = require('crypto');
const moment = require('moment-timezone');

// Генерация случайной строки в формате hex
const generateRandomSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateAccessToken = (user) => {
  console.log("Я тут1");
  return jwt.sign({ 
    username: user.username, 
    guestMode: user.guestMode, 
    currentTheme: user.currentTheme, 
    error: user.error 
  }, global.ACCESS_TOKEN_SECRET, { expiresIn: global.ACCESS_TOKEN_EXPIRATION });
};

const generateRefreshToken = (user) => {
  console.log("Я тут2");
  console.log(global.REFRESH_TOKEN_SECRET);
  return jwt.sign({ 
    username: user.username, 
    guestMode: user.guestMode,
    currentTheme: user.currentTheme, 
    error: user.error 
  }, global.REFRESH_TOKEN_SECRET, { expiresIn: global.REFRESH_TOKEN_EXPIRATION });
};

const updateTokensWithTheme = (req, res) => {
  const { loginUsername, newAccessTokenDate, newRefreshTokenDate } = req.body;

  const newaccessToken = generateAccessToken(newAccessTokenDate);
  console.log("Новый access: " + newaccessToken);
  const newrefreshToken = generateRefreshToken(newRefreshTokenDate);
  console.log("Новый refresh: " + newrefreshToken);

  const updateTokenQuery = 'UPDATE UserToken SET refreshToken = ?, createdAt = NOW(), expiresIn = NOW() + INTERVAL ? SECOND WHERE user = ?';
  db.query(updateTokenQuery, [newrefreshToken, global.REFRESH_TOKEN_EXPIRATION, loginUsername], (updateErr, updateResult) => {
    if (updateErr) {
      console.error('Ошибка при обновлении refresh token в базе данных: ', updateErr);
      console.log('Ты лох оно ниже не спустилось');
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    console.log('Ты не лох оно ниже спустилось');
    return res.status(200).json({ 
      message: 'Токены успешно обновлены', 
      accessToken: newaccessToken, 
      refreshToken: newrefreshToken, 
      username: loginUsername, 
      jwtToken: newaccessToken 
    });
  });
};


const loginUser = async (req, res) => {
  const { loginUsername, loginPassword } = req.body;

  // Генерация ACCESS_TOKEN_SECRET и REFRESH_TOKEN_SECRET
  global.ACCESS_TOKEN_SECRET = generateRandomSecret();
  global.REFRESH_TOKEN_SECRET = generateRandomSecret();

  // Установка секретных ключей в переменные среды
  global.REFRESH_TOKEN_EXPIRATION = 3600;
  global.ACCESS_TOKEN_EXPIRATION = 180;

  const checkQuery = 'SELECT * FROM users WHERE Login = ?';
  db.query(checkQuery, [loginUsername], async (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Ошибка при проверке пользователя: ', checkErr);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (checkResult.length === 0) {
      return res.status(401).json({ error: 'Пользователь с таким логином не найден' });
    }

    const user = checkResult[0];
    const isPasswordValid = await comparePasswords(loginPassword, user.password);
    if (!isPasswordValid) {
      return res.status(402).json({ error: 'Неверный пароль' });
    }

    const themeQuery = 'SELECT theme FROM userstheme WHERE login = ?';
    db.query(themeQuery, [loginUsername], async (themeErr, themeResult) => {
      if (themeErr) {
        console.error('Ошибка при получении текущей темы пользователя: ', themeErr);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      let currentTheme = 'light';
      if (themeResult.length === 0) {
        const insertThemeQuery = 'INSERT INTO userstheme (login, theme) VALUES (?, ?)';
        db.query(insertThemeQuery, [loginUsername, currentTheme], (insertThemeErr, insertThemeResult) => {
          if (insertThemeErr) {
            console.error('Ошибка при создании темы пользователя: ', insertThemeErr);
          }
        });
      } else {
        currentTheme = themeResult[0].theme;
      }

      const refreshTokenQuery = 'SELECT refreshToken FROM UserToken WHERE user = ? AND expiresIn > NOW()';
      db.query(refreshTokenQuery, [loginUsername], (tokenErr, tokenResult) => {
        if (tokenErr) {
          console.error('Ошибка при проверке refresh token: ', tokenErr);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (tokenResult.length > 0) {
          const refreshToken = tokenResult[0].refreshToken;
          const accessToken = generateAccessToken({ 
            username: loginUsername, 
            guestMode: false, 
            currentTheme: currentTheme,
            error: null 
          });
          return res.status(200).json({ 
            message: 'Вход в систему', 
            accessToken: accessToken, 
            refreshToken: refreshToken, 
            username: loginUsername, 
            currentTheme: currentTheme 
          });
        } else {
          const accessToken = generateAccessToken({ 
            username: loginUsername, 
            guestMode: false, 
            currentTheme: currentTheme, 
            error: null 
          });
          const refreshToken = generateRefreshToken({ 
            username: loginUsername, 
            guestMode: false, 
            currentTheme: currentTheme, 
            error: null 
          });

          const insertTokenQuery = 'INSERT INTO UserToken (user, refreshToken, expiresIn) VALUES (?, ?, NOW() + INTERVAL ? SECOND)';
          db.query(insertTokenQuery, [loginUsername, refreshToken, global.REFRESH_TOKEN_EXPIRATION], (insertErr, insertResult) => {
            if (insertErr) {
              console.error('Ошибка при сохранении refresh token в базе данных: ', insertErr);
              return res.status(500).json({ error: 'Ошибка сервера' });
            }
            res.status(200).json({ 
              message: 'Вход в систему', 
              accessToken: accessToken, 
              refreshToken: refreshToken, 
              username: loginUsername, 
              currentTheme: currentTheme 
            });
          });
        }
      });
    });
  });
};

// Регистрация пользователя
const registerUser = async (req, res) => {
  const validationResult = validateRegistration(req.body);
  console.log(req.body);
  if (!validationResult.success) {
    return res.status(402).json({ error: validationResult.errors });
  }

  const { firstName, lastName, email, username, password, confirmPassword, agreeTerms, age, gender } = req.body;

  const checkQuery = 'SELECT * FROM users WHERE Login = ?';
  db.query(checkQuery, [username, email], async (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Ошибка при проверке пользователя: ', checkErr);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (checkResult.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    }

    const hashedPassword = await hashPassword(password);
    const hashedConfirmPassword = hashedPassword;

    const insertQuery = 'INSERT INTO users (first_name, last_name, email, login, password, confirm_password, accept_rules, age_status, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [firstName, lastName, email, username, hashedPassword, hashedConfirmPassword, agreeTerms, age, gender], (insertErr, result) => {
      if (insertErr) {
        console.error('Ошибка при добавлении пользователя: ', insertErr);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }
      res.status(200).json({ message: 'Пользователь успешно зарегистрирован', username: username, jwtToken: null });
    });
  });
};

// Обновление Access Token
const refreshToken = (req, res) => {
  const refreshTokenFromStorage = req.params.token;

  if (!refreshTokenFromStorage) {
    return res.status(401).json({ error: 'Отсутствует refreshToken в запросе' });
  }

  db.query('SELECT * FROM UserToken WHERE refreshToken = ?', [refreshTokenFromStorage], (err, result) => {
    if (err) {
      console.error('Ошибка при проверке refreshToken в базе данных: ', err);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }

    if (result.length === 0) {
      return res.status(403).json({ error: 'Недействительный refreshToken' });
    }

    jwt.verify(refreshTokenFromStorage, global.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error('Ошибка при проверке валидности refreshToken:', err);
        db.query('DELETE FROM UserToken WHERE refreshToken = ?', [refreshTokenFromStorage], (deleteErr, deleteResult) => {
          if (deleteErr) {
            console.error('Ошибка при удалении refreshToken из базы данных:', deleteErr);
          }
          //localStorage.removeItem('refreshToken');
          return res.status(403).json({ error: 'Недействительный refreshToken' });
        });
      } else {
          const accessToken = jwt.sign({ 
            username: decoded.username, 
            guestMode: decoded.guestMode, 
            currentTheme: decoded.currentTheme, 
            error: decoded.error 
          }, global.ACCESS_TOKEN_SECRET, { expiresIn: global.ACCESS_TOKEN_EXPIRATION });

          return res.status(200).json({ accessToken: accessToken });
      }
    });
  });
};

const checkRefreshToken = (req, res) => {
  console.log("Я хоть тут1");
  const { refreshToken, refreshTokenExpiration } = req.body; 
  console.log(refreshToken);
  if (!refreshToken) {
    return res.status(400).json({ error: 'Отсутствует refreshToken в запросе' });
  }
  db.query('SELECT * FROM UserToken WHERE refreshToken = ?', [refreshToken], (err, result) => {
    console.log("Я хоть тут2");
    if (err) {
      console.error('Ошибка при проверке refreshToken в базе данных:', err);
      console.log("Я хоть тут3");
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
    if (result.length === 0) {
      console.log("Я хоть тут4");
      //localStorage.removeItem('refreshToken');
      //localStorage.removeItem('accessToken');
      return res.status(404).json({ error: 'refreshToken не найден' });
    }
    console.log("Я хоть тут5");
    const dbRefreshToken = result[0];
    const dbExpiration = dbRefreshToken.expiresIn;
    const expirationMoment = moment(dbExpiration);
    const formattedExpiration = expirationMoment.format('YYYY-MM-DD HH:mm:ss');
    console.log(refreshTokenExpiration);
    console.log(formattedExpiration);

    if (refreshTokenExpiration && refreshTokenExpiration === formattedExpiration) {
      console.log("Я хоть тут6");
      return res.status(200).json({ massage: "Всё ок" });
    } else {
      console.log("Я хоть тут7");
      db.query('DELETE FROM UserToken WHERE refreshToken = ?', [refreshToken], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.log("Я хоть тут8");
          console.error('Ошибка при удалении refreshToken из базы данных:', deleteErr);
        }
      });
      console.log("Я хоть тут9");
      //localStorage.removeItem('refreshToken');
      //localStorage.removeItem('refreshTokenExpiration');
      //localStorage.removeItem('accessToken');
      return res.status(401).json({ error: 'refreshToken не найден в локальном хранилище или истек его срок действия' });
    }
  });
};



const logoutUser = (req, res) => {
  const { refreshToken } = req.body; 
  console.log("refreshToken: " + refreshToken);
  if (!refreshToken) {
    return res.status(400).json({ error: 'Отсутствует refreshToken в запросе' });
  }

  // Проверяем refreshToken в базе данных и удаляем его, если он существует
  db.query('DELETE FROM UserToken WHERE refreshToken = ?', [refreshToken], (err, result) => {
    if (err) {
      console.error('Ошибка при удалении refreshToken из базы данных:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      console.log('refreshToken успешно удалён из базы данных');
      return res.status(200).json({ message: 'Вы успешно вышли из системы' });
    }
  });
};
const deleteRefreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Отсутствует refreshToken в запросе' });
  }
  db.query('DELETE FROM UserToken WHERE refreshToken = ?', [refreshToken], (deleteErr, deleteResult) => {
    if (deleteErr) {
      console.error('Ошибка при удалении refreshToken из базы данных:', deleteErr);
      return res.status(500).json({ error: 'Ошибка при удалении refreshToken из базы данных' });
    }
    console.log('Токен успешно удален из базы данных');
    return res.status(200).json({ message: 'Токен успешно удален из базы данных' });
  });
};

const fetchData = (req, res) => {
  const sql = "SELECT login FROM users";
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Ошибка при выполнении запроса:', err);
      res.status(500).json({ error: 'Ошибка при выполнении запроса' });
      return;
    }
    res.json(result);
  });
};

const totalRecords = (req, res) => {
  const sql = "SELECT COUNT(*) AS total FROM users";
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Ошибка при выполнении запроса:', err);
      res.status(500).json({ error: 'Ошибка при выполнении запроса' });
      return;
    }
    res.json(result);
  });
};

const searchUsers = (req, res) => {
  try {
    const userSearch = req.params.userSearch;
    console.log("Сейчас тут: " + req.params.userSearch);
    
    if (!userSearch) {
      return res.status(400).json({ error: 'Пожалуйста, введите ключевое слово для поиска.' });
    }
    
    const query = `SELECT * FROM users WHERE login LIKE '%${userSearch}%'`;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Ошибка при выполнении запроса к базе данных:', err);
        return res.status(500).json({ error: 'Произошла ошибка при выполнении запроса к базе данных.' });
      }
      
      if (results.length > 0) {
        res.json(results);
      } else {
        res.status(404).json({ message: 'По вашему запросу ничего не найдено.' });
      }
    });
  } catch (error) {
    console.error('Ошибка при выполнении запроса к базе данных:', error);
    res.status(500).json({ error: 'Произошла ошибка при выполнении запроса к базе данных.' });
  }
};

const searchUsers_2 = (req, res) => {
  try {
    const userSearch = req.params.userSearch;
    console.log("Сейчас тут: " + req.params.userSearch);
    
    if (!userSearch) {
      return res.status(400).json({ error: 'Пожалуйста, введите ключевое слово для поиска.' });
    }
    const searchWords = userSearch.split(' ');
    const conditions = searchWords.map(word => `login LIKE '%${word}%'`).join(' OR ');
  
    const query = `SELECT * FROM users WHERE ${conditions}`;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Ошибка при выполнении запроса к базе данных:', err);
        return res.status(500).json({ error: 'Произошла ошибка при выполнении запроса к базе данных.' });
      }
  
      if (results.length > 0) {
        res.json(results);
      } else {
        res.status(404).json({ message: 'По вашему запросу ничего не найдено.' });
      }
    });
  } catch (error) {
    console.error('Ошибка при выполнении запроса к базе данных:', error);
    res.status(500).json({ error: 'Произошла ошибка при выполнении запроса к базе данных.' });
  }
};

const countRecordsLastMonth = (req, res) => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  
  const beginDate = firstDayOfMonth.toISOString().slice(0, 10);
  const endDate = lastDayOfMonth.toISOString().slice(0, 10);

  const sql = `SELECT COUNT(*) AS record_count FROM userbd WHERE created_at >= '${beginDate}' AND created_at <= '${endDate}'`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Ошибка при выполнении запроса:', err);
      res.status(500).json({ error: 'Ошибка при выполнении запроса' });
      return;
    }
    res.json(result);
  });
};

const lastAddedRecord = (req, res) => {
  const sql = "SELECT * FROM userbd ORDER BY created_at DESC LIMIT 0,1";
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Ошибка при выполнении запроса:', err);
      res.status(500).json({ error: 'Ошибка при выполнении запроса' });
      return;
    }
    res.json(result);
  });
};


const updateTheme = (req, res) => {
  const { username, newTheme } = req.body;

  const updateQuery = 'UPDATE userstheme SET theme = ? WHERE login = ?';
  db.query(updateQuery, [newTheme, username], (err, result) => {
    if (err) {
      console.error('Ошибка при обновлении темы в базе данных:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    console.log('Тема успешно обновлена в базе данных');
    return res.status(200).json({ message: 'Тема успешно обновлена в базе данных' });
  });
};


module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  deleteRefreshToken,
  checkRefreshToken,
  fetchData,
  totalRecords,
  updateTokensWithTheme,
  updateTheme,
  countRecordsLastMonth,
  lastAddedRecord,
  searchUsers,
  searchUsers_2
};
