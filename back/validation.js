const bcrypt = require('bcrypt');

const validateRegistration = (data) => {
  const { firstName, lastName, email, username, password, confirmPassword, acceptRules, age, gender } = data;
  const errors = [];

  if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !acceptRules || !age || !gender) {
    errors.push('Все поля должны быть заполнены');
  }

  const nameRegex = /^[а-яА-Яa-zA-Z]+(?:[-\s][а-яА-Яa-zA-Z]+)?$/u;
  const spaceAndDashRegex = /[-\s]+/;

  // Проверка имени и фамилии
  if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
    errors.push('Недопустимое имя или фамилия');
  }

  // Проверка email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Недопустимый email');
  }

  // Проверка логина
  if (username.length < 6) {
    errors.push('Логин должен содержать не менее 6 символов');
  }

  // Проверка пароля
  const passwordRegex = /^(?=.*\d)(?=.*[a-zа-я])(?=.*[A-ZА-Я])(?=.*\W).{8,}$/;
  if (!passwordRegex.test(password)) {
    errors.push('Пароль должен содержать не менее 8 символов и включать в себя хотя бы одну заглавную букву, одну строчную букву, одну цифру и один символ');
  }

  // Проверка подтверждения пароля
  if (password !== confirmPassword) {
    errors.push('Пароли не совпадают');
  }

  // Проверка согласия с правилами
  if (!acceptRules) {
    errors.push('Вы должны принять правила');
  }

  return errors;
};

const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Ошибка при хешировании пароля: ', error);
    throw error;
  }
};

module.exports = { validateRegistration, hashPassword };
