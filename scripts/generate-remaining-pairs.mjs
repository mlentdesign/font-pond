/**
 * Post-build script: generates HTML files for font and pair slugs
 * not covered by Next.js generateStaticParams. Uses one built page
 * as a template and does simple string replacement for each slug.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";

function generatePages(outDir, slugsFile, label) {
  const allSlugs = JSON.parse(readFileSync(slugsFile, "utf-8"));

  const builtSlugs = new Set();
  for (const entry of readdirSync(outDir)) {
    if (entry.endsWith(".html")) {
      builtSlugs.add(entry.replace(".html", ""));
    }
  }

  const missing = allSlugs.filter((s) => !builtSlugs.has(s));
  console.log(`${label}: ${allSlugs.length} total, ${builtSlugs.size} built, ${missing.length} to generate`);

  if (missing.length === 0) {
    console.log(`  Nothing to generate!`);
    return;
  }

  const templateSlug = [...builtSlugs][0];
  const templateHtml = readFileSync(join(outDir, `${templateSlug}.html`), "utf-8");
  const templateTxt = existsSync(join(outDir, `${templateSlug}.txt`))
    ? readFileSync(join(outDir, `${templateSlug}.txt`), "utf-8")
    : null;

  const templateDir = join(outDir, templateSlug);
  const dirFiles = {};
  if (existsSync(templateDir)) {
    for (const f of readdirSync(templateDir)) {
      dirFiles[f] = readFileSync(join(templateDir, f), "utf-8");
    }
  }

  let generated = 0;
  const startTime = Date.now();

  for (const slug of missing) {
    const html = templateHtml.replaceAll(templateSlug, slug);
    writeFileSync(join(outDir, `${slug}.html`), html);

    if (templateTxt) {
      const txt = templateTxt.replaceAll(templateSlug, slug);
      writeFileSync(join(outDir, `${slug}.txt`), txt);
    }

    const slugDir = join(outDir, slug);
    if (!existsSync(slugDir)) mkdirSync(slugDir, { recursive: true });
    for (const [filename, content] of Object.entries(dirFiles)) {
      writeFileSync(join(slugDir, filename), content.replaceAll(templateSlug, slug));
    }

    generated++;
    if (generated % 10000 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  ${generated}/${missing.length} (${elapsed}s)`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`  Done: ${generated} pages in ${totalTime}s`);
}

// Generate remaining font pages
generatePages("out/font", "src/data/font-slugs.json", "Fonts");

// Generate remaining pair pages
generatePages("out/pair", "src/data/all-pair-slugs.json", "Pairs");
