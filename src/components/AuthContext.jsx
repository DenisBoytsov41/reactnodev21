import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => {
    setIsLoggedIn(prevIsLoggedIn => {
      console.log("Я в login");
      console.log(prevIsLoggedIn);
      console.log("------------------------------------------");
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    });
  };
  

  const logout = () => {
    setIsLoggedIn(prevIsLoggedIn => {
      localStorage.setItem('isLoggedIn', 'false');
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
