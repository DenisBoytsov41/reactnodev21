/* global ACCESS_TOKEN_EXPIRATION */
/* global REFRESH_TOKEN_EXPIRATION */
/* global ACCESS_TOKEN_SECRET */
/* global REFRESH_TOKEN_SECRET */
const db = require('../db');
const jwt = require('jsonwebtoken');
const { validateRegistration, hashPassword, comparePasswords } = require('../validation');
const crypto = require('crypto');

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
  global.ACCESS_TOKEN_EXPIRATION = 120;

  // Установка времени истечения токенов (в секундах)
  global.REFRESH_TOKEN_EXPIRATION = 3600;
  global.ACCESS_TOKEN_EXPIRATION = 120;

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
const refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken == null) return res.sendStatus(401);

  db.query('SELECT * FROM UserToken WHERE refreshToken = ?', [refreshToken], async (err, result) => {
    if (err) {
      console.error('Ошибка при проверке refresh token в базе данных: ', err);
      return res.sendStatus(500);
    }
    if (result.length === 0) return res.sendStatus(403);

    jwt.verify(refreshToken, global.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken({ username: user.username });
      db.query('DELETE FROM UserToken WHERE refreshToken = ?', [refreshToken], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error('Ошибка при удалении refresh token из базы данных: ', deleteErr);
          return res.sendStatus(500);
        }
        res.json({ accessToken: accessToken });
      });
    });
  });
};

const logoutUser = (req, res) => {
  const { username, refreshToken, error } = req.body; 

  db.query('DELETE FROM UserToken WHERE refreshToken = ?', [refreshToken], (deleteErr, deleteResult) => {
    if (deleteErr) {
      console.error('Ошибка при удалении refresh token из базы данных: ', deleteErr);
      return res.sendStatus(500);
    }
    res.json({ message: 'Успешный выход из системы' });
  });

  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  res.status(200).json({ message: 'Вы успешно вышли из системы' });
};


module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser
};
