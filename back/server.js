const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const schedule = require('node-schedule');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/', routes);

const removeExpiredTokens = () => {
  const moment = require('moment-timezone');
  const currentDate = moment.tz('Europe/Moscow').format('YYYY-MM-DD HH:mm:ss');
  console.log(currentDate);

  const deleteQuery = 'DELETE FROM UserToken WHERE expiresIn < ?';
  db.query(deleteQuery, [currentDate], (err, result) => {
    if (err) {
      console.error('Ошибка при удалении устаревших токенов из базы данных: ', err);
    } else {
      console.log('Устаревшие токены успешно удалены');
    }
  });
};

const job = schedule.scheduleJob('*/5 * * * *', () => {
  console.log('Выполнение задачи по удалению устаревших токенов...');
  removeExpiredTokens();
});

app.listen(PORT, () => {
  console.log(`Сервер работает на порту ${PORT}`);
});
