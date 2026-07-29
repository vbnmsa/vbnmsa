"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "active" | "draft" | "out_of_stock";
type CmsImage = { id: string; url: string; objectKey: string | null; position: number };
type CmsProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  sizes: number[];
  status: Status;
  images: CmsImage[];
  createdAt: string;
  updatedAt: string;
};
type EditorState = {
  id?: string;
  name: string;
  price: string;
  description: string;
  sizes: string;
  status: Status;
  images: CmsImage[];
};

const emptyEditor = (): EditorState => ({
  name: "",
  price: "",
  description: "",
  sizes: "",
  status: "draft",
  images: [],
});

const statusLabels: Record<Status, string> = {
  active: "Активен",
  draft: "Черновик",
  out_of_stock: "Нет в наличии",
};

const money = (value: number) =>
  `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Произошла ошибка.");
  return data;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [section, setSection] = useState<"dashboard" | "products" | "settings">("dashboard");
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [sort, setSort] = useState<"updated" | "name" | "price-high" | "price-low">("updated");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [editorError, setEditorError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function bootstrap() {
    try {
      const session = await api<{ configured: boolean; authenticated: boolean; email: string | null }>("/api/admin/session");
      setConfigured(session.configured);
      setAuthenticated(session.authenticated);
      setEmail(session.email ?? "");
      if (session.authenticated) await loadProducts();
    } catch {
      setAuthError("Не удалось подключиться к базе данных.");
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    const result = await api<{ products: CmsProduct[] }>("/api/admin/products");
    setProducts(result.products);
  }

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      await api(configured ? "/api/admin/auth/login" : "/api/admin/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setConfigured(true);
      setAuthenticated(true);
      setPassword("");
      await loadProducts();
      setToast(configured ? "Вход выполнен." : "Аккаунт владельца создан.");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Попробуйте ещё раз.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    await api("/api/admin/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setProducts([]);
    setPassword("");
  }

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products
      .filter((product) =>
        (!normalized || product.name.toLowerCase().includes(normalized)) &&
        (statusFilter === "all" || product.status === statusFilter))
      .sort((first, second) => {
        if (sort === "name") return first.name.localeCompare(second.name, "ru");
        if (sort === "price-high") return second.price - first.price;
        if (sort === "price-low") return first.price - second.price;
        return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
      });
  }, [products, query, statusFilter, sort]);

  const stats = {
    total: products.length,
    active: products.filter((product) => product.status === "active").length,
    unavailable: products.filter((product) => product.status === "out_of_stock").length,
  };

  function openEditor(product?: CmsProduct) {
    setEditorError("");
    setEditor(product ? {
      id: product.id,
      name: product.name,
      price: String(product.price),
      description: product.description,
      sizes: product.sizes.join(", "),
      status: product.status,
      images: product.images,
    } : emptyEditor());
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length || !editor) return;
    setUploading(true);
    setEditorError("");
    try {
      const uploaded: CmsImage[] = [];
      for (const file of Array.from(files).slice(0, 12 - editor.images.length)) {
        const form = new FormData();
        form.append("file", file);
        const result = await api<{ image: CmsImage }>("/api/admin/uploads", {
          method: "POST",
          body: form,
        });
        uploaded.push(result.image);
      }
      setEditor((current) => current ? { ...current, images: [...current.images, ...uploaded] } : current);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : "Не удалось загрузить изображение.");
    } finally {
      setUploading(false);
    }
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    if (!editor) return;
    const sizes = [...new Set(editor.sizes.split(/[,\s]+/).map(Number).filter(Number.isFinite))];
    if (editor.name.trim().length < 2) return setEditorError("Укажите название товара.");
    if (!(Number(editor.price) > 0)) return setEditorError("Укажите корректную цену.");
    if (editor.description.trim().length < 10) return setEditorError("Добавьте подробное описание.");
    if (!sizes.length) return setEditorError("Укажите хотя бы один размер.");
    if (!editor.images.length) return setEditorError("Добавьте хотя бы одну фотографию.");
    setSaving(true);
    setEditorError("");
    try {
      await api(editor.id ? `/api/admin/products/${editor.id}` : "/api/admin/products", {
        method: editor.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editor.name,
          price: Number(editor.price),
          description: editor.description,
          sizes,
          status: editor.status,
          images: editor.images,
        }),
      });
      await loadProducts();
      setEditor(null);
      setToast(editor.id ? "Товар успешно изменён." : "Товар успешно добавлен.");
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : "Не удалось сохранить товар.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: CmsProduct) {
    if (!window.confirm(`Удалить «${product.name}»? Это действие нельзя отменить.`)) return;
    try {
      await api(`/api/admin/products/${product.id}`, { method: "DELETE" });
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setToast("Товар удалён.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Не удалось удалить товар.");
    }
  }

  if (loading) {
    return <main className="admin-auth"><div className="admin-auth-card"><span className="admin-mark">L</span><p>Загрузка CMS…</p></div></main>;
  }

  if (!authenticated) {
    return (
      <main className="admin-auth">
        <form className="admin-auth-card" onSubmit={submitAuth}>
          <a href="/" className="admin-wordmark">LUNE</a>
          <p className="admin-kicker">Catalog management system</p>
          <h1>{configured ? "Вход владельца" : "Создание владельца"}</h1>
          <p>{configured ? "Введите данные защищённого аккаунта." : "Это появится только один раз. Создайте единственный аккаунт владельца каталога."}</p>
          <label><span>Электронная почта</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label><span>Пароль</span><input required minLength={12} type="password" autoComplete={configured ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} /><small>Не менее 12 символов</small></label>
          {authError && <p className="admin-form-error" role="alert">{authError}</p>}
          <button className="admin-primary" disabled={authBusy}>{authBusy ? "Подождите…" : configured ? "Войти" : "Создать аккаунт"}</button>
          <a className="admin-back" href="/">← Вернуться в магазин</a>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div><a href="/" className="admin-wordmark">LUNE</a><span>CMS</span></div>
        <nav aria-label="Разделы CMS">
          <button className={section === "dashboard" ? "active" : ""} onClick={() => setSection("dashboard")}><i>01</i> Главная</button>
          <button className={section === "products" ? "active" : ""} onClick={() => setSection("products")}><i>02</i> Товары <em>{products.length}</em></button>
          <button className={section === "settings" ? "active" : ""} onClick={() => setSection("settings")}><i>03</i> Настройки</button>
        </nav>
        <div className="admin-sidebar-bottom"><span>{email}</span><button onClick={logout}>Выйти</button></div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar"><div><span>LUNE / CMS</span><strong>{section === "dashboard" ? "Главная" : section === "products" ? "Товары" : "Настройки"}</strong></div><a href="/" target="_blank">Открыть магазин ↗</a></header>

        {section === "dashboard" && (
          <div className="admin-dashboard">
            <div className="admin-heading"><div><p>Обзор каталога</p><h1>Добрый день</h1></div><button className="admin-primary" onClick={() => { setSection("products"); openEditor(); }}>+ Добавить товар</button></div>
            <div className="admin-stats">
              <article><span>Всего товаров</span><strong>{stats.total}</strong><small>Все позиции каталога</small></article>
              <article><span>Активные</span><strong>{stats.active}</strong><small>Видны покупателям</small></article>
              <article><span>Нет в наличии</span><strong>{stats.unavailable}</strong><small>Требуют внимания</small></article>
            </div>
            <div className="admin-recent"><div><h2>Недавно изменённые</h2><button onClick={() => setSection("products")}>Все товары →</button></div>{products.slice(0, 5).map((product) => <ProductRow key={product.id} product={product} onEdit={openEditor} onDelete={deleteProduct} />)}</div>
          </div>
        )}

        {section === "products" && (
          <div className="admin-products">
            <div className="admin-heading"><div><p>Управление каталогом</p><h1>Товары</h1></div><button className="admin-primary" onClick={() => openEditor()}>+ Добавить товар</button></div>
            <div className="admin-toolbar">
              <label className="admin-search"><span className="sr-only">Поиск</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по названию…" /><i>⌕</i></label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} aria-label="Фильтр статуса"><option value="all">Все статусы</option><option value="active">Активные</option><option value="draft">Черновики</option><option value="out_of_stock">Нет в наличии</option></select>
              <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Сортировка"><option value="updated">Сначала изменённые</option><option value="name">По названию</option><option value="price-high">Цена: по убыванию</option><option value="price-low">Цена: по возрастанию</option></select>
            </div>
            <div className="admin-product-table">
              <div className="admin-table-head"><span>Товар</span><span>Статус</span><span>Размеры</span><span>Цена</span><span /></div>
              {visibleProducts.length ? visibleProducts.map((product) => <ProductRow key={product.id} product={product} onEdit={openEditor} onDelete={deleteProduct} />) : <div className="admin-no-results">Товары не найдены.</div>}
            </div>
          </div>
        )}

        {section === "settings" && (
          <div className="admin-settings"><div className="admin-heading"><div><p>Безопасность</p><h1>Настройки</h1></div></div><article><span>Аккаунт владельца</span><strong>{email}</strong><p>Сессия защищена и автоматически завершится через 7 дней.</p><button onClick={logout}>Выйти из CMS</button></article></div>
        )}
      </section>

      {editor && (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
          <button className="admin-modal-backdrop" aria-label="Закрыть" onClick={() => setEditor(null)} />
          <form className="admin-editor" onSubmit={saveProduct}>
            <header><div><p>{editor.id ? "Редактирование" : "Новая позиция"}</p><h2 id="editor-title">{editor.id ? editor.name : "Добавить товар"}</h2></div><button type="button" onClick={() => setEditor(null)} aria-label="Закрыть">×</button></header>
            <div className="admin-editor-body">
              <label><span>Название *</span><input value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} placeholder="Например, жакет Structure" /></label>
              <div className="admin-field-row"><label><span>Цена, ₽ *</span><input min="1" type="number" value={editor.price} onChange={(event) => setEditor({ ...editor, price: event.target.value })} /></label><label><span>Статус *</span><select value={editor.status} onChange={(event) => setEditor({ ...editor, status: event.target.value as Status })}><option value="active">Активен</option><option value="draft">Черновик</option><option value="out_of_stock">Нет в наличии</option></select></label></div>
              <label><span>Российские размеры *</span><input value={editor.sizes} onChange={(event) => setEditor({ ...editor, sizes: event.target.value })} placeholder="40, 42, 44, 46" /><small>Разделяйте размеры запятыми</small></label>
              <label><span>Подробное описание *</span><textarea rows={7} value={editor.description} onChange={(event) => setEditor({ ...editor, description: event.target.value })} /></label>
              <fieldset className="admin-images"><legend>Фотографии *</legend><div>{editor.images.map((image) => <figure key={image.id}><img src={image.url} alt="" loading="lazy" decoding="async" /><button type="button" onClick={() => setEditor({ ...editor, images: editor.images.filter((item) => item.id !== image.id) })} aria-label="Удалить фотографию">×</button></figure>)}<label className="admin-upload"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => void uploadImages(event.target.files)} disabled={uploading || editor.images.length >= 12} /><strong>{uploading ? "Загрузка…" : "+"}</strong><span>Добавить фото</span><small>до 8 МБ</small></label></div></fieldset>
              {editorError && <p className="admin-form-error" role="alert">{editorError}</p>}
            </div>
            <footer><button type="button" onClick={() => setEditor(null)}>Отмена</button><button className="admin-primary" disabled={saving || uploading}>{saving ? "Сохранение…" : "Сохранить товар"}</button></footer>
          </form>
        </div>
      )}
      <div className={`admin-toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </main>
  );
}

function ProductRow({ product, onEdit, onDelete }: { product: CmsProduct; onEdit: (product: CmsProduct) => void; onDelete: (product: CmsProduct) => void }) {
  return (
    <article className="admin-product-row">
      <button className="admin-product-main" onClick={() => onEdit(product)}><span>{product.images[0] ? <img src={product.images[0].url} alt="" loading="lazy" decoding="async" /> : "—"}</span><div><strong>{product.name}</strong><small>Изменён {new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" }).format(new Date(product.updatedAt))}</small></div></button>
      <span className={`admin-status ${product.status}`}>{statusLabels[product.status]}</span>
      <span className="admin-sizes">{product.sizes.join(", ")}</span>
      <strong className="admin-price">{money(product.price)}</strong>
      <div className="admin-row-actions"><button onClick={() => onEdit(product)} aria-label={`Изменить ${product.name}`}>Изменить</button><button onClick={() => void onDelete(product)} aria-label={`Удалить ${product.name}`}>Удалить</button></div>
    </article>
  );
}
