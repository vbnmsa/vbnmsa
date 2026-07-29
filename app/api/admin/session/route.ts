import { ensureCmsSchema, getAdmin, getCmsDb } from "../../../../lib/cms-server";

export async function GET(request: Request) {
  await ensureCmsSchema();
  const configured = Boolean(
    (await getCmsDb().prepare("SELECT id FROM admin_users LIMIT 1").first())?.id,
  );
  const admin = await getAdmin(request);
  return Response.json({
    configured,
    authenticated: Boolean(admin),
    email: admin?.email ?? null,
  });
}
