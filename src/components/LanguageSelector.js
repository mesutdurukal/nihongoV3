import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { id: 'japanese', name: '日本語' },
  { id: 'dutch', name: 'Nederlands' },
];

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  margin-left: 1rem;
  font-size: 0.9rem;
`;

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ textAlign: 'right', padding: '0.5rem 1rem' }}>
      <Select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default LanguageSelector;
