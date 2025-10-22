import React, { createContext, useContext, useState, useCallback } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'japanese';
  });

  const setLanguage = useCallback((newLanguage) => {
    setLanguageState(newLanguage);
    localStorage.setItem('selectedLanguage', newLanguage);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
