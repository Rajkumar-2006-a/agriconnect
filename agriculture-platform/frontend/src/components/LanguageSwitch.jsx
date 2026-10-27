import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitch({ className = '', style = {} }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className={`global-lang-switch ${className}`} style={style} title="Switch Website Language / மொழியை மாற்றவும்">
      <button
        type="button"
        className={`global-lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => toggleLanguage('en')}
      >
        English
      </button>
      <button
        type="button"
        className={`global-lang-btn ${language === 'ta' ? 'active' : ''}`}
        onClick={() => toggleLanguage('ta')}
      >
        தமிழ்
      </button>
    </div>
  );
}
