"use client";

import { useEffect } from "react";
import generatedTranslations from "./generated-translations.json";

export type LanguageCode = "ru" | "en" | "zh" | "pt" | "sr" | "es" | "ar" | "de";

export const languages: { code: LanguageCode; name: string; short: string }[] = [
  { code: "ru", name: "Русский", short: "RU" },
  { code: "en", name: "English", short: "EN" },
  { code: "zh", name: "中文", short: "中文" },
  { code: "pt", name: "Português", short: "PT" },
  { code: "sr", name: "Српски", short: "SR" },
  { code: "es", name: "Español", short: "ES" },
  { code: "ar", name: "العربية", short: "AR" },
  { code: "de", name: "Deutsch", short: "DE" },
];

const LANGUAGE_KEY = "lune-language";
const LOCATION_KEY = "lune-location-requested";

type TranslationRow = Partial<Record<LanguageCode, string>>;

const rows: Record<string, TranslationRow> = {
  "Магазин": { en: "Shop", zh: "商店", pt: "Loja", sr: "Продавница", es: "Tienda", ar: "المتجر", de: "Shop" },
  "О бренде": { en: "About", zh: "品牌故事", pt: "Sobre", sr: "О бренду", es: "La marca", ar: "عن العلامة", de: "Über uns" },
  "Создание": { en: "Making", zh: "制作", pt: "Produção", sr: "Израда", es: "Creación", ar: "التصنيع", de: "Herstellung" },
  "Отзывы": { en: "Reviews", zh: "评价", pt: "Avaliações", sr: "Рецензије", es: "Opiniones", ar: "الآراء", de: "Bewertungen" },
  "Поиск": { en: "Search", zh: "搜索", pt: "Pesquisar", sr: "Претрага", es: "Buscar", ar: "بحث", de: "Suche" },
  "Избранное": { en: "Favorites", zh: "收藏", pt: "Favoritos", sr: "Омиљено", es: "Favoritos", ar: "المفضلة", de: "Favoriten" },
  "Корзина": { en: "Bag", zh: "购物袋", pt: "Sacola", sr: "Корпа", es: "Bolsa", ar: "الحقيبة", de: "Tasche" },
  "Закрыть": { en: "Close", zh: "关闭", pt: "Fechar", sr: "Затвори", es: "Cerrar", ar: "إغلاق", de: "Schließen" },
  "Что вы ищете?": { en: "What are you looking for?", zh: "您在寻找什么？", pt: "O que procura?", sr: "Шта тражите?", es: "¿Qué buscas?", ar: "ما الذي تبحث عنه؟", de: "Wonach suchen Sie?" },
  "Осень / Зима 2026": { en: "Autumn / Winter 2026", zh: "2026 秋冬", pt: "Outono / Inverno 2026", sr: "Јесен / Зима 2026", es: "Otoño / Invierno 2026", ar: "خريف / شتاء 2026", de: "Herbst / Winter 2026" },
  "Тихие формы.": { en: "Quiet forms.", zh: "静谧廓形。", pt: "Formas serenas.", sr: "Тихе форме.", es: "Formas serenas.", ar: "أشكال هادئة.", de: "Stille Formen." },
  "Долгое присутствие.": { en: "A lasting presence.", zh: "恒久存在。", pt: "Presença duradoura.", sr: "Трајно присуство.", es: "Presencia duradera.", ar: "حضور دائم.", de: "Bleibende Präsenz." },
  "Смотреть коллекцию": { en: "View the collection", zh: "查看系列", pt: "Ver coleção", sr: "Погледај колекцију", es: "Ver colección", ar: "عرض المجموعة", de: "Kollektion ansehen" },
  "Новинки": { en: "New arrivals", zh: "新品", pt: "Novidades", sr: "Новитети", es: "Novedades", ar: "وصل حديثاً", de: "Neuheiten" },
  "Вся одежда": { en: "All clothing", zh: "全部服装", pt: "Todas as peças", sr: "Сва одећа", es: "Toda la ropa", ar: "كل الملابس", de: "Alle Kleidung" },
  "Вся одежда.": { en: "All clothing.", zh: "全部服装。", pt: "Todas as peças.", sr: "Сва одећа.", es: "Toda la ropa.", ar: "كل الملابس.", de: "Alle Kleidung." },
  "Наша философия": { en: "Our philosophy", zh: "我们的理念", pt: "Nossa filosofia", sr: "Наша филозофија", es: "Nuestra filosofía", ar: "فلسفتنا", de: "Unsere Philosophie" },
  "История LUNE": { en: "The LUNE story", zh: "LUNE 故事", pt: "A história LUNE", sr: "Прича LUNE", es: "La historia de LUNE", ar: "قصة LUNE", de: "Die LUNE Geschichte" },
  "От волокна к форме": { en: "From fibre to form", zh: "从纤维到廓形", pt: "Da fibra à forma", sr: "Од влакна до форме", es: "De la fibra a la forma", ar: "من الألياف إلى الشكل", de: "Von der Faser zur Form" },
  "Материал": { en: "Material", zh: "面料", pt: "Material", sr: "Материјал", es: "Material", ar: "الخامة", de: "Material" },
  "Форма": { en: "Form", zh: "廓形", pt: "Forma", sr: "Форма", es: "Forma", ar: "الشكل", de: "Form" },
  "Работа мастера": { en: "Craftsmanship", zh: "匠人工艺", pt: "Trabalho artesanal", sr: "Рад мајстора", es: "Trabajo artesanal", ar: "حرفة الصانع", de: "Handwerkskunst" },
  "Завершение": { en: "Finishing", zh: "完成", pt: "Finalização", sr: "Завршетак", es: "Acabado", ar: "اللمسات الأخيرة", de: "Vollendung" },
  "Говорят клиенты": { en: "Client voices", zh: "客户评价", pt: "Opiniões dos clientes", sr: "Утисци клијената", es: "Nuestros clientes", ar: "آراء العملاء", de: "Kundenstimmen" },
  "LUNE в мире": { en: "LUNE worldwide", zh: "LUNE 在世界", pt: "LUNE no mundo", sr: "LUNE у свету", es: "LUNE en el mundo", ar: "LUNE حول العالم", de: "LUNE weltweit" },
  "Подробнее": { en: "Discover more", zh: "了解更多", pt: "Saiba mais", sr: "Сазнај више", es: "Más información", ar: "اكتشف المزيد", de: "Mehr erfahren" },
  "Вопросы и ответы": { en: "Questions & answers", zh: "常见问题", pt: "Perguntas e respostas", sr: "Питања и одговори", es: "Preguntas y respuestas", ar: "الأسئلة والأجوبة", de: "Fragen & Antworten" },
  "Есть вопросы?": { en: "Any questions?", zh: "还有问题？", pt: "Tem dúvidas?", sr: "Имате питања?", es: "¿Tienes preguntas?", ar: "هل لديك أسئلة؟", de: "Noch Fragen?" },
  "Коллекции": { en: "Collections", zh: "系列", pt: "Coleções", sr: "Колекције", es: "Colecciones", ar: "المجموعات", de: "Kollektionen" },
  "Помощь": { en: "Help", zh: "帮助", pt: "Ajuda", sr: "Помоћ", es: "Ayuda", ar: "المساعدة", de: "Hilfe" },
  "Компания": { en: "Company", zh: "公司", pt: "Empresa", sr: "Компанија", es: "Empresa", ar: "الشركة", de: "Unternehmen" },
  "О LUNE": { en: "About LUNE", zh: "关于 LUNE", pt: "Sobre a LUNE", sr: "О LUNE", es: "Sobre LUNE", ar: "عن LUNE", de: "Über LUNE" },
  "Новости": { en: "News", zh: "新闻", pt: "Notícias", sr: "Новости", es: "Noticias", ar: "الأخبار", de: "Neuigkeiten" },
  "Инвесторы": { en: "Investors", zh: "投资者", pt: "Investidores", sr: "Инвеститори", es: "Inversores", ar: "المستثمرون", de: "Investoren" },
  "Доставка и возврат": { en: "Delivery & returns", zh: "配送与退货", pt: "Entrega e devoluções", sr: "Достава и поврат", es: "Envíos y devoluciones", ar: "التوصيل والإرجاع", de: "Versand & Rückgabe" },
  "Связаться": { en: "Contact", zh: "联系我们", pt: "Contato", sr: "Контакт", es: "Contacto", ar: "اتصل بنا", de: "Kontakt" },
  "Магазины": { en: "Stores", zh: "门店", pt: "Lojas", sr: "Продавнице", es: "Tiendas", ar: "المتاجر", de: "Geschäfte" },
  "Журнал LUNE": { en: "LUNE journal", zh: "LUNE 杂志", pt: "Revista LUNE", sr: "LUNE журнал", es: "Diario LUNE", ar: "مجلة LUNE", de: "LUNE Journal" },
  "Электронная почта": { en: "Email address", zh: "电子邮箱", pt: "E-mail", sr: "Е-пошта", es: "Correo electrónico", ar: "البريد الإلكتروني", de: "E-Mail-Adresse" },
  "Горячая линия": { en: "Hotline", zh: "热线", pt: "Linha direta", sr: "Телефонска линија", es: "Línea directa", ar: "الخط الساخن", de: "Hotline" },
  "Конфиденциальность": { en: "Privacy", zh: "隐私", pt: "Privacidade", sr: "Приватност", es: "Privacidad", ar: "الخصوصية", de: "Datenschutz" },
  "Условия": { en: "Terms", zh: "条款", pt: "Termos", sr: "Услови", es: "Condiciones", ar: "الشروط", de: "Bedingungen" },
  "Ваш выбор": { en: "Your selection", zh: "您的选择", pt: "Sua seleção", sr: "Ваш избор", es: "Tu selección", ar: "اختيارك", de: "Ihre Auswahl" },
  "Продолжить покупки": { en: "Continue shopping", zh: "继续购物", pt: "Continuar comprando", sr: "Настави куповину", es: "Seguir comprando", ar: "متابعة التسوق", de: "Weiter einkaufen" },
  "Размер": { en: "Size", zh: "尺码", pt: "Tamanho", sr: "Величина", es: "Talla", ar: "المقاس", de: "Größe" },
  "Цвет": { en: "Colour", zh: "颜色", pt: "Cor", sr: "Боја", es: "Color", ar: "اللون", de: "Farbe" },
  "Артикул": { en: "Item code", zh: "货号", pt: "Referência", sr: "Шифра", es: "Referencia", ar: "رمز المنتج", de: "Artikelnummer" },
  "Удалить": { en: "Remove", zh: "移除", pt: "Remover", sr: "Уклони", es: "Eliminar", ar: "إزالة", de: "Entfernen" },
  "Доставка": { en: "Delivery", zh: "配送", pt: "Entrega", sr: "Достава", es: "Entrega", ar: "التوصيل", de: "Lieferung" },
  "Самовывоз": { en: "Store pickup", zh: "门店自取", pt: "Retirada na loja", sr: "Преузимање", es: "Recogida en tienda", ar: "الاستلام من المتجر", de: "Abholung" },
  "Курьер": { en: "Courier", zh: "快递", pt: "Estafeta", sr: "Курир", es: "Mensajería", ar: "مندوب", de: "Kurier" },
  "Товары": { en: "Products", zh: "商品", pt: "Produtos", sr: "Производи", es: "Productos", ar: "المنتجات", de: "Produkte" },
  "Бесплатно": { en: "Free", zh: "免费", pt: "Grátis", sr: "Бесплатно", es: "Gratis", ar: "مجاناً", de: "Kostenlos" },
  "Итого": { en: "Total", zh: "总计", pt: "Total", sr: "Укупно", es: "Total", ar: "الإجمالي", de: "Gesamt" },
  "Оформить заказ": { en: "Checkout", zh: "结账", pt: "Finalizar compra", sr: "Наручи", es: "Finalizar pedido", ar: "إتمام الطلب", de: "Zur Kasse" },
  "Коллекция LUNE": { en: "LUNE collection", zh: "LUNE 系列", pt: "Coleção LUNE", sr: "LUNE колекција", es: "Colección LUNE", ar: "مجموعة LUNE", de: "LUNE Kollektion" },
  "Выберите российский размер": { en: "Select Russian size", zh: "选择俄罗斯尺码", pt: "Selecione o tamanho russo", sr: "Изаберите руску величину", es: "Selecciona la talla rusa", ar: "اختر المقاس الروسي", de: "Russische Größe wählen" },
  "Добавить в корзину": { en: "Add to bag", zh: "加入购物袋", pt: "Adicionar à sacola", sr: "Додај у корпу", es: "Añadir a la bolsa", ar: "أضف إلى الحقيبة", de: "In die Tasche" },
  "Состав и уход": { en: "Composition & care", zh: "成分与护理", pt: "Composição e cuidados", sr: "Састав и одржавање", es: "Composición y cuidados", ar: "التركيب والعناية", de: "Material & Pflege" },
  "Похожие товары": { en: "You may also like", zh: "猜你喜欢", pt: "Também pode gostar", sr: "Слични производи", es: "También te puede gustar", ar: "قد يعجبك أيضاً", de: "Das könnte Ihnen gefallen" },
  "Выбор языка": { en: "Choose your language", zh: "选择语言", pt: "Escolha o idioma", sr: "Изаберите језик", es: "Elige tu idioma", ar: "اختر لغتك", de: "Sprache wählen" },
  "Назад": { en: "Back", zh: "返回", pt: "Voltar", sr: "Назад", es: "Volver", ar: "رجوع", de: "Zurück" },
};

export function getStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return "ru";
  const value = localStorage.getItem(LANGUAGE_KEY) as LanguageCode | null;
  return languages.some((language) => language.code === value) ? value! : "ru";
}

export function setStoredLanguage(code: LanguageCode) {
  localStorage.setItem(LANGUAGE_KEY, code);
}

export function languageDisplayName(code: LanguageCode, displayLanguage: LanguageCode) {
  try {
    const displayNames = new Intl.DisplayNames([displayLanguage], { type: "language" });
    const value = displayNames.of(code) ?? languages.find((language) => language.code === code)?.name ?? code;
    return value.charAt(0).toLocaleUpperCase(displayLanguage) + value.slice(1);
  } catch {
    return languages.find((language) => language.code === code)?.name ?? code;
  }
}

function browserLanguage(): LanguageCode {
  const code = navigator.language.toLowerCase().split("-")[0] as LanguageCode;
  return languages.some((language) => language.code === code) ? code : "ru";
}

function translatedText(value: string, language: LanguageCode) {
  if (language === "ru") return value;
  const trimmed = value.trim();
  const generated = generatedTranslations as Record<string, Partial<Record<LanguageCode, string>>>;
  const translated = rows[trimmed]?.[language] ?? generated[trimmed]?.[language];
  if (translated) return value.replace(trimmed, translated);

  const counted = trimmed.match(/^(Корзина|Избранное) \((\d+)\)$/);
  if (counted) {
    const label = rows[counted[1]]?.[language] ?? counted[1];
    return value.replace(trimmed, `${label} (${counted[2]})`);
  }
  return value;
}

function applyLanguage(language: LanguageCode) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    if (node.parentElement?.closest("[data-no-auto-translate], script, style")) return;
    const next = translatedText(node.nodeValue ?? "", language);
    if (next !== node.nodeValue) node.nodeValue = next;
  });
  document.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]").forEach((element) => {
    ["placeholder", "aria-label", "title"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, translatedText(value, language));
    });
  });
}

export function LanguageRuntime() {
  useEffect(() => {
    let language = getStoredLanguage();
    applyLanguage(language);

    const observer = new MutationObserver(() => applyLanguage(language));
    observer.observe(document.body, { childList: true, subtree: true });

    if (!localStorage.getItem(LOCATION_KEY) && window.isSecureContext && navigator.geolocation) {
      localStorage.setItem(LOCATION_KEY, "1");
        navigator.geolocation.getCurrentPosition(
          () => {
            language = browserLanguage();
            setStoredLanguage(language);
            applyLanguage(language);
            window.dispatchEvent(new CustomEvent("lune-language-updated", { detail: language }));
          },
          () => {
            language = "ru";
            setStoredLanguage("ru");
            applyLanguage("ru");
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 86400000 }
        );
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
