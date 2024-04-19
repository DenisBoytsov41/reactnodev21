import React from 'react';

const ThemeToggle = ({ onClick, darkMode }) => {
  return (
    <button onClick={onClick} className="btn theme-toggle">
      {darkMode ? "Светлая тема" : "Тёмная тема"}
    </button>
  );
};

export default ThemeToggle;
