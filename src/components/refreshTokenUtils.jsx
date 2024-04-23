import React from 'react';
const moment = require('moment-timezone');

const checkRefreshToken = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const localStorageExpiration = localStorage.getItem('refreshTokenExpiration');

    if (!refreshToken || !localStorageExpiration) {
        console.error('Ошибка при проверке refreshToken: Токен отсутствует');
        return;
    }
    const expirationMoment = moment(localStorageExpiration);
    if (expirationMoment.isValid()) {
        const formattedExpiration = expirationMoment.format('YYYY-MM-DD HH:mm:ss');
        fetch('http://localhost:5000/checkRefreshToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refreshToken: refreshToken,
                refreshTokenExpiration: formattedExpiration
            })
        })
        .then(response => {
            if (response.status === 401 || response.status === 404) {
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('refreshTokenExpiration');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('accessTokenExpiration');
                window.location.reload();
                throw new Error('Ошибка при проверке refreshToken');
            }
            if (!response.ok) {
                throw new Error('Ошибка при проверке refreshToken');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Ошибка при проверке refreshToken:', error);
        });
    } else {
        console.error('Ошибка при проверке refreshToken: Неверное значение времени в localStorage');
    }
};

  
  

export default checkRefreshToken;
