"use client";

export type CartLine = { productId: string; quantity: number; size?: number };

const CART_KEY = "lune-cart";

export function readCart(): CartLine[] {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("lune-cart-updated"));
}

export function addProduct(productId: string, size?: number) {
  const lines = readCart();
  const existing = lines.find((line) => line.productId === productId);
  if (existing) {
    existing.quantity += 1;
    if (size) existing.size = size;
  } else lines.push({ productId, quantity: 1, size });
  writeCart(lines);
}

export function cartQuantity(lines = readCart()) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}
