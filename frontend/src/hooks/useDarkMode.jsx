import React, { createContext, useState, useContext, useEffect } from "react";

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      const isDark = JSON.parse(savedTheme);
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("darkMode", JSON.stringify(newTheme));
      document.documentElement.classList.toggle("dark", newTheme);
      return newTheme;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

const useDarkMode = () => useContext(DarkModeContext);

export default useDarkMode;
