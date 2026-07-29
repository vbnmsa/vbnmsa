import {
  ensureCmsSchema,
  getCmsDb,
  normalizeProductInput,
  readProducts,
  requireAdmin,
} from "../../../../lib/cms-server";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    return Response.json({ products: await readProducts() });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Не удалось загрузить товары." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    await ensureCmsSchema();
    const parsed = normalizeProductInput(await request.json().catch(() => null));
    if (parsed.errors.length) {
      return Response.json({ error: parsed.errors[0], errors: parsed.errors }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const db = getCmsDb();
    const statements = [
      db.prepare(`INSERT INTO cms_products
        (id,name,price,description,sizes,status,created_at,updated_at)
        VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`)
        .bind(id, parsed.data.name, parsed.data.price, parsed.data.description, JSON.stringify(parsed.data.sizes), parsed.data.status),
      ...parsed.data.images.map((image) =>
        db.prepare(`INSERT INTO cms_product_images
          (id,product_id,url,object_key,position) VALUES (?,?,?,?,?)`)
          .bind(image.id, id, image.url, image.objectKey, image.position)),
    ];
    await db.batch(statements);
    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Не удалось сохранить товар." }, { status: 500 });
  }
}
