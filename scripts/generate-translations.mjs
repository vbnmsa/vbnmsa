import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const appDir = path.join(root, "app");
const targets = ["en", "zh-CN", "pt", "sr", "es", "ar", "de"];
const outputCodes = { en: "en", "zh-CN": "zh", pt: "pt", sr: "sr", es: "es", ar: "ar", de: "de" };

async function filesIn(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesIn(full);
    if (!/\.(tsx?|jsx?)$/.test(entry.name) || entry.name === "language-runtime.tsx") return [];
    return [full];
  }));
  return nested.flat();
}

function addText(target, value) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (/[А-Яа-яЁё]/.test(normalized) && normalized.length > 1 && !normalized.includes("${")) target.add(normalized);
}

function collect(source, fileName, target) {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)) addText(target, node.text);
    ts.forEachChild(node, visit);
  }
  visit(file);
}

async function translate(text, language, attempt = 0) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "ru");
  url.searchParams.set("tl", language);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data[0].map((part) => part[0]).join("");
  } catch (error) {
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      return translate(text, language, attempt + 1);
    }
    throw error;
  }
}

const files = await filesIn(appDir);
const sourceTexts = new Set();
for (const file of files) collect(await fs.readFile(file, "utf8"), file, sourceTexts);

const texts = [...sourceTexts].sort((a, b) => a.localeCompare(b, "ru"));
const result = Object.fromEntries(texts.map((text) => [text, {}]));

for (const language of targets) {
  let cursor = 0;
  const workers = Array.from({ length: 8 }, async () => {
    while (cursor < texts.length) {
      const text = texts[cursor++];
      result[text][outputCodes[language]] = await translate(text, language);
    }
  });
  await Promise.all(workers);
}

await fs.writeFile(path.join(appDir, "generated-translations.json"), JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(`Generated ${texts.length} complete translation rows.`);
