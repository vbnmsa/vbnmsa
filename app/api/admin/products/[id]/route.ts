import {
  getCmsDb,
  getCmsEnv,
  normalizeProductInput,
  requireAdmin,
} from "../../../../../lib/cms-server";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const db = getCmsDb();
    const existing = await db.prepare("SELECT id FROM cms_products WHERE id=?").bind(id).first();
    if (!existing) return Response.json({ error: "Товар не найден." }, { status: 404 });
    const parsed = normalizeProductInput(await request.json().catch(() => null));
    if (parsed.errors.length) {
      return Response.json({ error: parsed.errors[0], errors: parsed.errors }, { status: 400 });
    }
    const previousImages = await db.prepare("SELECT object_key FROM cms_product_images WHERE product_id=?").bind(id).all<{ object_key: string | null }>();
    await db.batch([
      db.prepare(`UPDATE cms_products SET
        name=?,price=?,description=?,sizes=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(parsed.data.name, parsed.data.price, parsed.data.description, JSON.stringify(parsed.data.sizes), parsed.data.status, id),
      db.prepare("DELETE FROM cms_product_images WHERE product_id=?").bind(id),
      ...parsed.data.images.map((image) =>
        db.prepare(`INSERT INTO cms_product_images
          (id,product_id,url,object_key,position) VALUES (?,?,?,?,?)`)
          .bind(image.id, id, image.url, image.objectKey, image.position)),
    ]);
    const retained = new Set(parsed.data.images.map((image) => image.objectKey).filter(Boolean));
    const bucket = getCmsEnv().PRODUCT_IMAGES;
    if (bucket) {
      await Promise.all(previousImages.results.flatMap((image) =>
        image.object_key && !retained.has(image.object_key)
          ? [bucket.delete(image.object_key)]
          : []));
    }
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Не удалось изменить товар." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const db = getCmsDb();
    const images = await db.prepare("SELECT object_key FROM cms_product_images WHERE product_id=?").bind(id).all<{ object_key: string | null }>();
    const result = await db.prepare("DELETE FROM cms_products WHERE id=?").bind(id).run();
    if (!result.meta.changes) return Response.json({ error: "Товар не найден." }, { status: 404 });
    const bucket = getCmsEnv().PRODUCT_IMAGES;
    if (bucket) await Promise.all(images.results.flatMap((image) => image.object_key ? [bucket.delete(image.object_key)] : []));
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Не удалось удалить товар." }, { status: 500 });
  }
}
