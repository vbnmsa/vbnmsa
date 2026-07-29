"use client";

import { useEffect, useState } from "react";
import { cartQuantity, readCart } from "../cart-store";
import { readFavorites } from "../favorites-store";

export function CompactHeader({ backHref = "/#best-sellers", backLabel = "К коллекции" }: { backHref?: string; backLabel?: string }) {
  const [cartCount, setCartCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const syncCart = () => setCartCount(cartQuantity(readCart()));
    const syncFavorites = () => setFavoriteCount(readFavorites().length);
    syncCart();
    syncFavorites();
    window.addEventListener("lune-cart-updated", syncCart);
    window.addEventListener("lune-favorites-updated", syncFavorites);
    return () => {
      window.removeEventListener("lune-cart-updated", syncCart);
      window.removeEventListener("lune-favorites-updated", syncFavorites);
    };
  }, []);

  return (
    <header className="site-header product-header">
      <a href="/" className="logo" aria-label="LUNE — главная">LUNE</a>
      <a className="back-link" href={backHref}>← {backLabel}</a>
      <div className="header-actions">
        <a className="favorites-link" href="/favorites" aria-label={`Избранное: ${favoriteCount}`}><span className="favorite-heart-outline" aria-hidden="true" /></a>
        <a href="/cart">Корзина ({cartCount})</a>
      </div>
    </header>
  );
}
