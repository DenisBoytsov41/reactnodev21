import moment from 'moment-timezone';
import axios from 'axios';

const clearExpiredTokens = () => {
  const currentDate = moment().tz('Europe/Moscow');

  const accessTokenExpiration = moment(localStorage.getItem('accessTokenExpiration'), 'YYYY-MM-DD HH:mm:ss').tz('Europe/Moscow');
  const refreshTokenExpiration = moment(localStorage.getItem('refreshTokenExpiration'), 'YYYY-MM-DD HH:mm:ss').tz('Europe/Moscow');

  if (accessTokenExpiration.isBefore(currentDate)) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('accessTokenExpiration');
  }

  if (refreshTokenExpiration.isBefore(currentDate)) {
    fetch('http://localhost:5000/deleteRefreshToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: localStorage.getItem('refreshToken')
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка при удалении refreshToken из базы данных');
      }
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('refreshTokenExpiration');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('accessTokenExpiration');
      console.log('Токен успешно удален из базы данных');
      window.location.reload();
    })
    .catch(error => {
      console.error(error);
    });
  }
  
  if (accessTokenExpiration.isBefore(currentDate) && refreshTokenExpiration.isAfter(currentDate)) {
    console.log("Ало");
    axios.post(`http://localhost:5000/refreshToken/${localStorage.getItem('refreshToken')}`)
      .then(response => {
        const newAccessToken = response.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        const newExpirationTime = moment().add(3, 'minutes').tz('Europe/Moscow').format();
        localStorage.setItem('accessTokenExpiration', newExpirationTime);
      })
      .catch(error => {
        console.error('Error refreshing access token:', error);
      });
  }
};

export default clearExpiredTokens;
