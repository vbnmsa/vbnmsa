import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("ships the static storefront without persistence bindings", async () => {
  const [hosting, catalog] = await Promise.all([
    readFile(fromRoot(".openai/hosting.json"), "utf8"),
    readFile(fromRoot("app/catalog.ts"), "utf8"),
  ]);

  assert.deepEqual(JSON.parse(hosting), {
    project_id: "appgprj_6a676eaf32cc8191aa611d4bfb31aa26",
  });
  assert.match(catalog, /products/);
});
