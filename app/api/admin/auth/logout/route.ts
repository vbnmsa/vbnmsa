import {
  clearSessionCookie,
  deleteSession,
  ensureCmsSchema,
} from "../../../../../lib/cms-server";

export async function POST(request: Request) {
  await ensureCmsSchema();
  await deleteSession(request);
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": clearSessionCookie } },
  );
}
