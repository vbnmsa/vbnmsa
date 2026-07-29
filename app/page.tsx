"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { addProduct, cartQuantity, readCart, writeCart } from "./cart-store";
import type { CartLine } from "./cart-store";
import { formatPrice, products } from "./catalog";
import { readFavorites, toggleFavorite } from "./favorites-store";

const faqs = [
  ["Где производится одежда LUNE?", "Коллекции создаются в московской студии LUNE и выпускаются небольшими партиями в специализированных ателье Москвы. Основные материалы поступают от партнёров из Копенгагена."],
  ["Как вы выбираете материалы?", "Мы работаем с копенгагенскими поставщиками натуральных волокон с прозрачным происхождением, переработанными материалами и сертифицированными фабриками. Каждая ткань выбирается за тактильность, долговечность и красивое старение."],
  ["Вы доставляете за границу?", "Да, мы отправляем заказы по всему миру. Стоимость и сроки рассчитываются при оформлении заказа."],
  ["Можно ли вернуть или обменять вещь?", "Неношеные изделия в первоначальном состоянии можно вернуть в течение 30 дней. Обмен производится бесплатно."],
];

function ArrowIcon() {
  return <span className="arrow-icon" aria-hidden="true" />;
}

function Button({ children, href, dark = false }: { children: React.ReactNode; href: string; dark?: boolean }) {
  return <a href={href} className={`btn ${dark ? "btn-dark" : "btn-light"}`}>{children}<ArrowIcon /></a>;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`reveal ${className}`}>{children}</div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [cartCount, setCartCount] = useState(0);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    const syncCart = () => {
      const lines = readCart();
      setCartLines(lines);
      setCartCount(cartQuantity(lines));
    };
    const syncFavorites = () => setFavorites(readFavorites());
    syncCart();
    syncFavorites();
    window.addEventListener("lune-cart-updated", syncCart);
    window.addEventListener("lune-favorites-updated", syncFavorites);
    return () => {
      observer.disconnect();
      window.removeEventListener("lune-cart-updated", syncCart);
      window.removeEventListener("lune-favorites-updated", syncFavorites);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  const searchResults = query.trim()
    ? products.filter((product) => {
        const value = query.toLowerCase();
        return product.name.toLowerCase().includes(value) || product.note.toLowerCase().includes(value) || product.keywords.some((word) => word.includes(value));
      })
    : [];

  function handleAdd(productId: string) {
    addProduct(productId);
  }

  function updateProduct(productId: string, delta: number) {
    const lines = readCart();
    const current = lines.find((line) => line.productId === productId);
    const quantity = (current?.quantity ?? 0) + delta;
    const next = quantity <= 0
      ? lines.filter((line) => line.productId !== productId)
      : current
        ? lines.map((line) => line.productId === productId ? { ...line, quantity } : line)
        : [...lines, { productId, quantity: 1 }];
    writeCart(next);
  }

  const productQuantity = (productId: string) =>
    cartLines.find((line) => line.productId === productId)?.quantity ?? 0;

  function chooseSearchResult(productId: string) {
    setSearchOpen(false);
    setQuery("");
    window.setTimeout(() => document.getElementById(productId)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  return (
    <main>
      <header className="site-header">
        <a href="#top" className="logo" aria-label="LUNE — главная">LUNE</a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <a href="#shop">Магазин</a><a href="#story">О бренде</a><a href="#process">Создание</a><a href="#journal">Отзывы</a><a href="#faq">FAQ</a>
        </nav>
        <div className="header-actions">
          <button aria-expanded={searchOpen} aria-controls="site-search" onClick={() => setSearchOpen(!searchOpen)}>Поиск</button>
          <a className="favorites-link" href="/favorites" aria-label={`Избранное: ${favorites.length}`}><span className="favorite-heart-outline" aria-hidden="true" /></a>
          <a href="/cart" aria-label={`Товаров в корзине: ${cartCount}`}>Корзина ({cartCount})</a>
          <button className="menu-btn" aria-expanded={menuOpen} aria-label="Открыть меню" onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        </div>
        <nav className={`mobile-nav ${menuOpen ? "open" : ""}`} aria-label="Мобильная навигация">
          {["Магазин", "О бренде", "Создание", "Отзывы", "FAQ"].map((item, i) => (
            <a key={item} href={["#shop", "#story", "#process", "#journal", "#faq"][i]} onClick={() => setMenuOpen(false)}>{item}</a>
          ))}
          <button onClick={() => { setSearchOpen(true); setMenuOpen(false); }}>Поиск</button>
          <a href="/favorites">Избранное ({favorites.length})</a>
          <a href="/cart">Корзина ({cartCount})</a>
        </nav>
        <div id="site-search" className={`search-panel ${searchOpen ? "open" : ""}`}>
          <div className="search-panel-inner">
            <label><span className="sr-only">Поиск по коллекции</span><input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Что вы ищете?" /></label>
            <button onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="Закрыть поиск">Закрыть</button>
          </div>
          {query && <div className="search-results">
            {searchResults.length ? searchResults.map((product) => (
              <button key={product.id} onClick={() => chooseSearchResult(product.id)}>
                <Image src={product.image} alt="" width={64} height={80} unoptimized />
                <span><strong>{product.name}</strong><small>{product.note}</small></span>
                <em>{formatPrice(product.price)}</em>
              </button>
            )) : <p>По вашему запросу ничего не найдено.</p>}
          </div>}
        </div>
      </header>

      <section id="top" className="hero">
        <Image src="/images/hero.jpg" alt="Модель в выразительном образе LUNE" fill priority unoptimized sizes="100vw" className="hero-image" />
        <div className="hero-overlay" />
        <div className="hero-copy reveal">
          <p className="eyebrow light-text">Осень / Зима 2026</p>
          <h1>Тихие формы.<br /><em>Долгое присутствие.</em></h1>
          <p className="hero-sub">Продуманные вещи сдержанного дизайна, созданные для красивой повседневной жизни.</p>
          <Button href="#shop">Смотреть коллекцию</Button>
        </div>
        <p className="hero-side">Москва · С 2018 года</p>
      </section>

      <section id="shop" className="section categories">
        <Reveal className="section-head">
          <div><p className="eyebrow">Выбор LUNE</p><h2>Для ваших<br /><em>ежедневных ритуалов.</em></h2></div>
          <p>Лаконичные силуэты с тихим характером. Вещи, которые хочется носить, помнить и выбирать снова.</p>
        </Reveal>
        <div className="category-grid stagger">
          {[["Новинки", "/images/category-new.jpg", "01"], ["Мягкий тейлоринг", "/images/category-tailoring.jpg", "02"], ["Трикотаж", "/images/category-knit.jpg", "03"]].map(([title, image, number]) => (
            <a href="#best-sellers" className="category-card reveal" key={title}>
              <div className="image-wrap"><Image src={image} alt={title} fill unoptimized sizes="(max-width: 700px) 100vw, 33vw" /></div>
              <div className="category-label"><span>{number}</span><h3>{title}</h3><ArrowIcon /></div>
            </a>
          ))}
        </div>
      </section>

      <section id="philosophy" className="manifesto">
        <Reveal><p className="eyebrow">Наш взгляд</p><p className="manifesto-copy">Мы верим, что лучший гардероб требует <em>меньшего</em> — меньше вещей, больше смысла и свобода от сезонов.</p></Reveal>
        <div className="principles stagger">
          {[["01", "Натуральные материалы", "Волокна, выбранные за тактильность, драпировку и способность красиво стареть."], ["02", "Продуманный дизайн", "Точные пропорции и выразительные детали. Ничего лишнего."], ["03", "Создано надолго", "Небольшие партии и долговечная конструкция вместо одноразовых трендов."]].map(([n, t, d]) => (
            <Reveal className="principle" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></Reveal>
          ))}
        </div>
      </section>

      <section id="best-sellers" className="section products">
        <Reveal className="section-head inline"><div><p className="eyebrow">Коллекция LUNE</p><h2>Вся одежда.</h2></div></Reveal>
        <div className="product-grid stagger">
          {products.map((product) => (
            <article id={product.id} className="product-card reveal" key={product.id}>
              <div className="image-wrap">
                <a className="product-card-link" href={`/product/${product.id}`} aria-label={`Открыть ${product.name}`}><Image src={product.image} alt={product.name} fill unoptimized sizes="(max-width: 700px) 50vw, 25vw" /></a>
                <button className={`card-favorite ${favorites.includes(product.id) ? "active" : ""}`} onClick={() => toggleFavorite(product.id)} aria-label={favorites.includes(product.id) ? `Удалить ${product.name} из избранного` : `Добавить ${product.name} в избранное`}>{favorites.includes(product.id) ? <span className="favorite-heart-solid" aria-hidden="true" /> : <span className="favorite-heart-outline" aria-hidden="true" />}</button>
                {productQuantity(product.id) > 0 ? (
                  <div className="product-counter">
                    <button onClick={() => updateProduct(product.id, -1)} aria-label={`Уменьшить количество ${product.name}`}>−</button>
                    <span>{productQuantity(product.id)}</span>
                    <button onClick={() => updateProduct(product.id, 1)} aria-label={`Увеличить количество ${product.name}`}>+</button>
                  </div>
                ) : <button className="quick-add" onClick={() => handleAdd(product.id)}>Добавить в корзину</button>}
              </div>
              <a href={`/product/${product.id}`} className="product-meta"><div><h3>{product.name}</h3><p>{product.note}</p></div><span>{formatPrice(product.price)}</span></a>
            </article>
          ))}
        </div>
      </section>

      <section id="story" className="story">
        <div className="story-image reveal"><Image src="/images/story.jpg" alt="Студия LUNE" fill unoptimized sizes="(max-width: 900px) 100vw, 50vw" /></div>
        <Reveal className="story-copy">
          <p className="eyebrow">История LUNE</p><h2>Исследование<br /><em>тихой уверенности.</em></h2>
          <p>LUNE появился в Москве с простой идеей: одежда может быть выразительной, не становясь громкой.</p>
          <p>В московской студии архитектура, движение и тактильная красота материалов из Копенгагена помогают нам создавать актуальный и долговечный гардероб.</p>
          <Button href="/philosophy" dark>Наша философия</Button>
        </Reveal>
      </section>

      <section id="process" className="section process">
        <Reveal className="section-head"><div><p className="eyebrow">От волокна к форме</p><h2>Медленно.<br /><em>Осознанно.</em></h2></div><p>Каждая вещь LUNE проходит через руки мастеров. Мы сопровождаем весь путь <span className="nowrap">— от первого</span> эскиза до финального стежка.</p></Reveal>
        <div className="process-gallery stagger">
          {[
            ["01", "Материал", "/images/process-material-silk.jpg", "Материал поступает в Москву от партнёров из Копенгагена. Мы проверяем происхождение и качество волокон, плотность полотна и устойчивость цвета. Только после тестов ткань отправляется в наше московское ателье."],
            ["02", "Форма", "/images/process-form-v2.jpg", "В московской студии конструктор переводит эскиз в точные лекала. Несколько макетов и примерок помогают найти пропорции, которые красиво выглядят и не ограничивают движение."],
            ["03", "Работа мастера", "/images/process-craft.jpg", "Детали раскраивают и соединяют вручную на специализированном оборудовании. Мастер контролирует натяжение нити, посадку и чистоту каждого шва."],
            ["04", "Завершение", "/images/process-finish-v2.jpg", "Готовое изделие отпаривают, измеряют и проверяют в московской студии при разном освещении. Только вещи безупречного качества получают финальную этикетку LUNE."],
          ].map(([n, title, image, description]) => (
            <Reveal className="process-card" key={n}>
              <div className="process-card-image"><Image src={image} alt={`${title} — этап производства LUNE`} fill unoptimized sizes="(max-width: 700px) 100vw, 50vw" /></div>
              <div className="process-card-copy"><span>{n}</span><h3>{title}</h3><p>{description}</p></div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="journal" className="reviews">
        <Reveal><p className="eyebrow">Говорят клиенты</p><h2 className="reviews-title">LUNE в мире</h2></Reveal>
        <div className="reviews-grid stagger">
          {[
            ["xxxxx", "Париж, Франция", "Пальто сидит безупречно и выглядит ещё лучше спустя сезон. Именно такой должна быть вещь надолго."],
            ["xxxxx", "Токио, Япония", "Минимум деталей, идеальная форма и очень приятная ткань. Получаю комплименты каждый раз, когда надеваю."],
            ["xxxxx", "Берлин, Германия", "Брюки стали основой гардероба: подходят и для работы, и для вечера. Доставка была быстрой и аккуратной."],
            ["xxxxx", "Сеул, Южная Корея", "Редкое сочетание комфорта и архитектурного силуэта. Качество обработки заметно в каждой детали."],
          ].map(([name, location, text]) => (
            <Reveal className="review-card" key={location}><div className="stars" aria-label="5 из 5 звёзд">★★★★★</div><p>«{text}»</p><div><strong>{name}</strong><span>{location}</span></div></Reveal>
          ))}
        </div>
        <div className="review-stats reveal"><span>4,9 / 5</span><a href="/reviews">Подробнее</a></div>
      </section>

      <section id="faq" className="section faq">
        <Reveal><p className="eyebrow">Помощь клиентам</p><h2>Вопросы<br /><em>и ответы.</em></h2></Reveal>
        <div className="faq-list">
          {faqs.map(([q, a], i) => (
            <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={q}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}><span>{String(i + 1).padStart(2, "0")}</span><strong>{q}</strong><i>+</i></button>
              <div className="faq-answer"><p>{a}</p></div>
            </div>
          ))}
          <div className="faq-support"><span>05</span><div><strong>Другое</strong><p>Не нашли ответ? Перейдите на страницу поддержки.</p></div><a className="faq-support-arrow" href="/support" aria-label="Открыть страницу поддержки"><ArrowIcon /></a></div>
        </div>
      </section>

    </main>
  );
}
