/* global ACCESS_TOKEN_EXPIRATION */
/* global REFRESH_TOKEN_EXPIRATION */
/* global ACCESS_TOKEN_SECRET */
/* global REFRESH_TOKEN_SECRET */
import React, { createContext, useContext, useState } from 'react';
import moment from 'moment-timezone';

const AuthContext = createContext();
global.REFRESH_TOKEN_EXPIRATION = 3600
global.ACCESS_TOKEN_EXPIRATION = 180

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (refreshLogin, accessToken) => {
    setIsLoggedIn(prevIsLoggedIn => {
      console.log("Я в login");
      console.log(prevIsLoggedIn);
      console.log("------------------------------------------");
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('refreshToken', refreshLogin);
      localStorage.setItem('refreshTokenExpiration', moment().add(global.REFRESH_TOKEN_EXPIRATION, 'seconds').tz('Europe/Moscow').format());
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('accessTokenExpiration', moment().add(global.ACCESS_TOKEN_EXPIRATION, 'seconds').tz('Europe/Moscow').format());
      return true;
    });
  };
  
  

  const logout = () => {
    setIsLoggedIn(prevIsLoggedIn => {
      console.log("logout");
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshTokenExpiration');
      localStorage.removeItem('accessTokenExpiration');
      return false;
    });
  };
  

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
