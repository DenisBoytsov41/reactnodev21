const bcrypt = require('bcrypt');

const validateRegistration = (data) => {
  const { firstName, lastName, email, username, password, confirmPassword, gender } = data;
  const errors = [];

  if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !gender) {
    errors.push('Все поля должны быть заполнены');
  }

  if (password !== confirmPassword) {
    errors.push('Пароли не совпадают');
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
