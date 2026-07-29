export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  note: string;
  keywords: string[];
  description: string;
  color: string;
  article: string;
  sizes: number[];
  unavailableSize: number;
};

export const products: Product[] = [
  {
    id: "sculpted-coat",
    name: "Скульптурное пальто",
    price: 42000,
    image: "/images/product-coat.jpg",
    note: "Шерсть и кашемир",
    keywords: ["пальто", "верхняя одежда", "шерсть", "кашемир", "coat"],
    description: "Архитектурное двубортное пальто с мягкой линией плеча. Плотная итальянская шерсть дополнена кашемиром, а подкладка из вискозы обеспечивает комфорт в движении.",
    color: "Тёплый песочный",
    article: "LN-CO-001",
    sizes: [40, 42, 44, 46, 48, 50],
    unavailableSize: 46,
  },
  {
    id: "column-dress",
    name: "Струящееся платье",
    price: 26000,
    image: "/images/product-dress.jpg",
    note: "Смесовый шёлк",
    keywords: ["платье", "шёлк", "шелк", "вечернее", "dress"],
    description: "Струящееся платье прямого силуэта с деликатной драпировкой. Материал мягко отражает свет и сохраняет форму в течение всего дня.",
    color: "Глубокий графит",
    article: "LN-DR-002",
    sizes: [40, 42, 44, 46, 48],
    unavailableSize: 44,
  },
  {
    id: "architect-trouser",
    name: "Брюки Architect",
    price: 19000,
    image: "/images/product-trouser.jpg",
    note: "Итальянская шерсть",
    keywords: ["брюки", "штаны", "шерсть", "костюм", "trouser"],
    description: "Брюки свободного кроя с высокой посадкой и точными защипами. Итальянская шерсть держит линию и остаётся комфортной в течение дня.",
    color: "Угольный",
    article: "LN-TR-003",
    sizes: [40, 42, 44, 46, 48, 50],
    unavailableSize: 48,
  },
  {
    id: "structure-knit",
    name: "Джемпер Soft Structure",
    price: 17000,
    image: "/images/product-knit.jpg",
    note: "Мериносовая шерсть",
    keywords: ["джемпер", "свитер", "трикотаж", "шерсть", "knit"],
    description: "Объёмный джемпер из тонкой мериносовой шерсти. Мягкая структура, спущенное плечо и выверенная длина создают спокойный современный силуэт.",
    color: "Молочный",
    article: "LN-KN-004",
    sizes: [40, 42, 44, 46, 48],
    unavailableSize: 42,
  },
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("ru-RU").format(price) + " ₽";
