const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '20031996d',
  database: 'lab1'
});

connection.connect((err) => {
  if (err) {
    console.error('Ошибка подкючения к БД: ', err);
    return;
  }
  console.log('Подлкючение к БД');
});

module.exports = connection;