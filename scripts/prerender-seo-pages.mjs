#!/usr/bin/env node
// Post-build: give every clean font/pair URL its own static file so GitHub Pages
// answers 200 (not 404) and search engines see a real title, description and canonical.
//
// Each file is a byte-for-byte copy of out/404.html (the exact page GitHub Pages
// already serves for these URLs today) with ONLY <head> tags swapped. The client
// code, not-found.tsx routing, query-param navigation and the startTransition URL
// cleaning are untouched — the browser runs identical code at the identical URL.
//
// Also fixes the site-wide canonical so each top-level page points at itself.

import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const BASE = "https://fontpond.melware.art";
const DEFAULT_TITLE = "Font Pond: free font pairings by mood"; // must match layout.tsx metadata.title

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const trim = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s);

function setHead(html, { title, description, url, jsonLd }) {
  const t = esc(title), d = esc(description), u = esc(url);
  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/<meta name="description" content="[^"]*"\/?>/, `<meta name="description" content="${d}"/>`)
    .replace(/<meta property="og:title" content="[^"]*"\/?>/, `<meta property="og:title" content="${t}"/>`)
    .replace(/<meta property="og:description" content="[^"]*"\/?>/, `<meta property="og:description" content="${d}"/>`)
    .replace(/<meta property="og:url" content="[^"]*"\/?>/, `<meta property="og:url" content="${u}"/>`)
    .replace(/<meta name="twitter:title" content="[^"]*"\/?>/, `<meta name="twitter:title" content="${t}"/>`)
    .replace(/<meta name="twitter:description" content="[^"]*"\/?>/, `<meta name="twitter:description" content="${d}"/>`);
  // Next.js re-applies the layout's <title> from the inline RSC payload after hydration,
  // so swap it there too (payload strings are JSON inside a JS string: quotes double-escaped).
  const inPayload = (s) => String(s).replace(/["\\]/g, "");
  out = out.replace(`{\\"children\\":\\"${DEFAULT_TITLE}\\"}`, `{\\"children\\":\\"${inPayload(title)}\\"}`);
  if (/<link rel="canonical"[^>]*>/.test(out)) out = out.replace(/<link rel="canonical" href="[^"]*"\/?>/, `<link rel="canonical" href="${u}"/>`);
  else out = out.replace("</head>", `<link rel="canonical" href="${u}"/></head>`);
  if (jsonLd) out = out.replace("</head>", `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script></head>`);
  return out;
}

const shell = fs.readFileSync(path.join(OUT, "404.html"), "utf8");
const index = JSON.parse(fs.readFileSync(path.join(OUT, "seo-index.json"), "utf8"));
for (const k of ["<title>", 'name="description"', 'property="og:url"']) {
  if (!shell.includes(k)) throw new Error(`404.html is missing ${k}; head layout changed — refusing to write pages`);
}

const crumbs = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
});

let fontsWritten = 0, pairsWritten = 0;
fs.mkdirSync(path.join(OUT, "font"), { recursive: true });
fs.mkdirSync(path.join(OUT, "pair"), { recursive: true });

for (const f of index.fonts) {
  if (!f.slug || !/^[a-z0-9-]+$/.test(f.slug)) continue;
  const url = `${BASE}/font/${f.slug}`;
  const kind = f.classification ? `${f.classification} font` : "font";
  const bits = [f.designer && `by ${f.designer}`, f.year && `(${f.year})`].filter(Boolean).join(" ");
  const tones = f.tones?.length ? ` Feels ${f.tones.join(", ")}.` : "";
  const description = trim(`${f.name} is a free ${kind}${bits ? " " + bits : ""}.${tones} See its anatomy, license and the best font pairings for ${f.name} on Font Pond.`, 160);
  const html = setHead(shell, {
    title: `Font Pond · ${f.name} font pairings`,
    description,
    url,
    jsonLd: { "@context": "https://schema.org", "@graph": [
      { "@type": "WebPage", name: `${f.name} font pairings`, url, description, isPartOf: { "@type": "WebSite", name: "Font Pond", url: `${BASE}/` } },
      crumbs([["Font Pond", `${BASE}/`], [f.name, url]]),
    ] },
  });
  fs.writeFileSync(path.join(OUT, "font", `${f.slug}.html`), html);
  fontsWritten++;
}

for (const p of index.pairs) {
  if (!p.slug || !/^[a-z0-9-]+$/.test(p.slug) || !p.heading || !p.body) continue;
  const url = `${BASE}/pair/${p.slug}`;
  const name = `${p.heading} and ${p.body}`;
  const why = p.summary ? ` ${p.summary.trim().replace(/\.?$/, ".")}` : "";
  const description = trim(`${p.heading} for headings with ${p.body} for body text.${why} A free font pairing, scored on Font Pond.`, 160);
  const html = setHead(shell, {
    title: `Font Pond · ${name} font pairing`,
    description,
    url,
    jsonLd: { "@context": "https://schema.org", "@graph": [
      { "@type": "WebPage", name: `${name} font pairing`, url, description, isPartOf: { "@type": "WebSite", name: "Font Pond", url: `${BASE}/` } },
      crumbs([["Font Pond", `${BASE}/`], [name, url]]),
    ] },
  });
  fs.writeFileSync(path.join(OUT, "pair", `${p.slug}.html`), html);
  pairsWritten++;
}

// Designer and year pages — same approach.
let designersWritten = 0, yearsWritten = 0;
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
for (const [kind, list] of [["designer", index.designers || []], ["year", index.years || []]]) {
  fs.mkdirSync(path.join(OUT, kind), { recursive: true });
  for (const g of list) {
    if (!g.slug || !/^[a-z0-9-]+$/.test(g.slug)) continue;
    const url = `${BASE}/${kind}/${g.slug}`;
    const ex = g.examples?.length ? ` including ${g.examples.join(", ")}` : "";
    const label = kind === "designer" ? `Fonts by ${g.name}` : `Fonts released in ${g.year}`;
    const description = trim(kind === "designer"
      ? `${plural(g.count, "free font")} designed by ${g.name}${ex}, with the best font pairings for each on Font Pond.`
      : `${plural(g.count, "free font")} released in ${g.year}${ex}, with the best font pairings for each on Font Pond.`, 160);
    const html = setHead(shell, {
      title: `Font Pond · ${label}`,
      description,
      url,
      jsonLd: { "@context": "https://schema.org", "@graph": [
        { "@type": "CollectionPage", name: label, url, description, isPartOf: { "@type": "WebSite", name: "Font Pond", url: `${BASE}/` } },
        crumbs([["Font Pond", `${BASE}/`], [label, url]]),
      ] },
    });
    fs.writeFileSync(path.join(OUT, kind, `${g.slug}.html`), html);
    kind === "designer" ? designersWritten++ : yearsWritten++;
  }
}

// Top-level pages: canonical (and og:url) should point at themselves, not the homepage.
const selfCanon = { "database.html": "/database", "feel.html": "/feel" };
for (const [file, p] of Object.entries(selfCanon)) {
  const fp = path.join(OUT, file);
  if (!fs.existsSync(fp)) continue;
  const u = `${BASE}${p}`;
  const h = fs.readFileSync(fp, "utf8")
    .replace(/<link rel="canonical" href="[^"]*"\/?>/, `<link rel="canonical" href="${u}"/>`)
    .replace(/<meta property="og:url" content="[^"]*"\/?>/, `<meta property="og:url" content="${u}"/>`);
  fs.writeFileSync(fp, h);
}

fs.rmSync(path.join(OUT, "seo-index.json"));
console.log(`prerender-seo-pages: ${fontsWritten} font + ${pairsWritten} pair + ${designersWritten} designer + ${yearsWritten} year pages written`);
if (fontsWritten < 100 || pairsWritten < 1000 || designersWritten < 50 || yearsWritten < 10) throw new Error("Far fewer pages than expected — check seo-index.json");
