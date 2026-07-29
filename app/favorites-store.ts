"use client";

const FAVORITES_KEY = "lune-favorites";

export function readFavorites(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeFavorites(ids: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("lune-favorites-updated"));
}

export function toggleFavorite(productId: string) {
  const ids = readFavorites();
  writeFavorites(ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId]);
}
