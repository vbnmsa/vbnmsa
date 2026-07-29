"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { readCart, writeCart } from "../cart-store";
import type { CartLine } from "../cart-store";
import { formatPrice, products } from "../catalog";

type CourierDetails = {
  fullName: string;
  phone: string;
  address: string;
};

function addBusinessDays(start: Date, days: number) {
  const date = new Date(start);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) added += 1;
  }
  return date;
}

function deliveryRoute(address: string, today: Date | null) {
  if (!today || address.trim().length < 4) return null;
  const value = address.toLowerCase();
  const isRussia = /росси|russia|моск|moscow|петербург|казан|сочи|екатеринбург|новосибирск|самар|нижн/.test(value);
  const isDenmark = /дани|denmark|копенгаген|copenhagen/.test(value);
  const isEurope = /франц|france|париж|paris|герман|germany|берлин|berlin|итал|italy|милан|milan|испан|spain|португал|portugal|серби|serbia|австри|austria|нидерланд|netherlands|бельги|belgium|швец|sweden|норвег|norway|финлянд|finland|польш|poland|чех|czech|швейцар|switzerland|европ|europe/.test(value);
  const route = isRussia
    ? { origin: "Москва · LUNE Studio", minDays: 1, maxDays: 3 }
    : isDenmark
      ? { origin: "Копенгаген · LUNE Partner Hub", minDays: 1, maxDays: 2 }
      : isEurope
        ? { origin: "Копенгаген · LUNE Partner Hub", minDays: 3, maxDays: 5 }
        : { origin: "Копенгаген · LUNE Partner Hub", minDays: 6, maxDays: 9 };
  const formatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });
  return {
    ...route,
    dates: `${formatter.format(addBusinessDays(today, route.minDays))} — ${formatter.format(addBusinessDays(today, route.maxDays))}`,
  };
}

export default function CartPage() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [delivery, setDelivery] = useState<"pickup" | "courier">("pickup");
  const [today, setToday] = useState<Date | null>(null);
  const [courier, setCourier] = useState<CourierDetails>({ fullName: "", phone: "", address: "" });

  useEffect(() => {
    setLines(readCart());
    setToday(new Date());
  }, []);

  const items = useMemo(() => lines.map((line) => ({
    ...line,
    product: products.find((product) => product.id === line.productId),
  })).filter((line) => line.product), [lines]);

  const subtotal = items.reduce((total, item) => total + (item.product?.price ?? 0) * item.quantity, 0);
  const deliveryPrice = delivery === "courier" && subtotal > 0 ? 900 : 0;
  const route = useMemo(() => deliveryRoute(courier.address, today), [courier.address, today]);
  const courierReady = courier.fullName.trim().length >= 5 && courier.phone.replace(/\D/g, "").length >= 7 && courier.address.trim().length >= 8;
  const canCheckout = delivery === "pickup" || courierReady;

  function updateCourier(field: keyof CourierDetails, value: string) {
    setCourier((current) => ({ ...current, [field]: value }));
  }

  function updateQuantity(productId: string, quantity: number) {
    const next = quantity <= 0 ? lines.filter((line) => line.productId !== productId) : lines.map((line) => line.productId === productId ? { ...line, quantity } : line);
    setLines(next);
    writeCart(next);
  }

  function handleCheckout() {
    if (!canCheckout) return;
    setLines([]);
    writeCart([]);
    window.location.assign("/order-success");
  }

  return (
    <main className="cart-page">
      <header className="site-header cart-header">
        <a href="/" className="logo" aria-label="LUNE — главная">LUNE</a>
        <a className="back-link" href="/#best-sellers">← Продолжить покупки</a>
      </header>
      <section className="cart-shell">
        <div className="cart-title"><p className="eyebrow">Ваш выбор</p><h1>Корзина</h1><span>{lines.reduce((sum, line) => sum + line.quantity, 0)} товара</span></div>
        {items.length ? (
          <div className="cart-layout">
            <div className="cart-list">
              {items.map(({ product, quantity, size }) => product && (
                <article className="cart-item" key={product.id}>
                  <div className="cart-item-image"><Image src={product.image} alt={product.name} fill unoptimized sizes="160px" /></div>
                  <div className="cart-item-info"><div><h2>{product.name}</h2><p>{product.note}</p><dl className="cart-item-details"><div><dt>Размер</dt><dd>{size ?? product.sizes.find((value) => value !== product.unavailableSize)}</dd></div><div><dt>Цвет</dt><dd>{product.color}</dd></div><div><dt>Артикул</dt><dd>{product.article}</dd></div></dl></div>
                    <div className="quantity-control" aria-label={`Количество: ${product.name}`}>
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="Уменьшить количество">−</button><span>{quantity}</span><button onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="Увеличить количество">+</button>
                    </div>
                    <button className="remove-item" onClick={() => updateQuantity(product.id, 0)}>Удалить</button>
                  </div>
                  <strong>{formatPrice(product.price * quantity)}</strong>
                </article>
              ))}
            </div>
            <aside className="cart-summary">
              <p className="eyebrow">Доставка</p>
              <div className="delivery-options">
                <label className={delivery === "pickup" ? "selected" : ""}><input type="radio" name="delivery" checked={delivery === "pickup"} onChange={() => setDelivery("pickup")} /><span><strong>Самовывоз</strong><small>Из бутика LUNE · Бесплатно</small></span><em>0 ₽</em></label>
                <label className={delivery === "courier" ? "selected" : ""}><input type="radio" name="delivery" checked={delivery === "courier"} onChange={() => setDelivery("courier")} /><span><strong>Курьер</strong><small>{route ? `${route.origin} · ${route.minDays}–${route.maxDays} рабочих дней` : "По вашему адресу · срок после ввода города"}</small></span><em>900 ₽</em></label>
              </div>
              {delivery === "courier" && (
                <div className="courier-request">
                  <p className="courier-request-title">Заявка на курьерскую доставку</p>
                  <label><span>ФИО получателя</span><input value={courier.fullName} onChange={(event) => updateCourier("fullName", event.target.value)} autoComplete="name" placeholder="Иван Иванов" /></label>
                  <label><span>Телефон</span><input value={courier.phone} onChange={(event) => updateCourier("phone", event.target.value)} autoComplete="tel" inputMode="tel" type="tel" placeholder="+7 (___) ___-__-__" /></label>
                  <label><span>Адрес доставки</span><textarea value={courier.address} onChange={(event) => updateCourier("address", event.target.value)} autoComplete="street-address" placeholder="Город, улица, дом, квартира, страна" rows={3} /></label>
                  {route ? (
                    <div className="delivery-estimate" aria-live="polite"><span>Отправление</span><strong>{route.origin}</strong><p>Ориентировочная доставка: {route.dates}. Срок рассчитан в рабочих днях.</p></div>
                  ) : <p className="delivery-hint">Введите город и страну — мы автоматически выберем склад в Москве или Копенгагене и рассчитаем срок.</p>}
                </div>
              )}
              <div className="summary-lines"><p><span>Товары</span><strong>{formatPrice(subtotal)}</strong></p><p><span>Доставка</span><strong>{deliveryPrice ? formatPrice(deliveryPrice) : "Бесплатно"}</strong></p></div>
              <div className="summary-total"><span>Итого</span><strong>{formatPrice(subtotal + deliveryPrice)}</strong></div>
              <button className="checkout-button" disabled={!canCheckout} onClick={handleCheckout}>{delivery === "courier" && !courierReady ? "Заполните данные доставки" : "Оформить заказ"} <span className="arrow-icon" aria-hidden="true" /></button>
              <p className="secure-note">Безопасное оформление · Возврат в течение 30 дней</p>
            </aside>
          </div>
        ) : (
          <div className="empty-cart"><h2>Здесь пока ничего нет</h2><p>Добавьте вещи из коллекции, и они появятся в вашей корзине.</p><a className="btn btn-dark" href="/#best-sellers">Смотреть коллекцию <span className="arrow-icon" aria-hidden="true" /></a></div>
        )}
      </section>
    </main>
  );
}
