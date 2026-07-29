import { env } from "cloudflare:workers";
import { products as seedProducts } from "../app/catalog";

export type CmsStatus = "active" | "draft" | "out_of_stock";
export type CmsProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  sizes: number[];
  status: CmsStatus;
  images: { id: string; url: string; objectKey: string | null; position: number }[];
  createdAt: string;
  updatedAt: string;
};

type RuntimeEnv = {
  DB?: D1Database;
  PRODUCT_IMAGES?: R2Bucket;
};

export function getCmsEnv() {
  return env as unknown as RuntimeEnv;
}

export function getCmsDb() {
  const db = getCmsEnv().DB;
  if (!db) throw new Error("CMS database is unavailable");
  return db;
}

let schemaReady: Promise<void> | null = null;

export async function ensureCmsSchema() {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    const db = getCmsDb();
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS admin_sessions (
        token_hash TEXT PRIMARY KEY,
        admin_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS cms_products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        description TEXT NOT NULL,
        sizes TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS cms_product_images (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES cms_products(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        object_key TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare("CREATE INDEX IF NOT EXISTS cms_products_status_idx ON cms_products(status)"),
      db.prepare("CREATE INDEX IF NOT EXISTS cms_product_images_product_idx ON cms_product_images(product_id)"),
      db.prepare("CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON admin_sessions(expires_at)"),
    ]);

    const count = await db.prepare("SELECT COUNT(*) AS count FROM cms_products").first<{ count: number }>();
    if ((count?.count ?? 0) === 0) {
      for (const product of seedProducts) {
        await db.batch([
          db.prepare(`INSERT INTO cms_products
            (id,name,price,description,sizes,status,created_at,updated_at)
            VALUES (?,?,?,?,?,'active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`)
            .bind(product.id, product.name, product.price, product.description, JSON.stringify(product.sizes)),
          db.prepare(`INSERT INTO cms_product_images
            (id,product_id,url,object_key,position) VALUES (?,?,?,?,0)`)
            .bind(crypto.randomUUID(), product.id, product.image, null),
        ]);
      }
    }
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });
  return schemaReady;
}

const bytesToBase64 = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes));
const base64ToBytes = (value: string) =>
  Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64(new Uint8Array(digest));
}

async function derivePassword(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 120_000 },
    key,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

export async function createPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { hash: await derivePassword(password, salt), salt: bytesToBase64(salt) };
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  const candidate = await derivePassword(password, base64ToBytes(salt));
  if (candidate.length !== hash.length) return false;
  let difference = 0;
  for (let index = 0; index < hash.length; index += 1) {
    difference |= candidate.charCodeAt(index) ^ hash.charCodeAt(index);
  }
  return difference === 0;
}

function cookieValue(request: Request, key: string) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${key}=`))?.slice(key.length + 1) ?? "";
}

export async function getAdmin(request: Request) {
  await ensureCmsSchema();
  const token = cookieValue(request, "lune_admin_session");
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await getCmsDb().prepare(`SELECT u.id,u.email
    FROM admin_sessions s JOIN admin_users u ON u.id=s.admin_id
    WHERE s.token_hash=? AND s.expires_at>CURRENT_TIMESTAMP`).bind(tokenHash).first<{ id: string; email: string }>();
  return row ?? null;
}

export async function requireAdmin(request: Request) {
  const admin = await getAdmin(request);
  if (!admin) throw new Response(JSON.stringify({ error: "Требуется вход." }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
  return admin;
}

export async function createSession(adminId: string, request: Request) {
  const token = bytesToBase64(crypto.getRandomValues(new Uint8Array(32)))
    .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  const tokenHash = await sha256(token);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await getCmsDb().prepare("INSERT INTO admin_sessions(token_hash,admin_id,expires_at) VALUES (?,?,?)")
    .bind(tokenHash, adminId, expires.toISOString()).run();
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `lune_admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${secure}`;
}

export const clearSessionCookie =
  "lune_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0";

export async function deleteSession(request: Request) {
  const token = cookieValue(request, "lune_admin_session");
  if (token) {
    await getCmsDb().prepare("DELETE FROM admin_sessions WHERE token_hash=?")
      .bind(await sha256(token)).run();
  }
}

export function normalizeProductInput(value: unknown) {
  const body = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 5000) : "";
  const price = Math.round(Number(body.price));
  const sizes = Array.isArray(body.sizes)
    ? [...new Set(body.sizes.map(Number).filter((size) => Number.isInteger(size) && size >= 30 && size <= 70))]
    : [];
  const status = ["active", "draft", "out_of_stock"].includes(String(body.status))
    ? (body.status as CmsStatus)
    : "draft";
  const images = Array.isArray(body.images)
    ? body.images.slice(0, 12).flatMap((image, position) => {
      if (!image || typeof image !== "object") return [];
      const item = image as Record<string, unknown>;
      const url = typeof item.url === "string" ? item.url.trim().slice(0, 1000) : "";
      if (!url) return [];
      return [{ id: typeof item.id === "string" ? item.id : crypto.randomUUID(), url, objectKey: typeof item.objectKey === "string" ? item.objectKey : null, position }];
    })
    : [];
  const errors: string[] = [];
  if (name.length < 2) errors.push("Укажите название.");
  if (!Number.isInteger(price) || price <= 0) errors.push("Укажите корректную цену.");
  if (description.length < 10) errors.push("Добавьте подробное описание.");
  if (sizes.length === 0) errors.push("Выберите хотя бы один размер.");
  if (images.length === 0) errors.push("Добавьте хотя бы одну фотографию.");
  return { data: { name, description, price, sizes, status, images }, errors };
}

export async function readProducts(): Promise<CmsProduct[]> {
  await ensureCmsSchema();
  const db = getCmsDb();
  const productRows = await db.prepare("SELECT * FROM cms_products ORDER BY updated_at DESC").all<Record<string, unknown>>();
  const imageRows = await db.prepare("SELECT * FROM cms_product_images ORDER BY position ASC").all<Record<string, unknown>>();
  const imagesByProduct = new Map<string, CmsProduct["images"]>();
  for (const image of imageRows.results) {
    const productId = String(image.product_id);
    const group = imagesByProduct.get(productId) ?? [];
    group.push({
      id: String(image.id),
      url: String(image.url),
      objectKey: image.object_key ? String(image.object_key) : null,
      position: Number(image.position),
    });
    imagesByProduct.set(productId, group);
  }
  return productRows.results.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    price: Number(row.price),
    description: String(row.description),
    sizes: JSON.parse(String(row.sizes)) as number[],
    status: row.status as CmsStatus,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    images: imagesByProduct.get(String(row.id)) ?? [],
  }));
}
