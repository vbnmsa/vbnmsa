import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const fromRoot = (path) => new URL(path, root);

test("keeps the production LUNE shell and content intact", async () => {
  const [layout, page, footer, buildManifest] = await Promise.all([
    readFile(fromRoot("app/layout.tsx"), "utf8"),
    readFile(fromRoot("app/page.tsx"), "utf8"),
    readFile(fromRoot("app/components/Footer.tsx"), "utf8"),
    readFile(fromRoot("dist/server/.vite/manifest.json"), "utf8"),
  ]);

  assert.match(layout, /LUNE — Тихие формы для современной жизни/);
  assert.match(layout, /<Footer \/>/);
  for (const section of ["top", "shop", "philosophy", "best-sellers", "story", "process", "journal", "faq"]) {
    assert.match(page, new RegExp(`id=["']${section}["']`));
  }
  assert.match(footer, /className="site-footer"/);
  assert.match(buildManifest, /"file": "index\.js"/);
  assert.doesNotMatch(layout + page, /codex-preview|_sites-preview|Your site is taking shape/);
});

test("keeps CMS persistence, storage, auth, and migrations wired", async () => {
  const [hosting, schema, cms, adminPage] = await Promise.all([
    readFile(fromRoot(".openai/hosting.json"), "utf8"),
    readFile(fromRoot("db/schema.ts"), "utf8"),
    readFile(fromRoot("lib/cms-server.ts"), "utf8"),
    readFile(fromRoot("app/admin/page.tsx"), "utf8"),
  ]);

  assert.deepEqual(JSON.parse(hosting), {
    project_id: "appgprj_6a676eaf32cc8191aa611d4bfb31aa26",
    d1: "DB",
    r2: "PRODUCT_IMAGES",
  });
  assert.match(schema, /cmsProducts/);
  assert.match(schema, /cmsProductImages/);
  assert.match(schema, /adminUsers/);
  assert.match(cms, /PBKDF2/);
  assert.match(cms, /lune_admin_session/);
  assert.match(adminPage, /Catalog management system/);

  await Promise.all([
    access(fromRoot("drizzle/0000_ambitious_hiroim.sql")),
    access(fromRoot("app/api/admin/products/route.ts")),
    access(fromRoot("app/api/admin/products/[id]/route.ts")),
    access(fromRoot("app/api/admin/uploads/route.ts")),
    access(fromRoot("app/api/product-images/[key]/route.ts")),
  ]);
});
