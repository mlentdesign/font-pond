/**
 * Post-build script: generates HTML files for pair slugs that
 * weren't covered by Next.js generateStaticParams (due to the
 * ~120k param limit). Uses a built pair page as a template and
 * does simple string replacement for each remaining slug.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const OUT_DIR = "out/pair";
const SLUGS_FILE = "src/data/all-pair-slugs.json";

// Load the full slug list
const allSlugs = JSON.parse(readFileSync(SLUGS_FILE, "utf-8"));

// Find which slugs already have built pages
const builtSlugs = new Set();
for (const entry of readdirSync(OUT_DIR)) {
  if (entry.endsWith(".html")) {
    builtSlugs.add(entry.replace(".html", ""));
  }
}

const missing = allSlugs.filter((s) => !builtSlugs.has(s));
console.log(`Total slugs: ${allSlugs.length}`);
console.log(`Already built: ${builtSlugs.size}`);
console.log(`Missing: ${missing.length}`);

if (missing.length === 0) {
  console.log("Nothing to generate!");
  process.exit(0);
}

// Pick a template from one of the built pages
const templateSlug = [...builtSlugs][0];
const templateHtml = readFileSync(join(OUT_DIR, `${templateSlug}.html`), "utf-8");
const templateTxt = readFileSync(join(OUT_DIR, `${templateSlug}.txt`), "utf-8");

// Read the directory files for the template
const templateDir = join(OUT_DIR, templateSlug);
const dirFiles = {};
if (existsSync(templateDir)) {
  for (const f of readdirSync(templateDir)) {
    dirFiles[f] = readFileSync(join(templateDir, f), "utf-8");
  }
}

let generated = 0;
const startTime = Date.now();

for (const slug of missing) {
  // Replace template slug with this slug in HTML
  const html = templateHtml.replaceAll(templateSlug, slug);
  writeFileSync(join(OUT_DIR, `${slug}.html`), html);

  // Replace in txt file
  const txt = templateTxt.replaceAll(templateSlug, slug);
  writeFileSync(join(OUT_DIR, `${slug}.txt`), txt);

  // Create directory with replaced files
  const slugDir = join(OUT_DIR, slug);
  if (!existsSync(slugDir)) mkdirSync(slugDir, { recursive: true });
  for (const [filename, content] of Object.entries(dirFiles)) {
    writeFileSync(join(slugDir, filename), content.replaceAll(templateSlug, slug));
  }

  generated++;
  if (generated % 10000 === 0) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  Generated ${generated}/${missing.length} (${elapsed}s)`);
  }
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`Done: generated ${generated} pair pages in ${totalTime}s`);
console.log(`Total pair pages: ${builtSlugs.size + generated}`);
