"use client";

import { useEffect, useState } from "react";
import { getStoredLanguage, languageDisplayName } from "../language-runtime";

const stores = [
  ["Москва", "ул. xxxxxxxx, д. xx", "+7 (xxx) xxx-xx-xx"],
  ["Париж", "rue xxxxxxxx,xx", "+33 x xx xx xx xx"],
  ["Милан", "via xxxxxxxx,xx", "+39 xxx xxx xxxx"],
  ["Берлин", "xxxxxxxxstraße,xx", "+49 xxx xxxxxxx"],
  ["Копенгаген", "xxxxxxxxgade,xx", "+45 xx xx xx xx"],
];

export function Footer() {
  const [storesOpen, setStoresOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [languageName, setLanguageName] = useState("Русский");

  useEffect(() => {
    const syncLanguage = () => {
      const active = getStoredLanguage();
      setLanguageName(languageDisplayName(active, active));
    };
    syncLanguage();
    window.addEventListener("lune-language-updated", syncLanguage);
    return () => window.removeEventListener("lune-language-updated", syncLanguage);
  }, []);

  function rememberLanguageReturn() {
    sessionStorage.setItem("lune-language-return", window.location.pathname + window.location.search + window.location.hash);
  }

  return (
    <footer className="site-footer">
      <a className="footer-language" href="/language" onClick={rememberLanguageReturn} aria-label="Выбрать язык">
        <span className="globe-icon" aria-hidden="true" />
        <strong data-no-auto-translate>{languageName}</strong>
      </a>
      <div className="footer-top">
        <div><a href="/#top" className="logo">LUNE</a><p>Тихие формы для современной жизни.<br />Москва, Россия.</p></div>
        <div><h3>Коллекции</h3><a href="/#shop">Новинки</a><a href="/#best-sellers">Вся одежда</a><a href="/#story">О бренде</a><a href="/#journal">Отзывы</a></div>
        <div><h3>Помощь</h3><a href="/#process">Доставка и возврат</a><a href="mailto:care@lune-studio.com">Связаться</a><a href="/#faq">FAQ</a><button className="stores-toggle" aria-expanded={storesOpen} onClick={() => setStoresOpen(!storesOpen)}>Магазины <span>{storesOpen ? "−" : "+"}</span></button></div>
        <div className="footer-company"><h3>Компания</h3><a href="/#philosophy">О <strong>LUNE</strong></a><a href="/support">Новости</a><a href="/support">Инвесторы</a></div>
        <form onSubmit={(event) => { event.preventDefault(); setSubscribed(true); }}>
          <h3>Журнал LUNE</h3><p>{subscribed ? "Спасибо за подписку." : "Заметки о мастерстве, культуре и осознанной жизни."}</p>
          <label><span className="sr-only">Электронная почта</span><input required type="email" placeholder="Электронная почта" /><button aria-label="Подписаться"><span className="arrow-icon" aria-hidden="true" /></button></label>
        </form>
      </div>
      <div className={`stores-panel ${storesOpen ? "open" : ""}`}>
        <div className="stores-panel-inner">
          {stores.map(([city, address, phone], index) => (
            <article className="store-card" key={city}><span>{String(index + 1).padStart(2, "0")}</span><h3>{city}</h3><p>{address}</p><a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a><small>Горячая линия</small></article>
          ))}
        </div>
      </div>
      <div className="footer-bottom"><span>© 2026 LUNE Studio</span><div><a href="/#top">Конфиденциальность</a><a href="/#top">Условия</a><a href="/#top">Instagram</a></div></div>
    </footer>
  );
}
