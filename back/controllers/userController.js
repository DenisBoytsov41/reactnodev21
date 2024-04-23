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

const loginUser = async (req, res) => {
  const { loginUsername, loginPassword } = req.body;
  console.log("Я тут2312");
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
          jwtToken: accessToken 
        });
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

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  deleteRefreshToken,
  checkRefreshToken,
  fetchData
};
