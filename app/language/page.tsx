"use client";

import { useEffect, useState } from "react";
import { getStoredLanguage, languageDisplayName, languages, setStoredLanguage } from "../language-runtime";
import type { LanguageCode } from "../language-runtime";

export default function LanguagePage() {
  const [displayLanguage, setDisplayLanguage] = useState<LanguageCode>("ru");

  useEffect(() => setDisplayLanguage(getStoredLanguage()), []);

  function chooseLanguage(code: (typeof languages)[number]["code"]) {
    setStoredLanguage(code);
    const destination = sessionStorage.getItem("lune-language-return") || "/";
    sessionStorage.removeItem("lune-language-return");
    window.location.assign(destination);
  }

  return (
    <main className="language-page">
      <header className="site-header language-header">
        <a href="/" className="logo" aria-label="LUNE — главная">LUNE</a>
        <a className="back-link" href="/">← Назад</a>
      </header>
      <section className="language-shell">
        <p className="eyebrow">LUNE worldwide</p>
        <h1>Выбор языка</h1>
        <div className="language-grid" data-no-auto-translate>
          {languages.map((language) => (
            <button key={language.code} onClick={() => chooseLanguage(language.code)} lang={language.code}>
              <span>{language.short}</span>
              <strong>{languageDisplayName(language.code, displayLanguage)}</strong>
              <i className="arrow-icon" aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
