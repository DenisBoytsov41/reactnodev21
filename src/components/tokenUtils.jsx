import moment from 'moment-timezone';

const clearExpiredTokens = () => {
  const currentDate = moment().tz('Europe/Moscow');
  const accessTokenExpiration = moment(localStorage.getItem('accessTokenExpiration')).tz('Europe/Moscow');
  const refreshTokenExpiration = moment(localStorage.getItem('refreshTokenExpiration')).tz('Europe/Moscow');

  if (accessTokenExpiration.isBefore(currentDate)) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('accessTokenExpiration');
  }

  if (refreshTokenExpiration.isBefore(currentDate)) {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExpiration');
  }
};

export default clearExpiredTokens;
