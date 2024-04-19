const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
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
