// Font Pond: one template, clean pair URLs, correct status and head tags for every pair.
// Route: fontpond.melware.art/pair/*   (runs in front of GitHub Pages)
//
// GitHub Pages answers an unlisted /pair/<slug> with its 404.html (the app shell, status 404).
// This Worker takes that same shell, swaps in the pair's own title/description/canonical,
// and returns it with status 200. Listed pairs (which have their own file) pass through untouched.
// Names come from /pair-meta/<first two letters of slug>.json, small shards on the same host.

const DEFAULT_TITLE = "Font Pond · free font pairings by mood"; // must match layout.tsx metadata.title
const BASE = "https://fontpond.melware.art";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const trim = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s);

export function setHead(html, { title, description, url, jsonLd }) {
  const t = esc(title), d = esc(description), u = esc(url);
  let out = html
    .replace(/<title>[^<]*<\/title>/, () => `<title>${t}</title>`)
    .replace(/<meta name="description" content="[^"]*"\/?>/, () => `<meta name="description" content="${d}"/>`)
    .replace(/<meta property="og:title" content="[^"]*"\/?>/, () => `<meta property="og:title" content="${t}"/>`)
    .replace(/<meta property="og:description" content="[^"]*"\/?>/, () => `<meta property="og:description" content="${d}"/>`)
    .replace(/<meta property="og:url" content="[^"]*"\/?>/, () => `<meta property="og:url" content="${u}"/>`)
    .replace(/<meta name="twitter:title" content="[^"]*"\/?>/, () => `<meta name="twitter:title" content="${t}"/>`)
    .replace(/<meta name="twitter:description" content="[^"]*"\/?>/, () => `<meta name="twitter:description" content="${d}"/>`);
  const inPayload = String(title).replace(/["\\]/g, "");
  out = out.replace(`{\\"children\\":\\"${DEFAULT_TITLE}\\"}`, () => `{\\"children\\":\\"${inPayload}\\"}`);
  if (/<link rel="canonical"[^>]*>/.test(out)) out = out.replace(/<link rel="canonical" href="[^"]*"\/?>/, () => `<link rel="canonical" href="${u}"/>`);
  else out = out.replace("</head>", () => `<link rel="canonical" href="${u}"/></head>`);
  if (jsonLd) out = out.replace("</head>", () => `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script></head>`);
  return out;
}

export default {
  async fetch(request) {
    const res = await fetch(request);
    if (res.status !== 404 || request.method !== "GET") return res;
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/pair\/([a-z0-9-]+)\/?$/);
    if (!m) return res;
    const slug = m[1];
    const shardRes = await fetch(`${url.origin}/pair-meta/${slug.slice(0, 2)}.json`, { cf: { cacheEverything: true, cacheTtl: 3600 } });
    if (!shardRes.ok) return res;
    const pair = (await shardRes.json())[slug];
    if (!pair) return res; // genuinely unknown slug: keep the 404
    const [heading, body] = pair;
    const name = `${heading} and ${body}`;
    const pageUrl = `${BASE}/pair/${slug}`;
    const description = trim(`${heading} for headings with ${body} for body text. A free font pairing, caught in Font Pond.`, 160);
    const html = setHead(await res.text(), {
      title: `Font Pond · ${name} font pairing`,
      description,
      url: pageUrl,
      jsonLd: { "@context": "https://schema.org", "@graph": [
        { "@type": "WebPage", name: `${name} font pairing`, url: pageUrl, description, isPartOf: { "@type": "WebSite", name: "Font Pond", url: `${BASE}/` } },
        { "@type": "BreadcrumbList", itemListElement: [["Font Pond", `${BASE}/`], [name, pageUrl]].map(([n, item], i) => ({ "@type": "ListItem", position: i + 1, name: n, item })) },
      ] },
    });
    const headers = new Headers(res.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.delete("content-length");
    headers.delete("etag");
    return new Response(html, { status: 200, headers });
  },
};
