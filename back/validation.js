const bcrypt = require('bcrypt');

const validateRegistration = (data) => {
  const { firstName, lastName, email, username, password, confirmPassword, agreeTerms, age, gender } = data;
  const errors = [];

  if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !agreeTerms || !age || !gender) {
    return { success: false, errors: ['Все поля должны быть заполнены'] }; // Возвращаем ошибку
  }

  const nameRegex = /^[а-яА-Яa-zA-Z]+(?:[-\s][а-яА-Яa-zA-Z]+)?$/u;
  const spaceAndDashRegex = /[-\s]+/;

  // Проверка имени и фамилии
  if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
    return { success: false, errors: ['Недопустимое имя или фамилия'] }; // Возвращаем ошибку
  }

  // Проверка email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, errors: ['Недопустимый email'] }; // Возвращаем ошибку
  }

  // Проверка логина
  if (username.length < 6) {
    return { success: false, errors: ['Логин должен содержать не менее 6 символов'] }; // Возвращаем ошибку
  }

  // Проверка пароля
  const passwordRegex = /^(?=.*\d)(?=.*[a-zа-я])(?=.*[A-ZА-Я])(?=.*\W).{8,}$/;
  if (!passwordRegex.test(password)) {
    return { success: false, errors: ['Пароль должен содержать не менее 8 символов и включать в себя хотя бы одну заглавную букву, одну строчную букву, одну цифру и один символ'] }; // Возвращаем ошибку
  }

  // Проверка подтверждения пароля
  if (password !== confirmPassword) {
    return { success: false, errors: ['Пароли не совпадают'] }; // Возвращаем ошибку
  }

  // Проверка согласия с правилами
  if (!agreeTerms) {
    return { success: false, errors: ['Вы должны принять правила'] }; // Возвращаем ошибку
  }

  return { success: true, errors: [] }; // Возвращаем успех
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
const comparePasswords = async (password, hashedPassword) => {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.error('Ошибка при сравнении паролей: ', error);
    throw error;
  }
};

module.exports = { validateRegistration, hashPassword,comparePasswords };
