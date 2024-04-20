const db = require('../db');
const { validateRegistration, hashPassword, comparePasswords } = require('../validation');

const loginUser = async (req, res) => {
  const { loginUsername, loginPassword } = req.body;

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
    console.log(user);
    console.log(user.password);
    console.log(loginPassword);
    const isPasswordValid = await comparePasswords(loginPassword, user.password);
    if (!isPasswordValid) {
      return res.status(402).json({ error: 'Неверный пароль' });
    }

    res.status(200).json({ message: 'Вход в систему успешен' });
  });
};

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
      res.status(200).json({ message: 'Пользователь успешно зарегистрирован' });
    });
  });
};

module.exports = {
    registerUser,
    loginUser,
  };
