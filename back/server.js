const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const { validateRegistration, hashPassword } = require('./validation');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.post('/register', async (req, res) => {
  const errors = validateRegistration(req.body);
  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const { firstName, lastName, email, username, password, confirmPassword, gender } = req.body;

  const checkQuery = 'SELECT * FROM data WHERE Login = ? OR Email = ?';
  db.query(checkQuery, [username, email], async (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Ошибка при проверке пользователя: ', checkErr);
      res.status(500).json({ error: 'Ошибка сервера' });
      return;
    }

    if (checkResult.length > 0) {
      res.status(400).json({ error: 'Пользователь с таким логином или email уже существует' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    
    const insertQuery = 'INSERT INTO Users (first_name, last_name, email, login, password, gender) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [firstName, lastName, email, username, hashedPassword, gender], (insertErr, result) => {
      if (insertErr) {
        console.error('Ошибка при добавлении пользователя: ', insertErr);
        res.status(500).json({ error: 'Ошибка сервера' });
        return;
      }
      res.status(200).json({ message: 'Пользователь успешно зарегистрирован' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Сервер работает на порту ${PORT}`);
});
