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


  const totalRecords = async () => { 
    try {
      const response = await fetch('http://localhost:5000/totalRecords', {
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

  const fetchDataAll = async () => {
    try {
      const requests = [
        { url: 'http://localhost:5000/totalRecords', description: "Получить общее количество записей" },
        { url: 'http://localhost:5000/fetchData', description: "Получить список логинов" },
        { url: 'http://localhost:5000/countRecordsLastMonth', description: "Получить количество записей за последний месяц" },
        { url: 'http://localhost:5000/lastAddedRecord', description: "Получить последнюю добавленную запись" }
      ];
  
      const responses = await Promise.all(requests.map(request =>
        fetch(request.url)
          .then(response => {
            if (!response.ok) {
              throw new Error('Ошибка при получении данных из базы данных');
            }
            return response.json();
          })
          .then(data => ({ description: request.description, result: data }))
      ));
  
      return responses;
    } catch (error) {
      console.error('Ошибка при получении данных из базы данных:', error);
      return null;
    }
  };
  
  

  const countRecordsLastMonth = async () => { 
    try {
      const response = await fetch('http://localhost:5000/countRecordsLastMonth', {
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

  const lastAddedRecord = async () => {
    try {
      const response = await fetch('http://localhost:5000/lastAddedRecord', {
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
    fetchDataFromDatabase,
    totalRecords,
    countRecordsLastMonth,
    lastAddedRecord,
    fetchDataAll
  };
};

export default Api;
