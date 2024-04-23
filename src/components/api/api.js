import React from 'react';

const Api = () => {
  const fetchDataFromDatabase = async () => {
    try {
      const response = await fetch('http://localhost:5000/fetchData', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Ошибка при получении данных из базы данных');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка при получении данных из базы данных:', error);
      return null;
    }
  };

  return {
    fetchDataFromDatabase
  };
};

export default Api;
