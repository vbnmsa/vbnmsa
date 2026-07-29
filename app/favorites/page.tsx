"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice, products } from "../catalog";
import { readFavorites, toggleFavorite } from "../favorites-store";
import { CompactHeader } from "../components/CompactHeader";

export default function FavoritesPage() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(readFavorites());
    sync();
    window.addEventListener("lune-favorites-updated", sync);
    return () => window.removeEventListener("lune-favorites-updated", sync);
  }, []);

  const favorites = products.filter((product) => ids.includes(product.id));

  return (
    <main className="favorites-page">
      <CompactHeader backLabel="Продолжить покупки" />
      <section className="favorites-shell">
        <p className="eyebrow">Сохранённые вещи</p><h1>Избранное</h1>
        {favorites.length ? <div className="favorites-grid">{favorites.map((product) => (
          <article key={product.id}><a href={`/product/${product.id}`}><div><Image src={product.image} alt={product.name} fill unoptimized sizes="(max-width: 700px) 50vw, 25vw" /></div><h2>{product.name}</h2><p>{product.note}</p><strong>{formatPrice(product.price)}</strong></a><button onClick={() => toggleFavorite(product.id)}>Удалить</button></article>
        ))}</div> : <div className="empty-cart"><h2>Список пока пуст</h2><p>Нажмите на сердечко у понравившегося товара.</p><a className="btn btn-dark" href="/#best-sellers">Смотреть коллекцию <span className="arrow-icon" aria-hidden="true" /></a></div>}
      </section>
    </main>
  );
}
