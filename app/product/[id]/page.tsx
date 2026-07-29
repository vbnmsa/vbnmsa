"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addProduct } from "../../cart-store";
import { formatPrice, products } from "../../catalog";
import { readFavorites, toggleFavorite } from "../../favorites-store";
import { CompactHeader } from "../../components/CompactHeader";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const product = products.find((item) => item.id === params.id);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [noticeSent, setNoticeSent] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState("size");

  useEffect(() => {
    if (product) setFavorite(readFavorites().includes(product.id));
  }, [product]);

  const related = useMemo(() => products.filter((item) => item.id !== product?.id).slice(0, 3), [product]);
  const careDetails: Record<string, string> = {
    "sculpted-coat": "Состав: 80% натуральная шерсть, 15% кашемир, 5% полиамид; подкладка — 100% вискоза. Рекомендуется профессиональная деликатная химчистка. Не стирать, не отбеливать и не сушить в машине. После носки проветривайте изделие на широких плечиках, храните в дышащем чехле вдали от прямого света. Небольшие заломы допустимо отпаривать с расстояния на минимальной температуре.",
    "column-dress": "Состав: 72% вискоза, 28% натуральный шёлк. Деликатная профессиональная химчистка предпочтительна. При ручном уходе используйте прохладную воду до 30 °C и нейтральное средство для шёлка, не замачивайте и не выкручивайте ткань. Сушите горизонтально вдали от солнца и нагревательных приборов. Гладьте с изнаночной стороны при низкой температуре через тонкую ткань. Храните на мягких плечиках, чтобы сохранить драпировку.",
    "architect-trouser": "Состав: 96% итальянская шерсть, 4% эластан; подкладка карманов — 100% хлопок. Рекомендуется деликатная химчистка. Между носками давайте изделию отдохнуть не менее суток и храните брюки на вешалке с зажимами. Не стирать в машине, не отбеливать и не сушить в барабане. Локальные заломы расправляйте паром без прямого контакта утюга с тканью.",
    "structure-knit": "Состав: 100% тонкая мериносовая шерсть. Ручная стирка в прохладной воде до 30 °C со средством для шерсти, без замачивания и трения. Аккуратно удалите влагу через полотенце, не выкручивая изделие. Сушите только горизонтально, придав первоначальную форму. Не отбеливать и не сушить в машине. Храните в сложенном виде; для защиты натурального волокна используйте средство от моли.",
  };

  if (!product) {
    return <main className="product-page"><CompactHeader /><div className="empty-cart"><h2>Товар не найден</h2><a className="btn btn-dark" href="/#best-sellers">Вернуться к коллекции <span className="arrow-icon" aria-hidden="true" /></a></div></main>;
  }

  const unavailable = selectedSize === product.unavailableSize;

  function handleFavorite() {
    toggleFavorite(product!.id);
    setFavorite((value) => !value);
  }

  return (
    <main className="product-page">
      <CompactHeader />
      <section className="product-detail">
        <div className="product-gallery">
          <div className="product-thumbs">
            {[0, 1, 2].map((item) => <button className={item === 0 ? "active" : ""} key={item}><Image src={product.image} alt="" fill unoptimized sizes="76px" style={{ objectPosition: `${50 + item * 12}% center` }} /></button>)}
          </div>
          <div className="product-main-image"><Image src={product.image} alt={product.name} fill priority unoptimized sizes="(max-width: 900px) 100vw, 55vw" /></div>
        </div>
        <aside className="product-info">
          <p className="eyebrow">Коллекция LUNE</p>
          <h1>{product.name}</h1>
          <p className="product-note">{product.note}</p>
          <strong className="product-price">{formatPrice(product.price)}</strong>
          <p className="product-description">{product.description}</p>
          <ul className="product-specs"><li>Цвет: {product.color}</li><li>Артикул: {product.article}</li><li>Создано в Москве</li><li>Материал из Копенгагена</li></ul>

          <div className="size-heading"><strong>Выберите российский размер</strong><a href="#size-guide">Таблица размеров</a></div>
          <div className="size-row">
            {product.sizes.map((size) => <button key={size} className={`${selectedSize === size ? "selected" : ""} ${size === product.unavailableSize ? "unavailable" : ""}`} onClick={() => { setSelectedSize(size); setNoticeSent(false); }}>{size}</button>)}
          </div>
          <button className={`product-action ${unavailable ? "notify" : ""}`} disabled={!selectedSize} onClick={() => unavailable ? setNoticeSent(true) : addProduct(product.id, selectedSize ?? undefined)}>
            {!selectedSize ? "Выберите размер" : unavailable ? (noticeSent ? "Запрос принят" : "Уведомить о появлении") : "Добавить в корзину"}
          </button>
          <button className={`product-favorite-button ${favorite ? "active" : ""}`} onClick={handleFavorite}>{favorite ? "В избранном" : "В избранное"} <span className={favorite ? "favorite-heart-solid" : "favorite-heart-outline"} aria-hidden="true" /></button>

          <div className="store-availability"><h2>Наличие в магазинах</h2><p><span>Москва · LUNE Studio</span><strong>В наличии</strong></p><p><span>Париж · Marais</span><strong>В наличии</strong></p><p><span>Милан · Brera</span><em>Под заказ</em></p></div>

          <div id="size-guide" className="detail-accordions">
            <div className={detailsOpen === "size" ? "open" : ""}><button onClick={() => setDetailsOpen(detailsOpen === "size" ? "" : "size")}><span>Размер и посадка</span><i>{detailsOpen === "size" ? "−" : "+"}</i></button><div className="accordion-content"><p>Модель соответствует российской размерной сетке. Если вы между размерами, выберите больший для более свободной посадки.</p><table><thead><tr><th>RU</th><th>Грудь</th><th>Талия</th><th>Бёдра</th></tr></thead><tbody><tr><td>40</td><td>80</td><td>62</td><td>88</td></tr><tr><td>42</td><td>84</td><td>66</td><td>92</td></tr><tr><td>44</td><td>88</td><td>70</td><td>96</td></tr><tr><td>46</td><td>92</td><td>74</td><td>100</td></tr><tr><td>48</td><td>96</td><td>78</td><td>104</td></tr></tbody></table></div></div>
            {[["delivery", "Доставка и возврат", "Доставка по всему миру. Бесплатный возврат неношеных изделий доступен в течение 30 дней."], ["care", "Состав и уход", careDetails[product.id] ?? `${product.note}. Следуйте рекомендациям на внутренней этикетке изделия.`]].map(([id, title, text]) => (
              <div className={detailsOpen === id ? "open" : ""} key={id}><button onClick={() => setDetailsOpen(detailsOpen === id ? "" : id)}><span>{title}</span><i>{detailsOpen === id ? "−" : "+"}</i></button><div className="accordion-content"><p>{text}</p></div></div>
            ))}
          </div>
        </aside>
      </section>

      <section className="related-products">
        <p className="eyebrow">Продолжить выбор</p><h2>Похожие товары</h2>
        <div className="related-grid">
          {related.map((item) => <a href={`/product/${item.id}`} className="related-card" key={item.id}><div><Image src={item.image} alt={item.name} fill unoptimized sizes="(max-width: 700px) 100vw, 33vw" /></div><h3>{item.name}</h3><p>{item.note}</p><strong>{formatPrice(item.price)}</strong></a>)}
        </div>
      </section>
    </main>
  );
}
