import {
  createPassword,
  createSession,
  ensureCmsSchema,
  getCmsDb,
} from "../../../../../lib/cms-server";

export async function POST(request: Request) {
  await ensureCmsSchema();
  const db = getCmsDb();
  if (await db.prepare("SELECT id FROM admin_users LIMIT 1").first()) {
    return Response.json({ error: "Владелец уже зарегистрирован." }, { status: 409 });
  }

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12) {
    return Response.json(
      { error: "Введите корректную почту и пароль не короче 12 символов." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const credentials = await createPassword(password);
  await db.prepare(`INSERT INTO admin_users
    (id,email,password_hash,password_salt) VALUES (?,?,?,?)`)
    .bind(id, email, credentials.hash, credentials.salt).run();
  const cookie = await createSession(id, request);
  return Response.json(
    { ok: true, email },
    { headers: { "Set-Cookie": cookie } },
  );
}
