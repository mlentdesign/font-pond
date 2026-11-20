import { createSign } from "node:crypto";
import { Buffer } from "node:buffer";

/**
 * Anonymous pair hearts for Font Pond.
 * Secrets: SHEET_ID, SA_EMAIL, SA_KEY (base64 PEM), HMAC_SECRET.
 * Sheet tabs: Counts, History, Ledger (hidden). No identities.
 */

const ALLOWED = new Set([
  "https://fontpond.melware.art",
  "http://localhost:3737",
]);
const BASE = "https://fontpond.melware.art";
const SLUG = /^[a-z0-9-]{1,80}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const corsHeaders = (origin) => {
  const allow = ALLOWED.has(origin) ? origin : "https://fontpond.melware.art";
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
};

const b64url = (v) => Buffer.from(typeof v === "string" ? v : JSON.stringify(v)).toString("base64url");

async function accessToken(env) {
  const pem = Buffer.from(env.SA_KEY, "base64").toString("utf8");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url({ alg: "RS256", typ: "JWT" })}.${b64url({
    iss: env.SA_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 300,
  })}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signer.sign(pem).toString("base64url")}`,
    }),
  });
  if (!response.ok) throw new Error(`token ${response.status}`);
  return (await response.json()).access_token;
}

function pacificNow() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date()).map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}

const colLetter = (i) => {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

const clip = (v, n) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

async function hmacHex(secret, text) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function valuesGet(api, headers, range) {
  const r = await fetch(`${api}/values/${encodeURIComponent(range)}`, { headers });
  if (!r.ok) throw new Error(`read ${r.status}`);
  return (await r.json()).values ?? [];
}

async function applyFavorite(env, { slug, action, hash, header, body }) {
  const token = await accessToken(env);
  const api = `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}`;
  const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
  const url = `${BASE}/pair/${slug}`;
  const when = pacificNow();

  const metaRes = await fetch(`${api}?fields=sheets.properties(sheetId,title)`, { headers });
  if (!metaRes.ok) throw new Error(`meta ${metaRes.status}`);
  const sheetIds = Object.fromEntries(
    ((await metaRes.json()).sheets ?? []).map((s) => [s.properties.title, s.properties.sheetId]),
  );
  const historyId = sheetIds.History;
  if (historyId == null) throw new Error("no History tab");

  const [counts, ledger] = await Promise.all([
    valuesGet(api, headers, "Counts!A:D"),
    valuesGet(api, headers, "Ledger!A:D"),
  ]);

  const data = [];
  const ledgerRow = ledger.findIndex((row, i) => i > 0 && row[0] === hash && row[1] === slug);
  const currently = ledgerRow > 0 && String(ledger[ledgerRow][2]).toLowerCase() === "yes";
  let countDelta = 0;
  if (action === "heart" && !currently) countDelta = 1;
  if (action === "unheart" && currently) countDelta = -1;

  if (ledgerRow > 0) {
    data.push({ range: `Ledger!C${ledgerRow + 1}:D${ledgerRow + 1}`, values: [[action === "heart" ? "yes" : "no", when]] });
  } else {
    const r = Math.max(ledger.length, 1) + 1;
    data.push({ range: `Ledger!A${r}:D${r}`, values: [[hash, slug, action === "heart" ? "yes" : "no", when]] });
  }

  const countRow = counts.findIndex((row, i) => i > 0 && (row[0] === url || row[0] === slug));
  if (countRow > 0) {
    const next = Math.max(0, (parseInt(counts[countRow][3], 10) || 0) + countDelta);
    data.push({ range: `Counts!A${countRow + 1}:D${countRow + 1}`, values: [[url, header, body, String(next)]] });
  } else if (action === "heart") {
    const r = Math.max(counts.length, 1) + 1;
    data.push({ range: `Counts!A${r}:D${r}`, values: [[url, header, body, "1"]] });
  }

  const write = await fetch(`${api}/values:batchUpdate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ valueInputOption: "RAW", data }),
  });
  if (!write.ok) throw new Error(`write ${write.status}`);

  // Newest activity at the top of History (row 2).
  const insert = await fetch(`${api}:batchUpdate`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      requests: [{
        insertDimension: {
          range: { sheetId: historyId, dimension: "ROWS", startIndex: 1, endIndex: 2 },
          inheritFromBefore: false,
        },
      }],
    }),
  });
  if (!insert.ok) throw new Error(`insert ${insert.status}`);
  const hist = await fetch(`${api}/values:batchUpdate`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      valueInputOption: "RAW",
      data: [{ range: "History!A2:E2", values: [[when, action === "heart" ? "hearted" : "unhearted", url, header, body]] }],
    }),
  });
  if (!hist.ok) throw new Error(`history ${hist.status}`);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "";
    const cors = corsHeaders(origin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return new Response("method", { status: 405, headers: cors });
    if (!env.SHEET_ID || !env.SA_EMAIL || !env.SA_KEY || !env.HMAC_SECRET) {
      return new Response("unavailable", { status: 503, headers: cors });
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("bad json", { status: 400, headers: cors });
    }
    const slug = String(body.slug || "");
    const action = body.action === "unheart" ? "unheart" : body.action === "heart" ? "heart" : "";
    const contributor = String(body.contributor || "");
    if (!SLUG.test(slug) || !action || !UUID.test(contributor)) {
      return new Response("bad request", { status: 400, headers: cors });
    }
    const hash = await hmacHex(env.HMAC_SECRET, `${contributor}\0${slug}`);
    const header = clip(body.header, 80);
    const bodyName = clip(body.body, 80);
    try {
      await applyFavorite(env, { slug, action, hash, header, body: bodyName });
    } catch (err) {
      return new Response("sheet error", { status: 502, headers: cors });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...cors, "content-type": "application/json" },
    });
  },
};
