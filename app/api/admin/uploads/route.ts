import { getCmsEnv, requireAdmin } from "../../../../lib/cms-server";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const bucket = getCmsEnv().PRODUCT_IMAGES;
    if (!bucket) return Response.json({ error: "Хранилище изображений недоступно." }, { status: 503 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Выберите изображение." }, { status: 400 });
    const extension = allowedTypes.get(file.type);
    if (!extension) return Response.json({ error: "Поддерживаются JPG, PNG, WEBP и AVIF." }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Файл должен быть меньше 8 МБ." }, { status: 400 });
    const key = `${crypto.randomUUID()}.${extension}`;
    await bucket.put(key, file.stream(), {
      httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { originalName: file.name.slice(0, 200) },
    });
    return Response.json({
      image: {
        id: crypto.randomUUID(),
        url: `/api/product-images/${key}`,
        objectKey: key,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Не удалось загрузить фотографию." }, { status: 500 });
  }
}
