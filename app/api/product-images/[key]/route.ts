import { getCmsEnv } from "../../../../lib/cms-server";

export async function GET(request: Request, context: { params: Promise<{ key: string }> }) {
  const bucket = getCmsEnv().PRODUCT_IMAGES;
  if (!bucket) return new Response("Not found", { status: 404 });
  const { key } = await context.params;
  if (!/^[a-f0-9-]+\.(jpg|png|webp|avif)$/.test(key)) {
    return new Response("Not found", { status: 404 });
  }
  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  if (request.headers.get("If-None-Match") === object.httpEtag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: object.httpEtag,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
