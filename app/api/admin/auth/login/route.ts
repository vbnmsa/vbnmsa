import {
  createSession,
  ensureCmsSchema,
  getCmsDb,
  verifyPassword,
} from "../../../../../lib/cms-server";

export async function POST(request: Request) {
  await ensureCmsSchema();
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const admin = await getCmsDb().prepare(`SELECT id,email,password_hash,password_salt
    FROM admin_users WHERE email=? LIMIT 1`).bind(email).first<{
      id: string;
      email: string;
      password_hash: string;
      password_salt: string;
    }>();
  const valid = admin
    ? await verifyPassword(password, admin.password_hash, admin.password_salt)
    : false;
  if (!admin || !valid) {
    return Response.json({ error: "Неверная почта или пароль." }, { status: 401 });
  }
  const cookie = await createSession(admin.id, request);
  return Response.json(
    { ok: true, email: admin.email },
    { headers: { "Set-Cookie": cookie } },
  );
}
