/*!
 * BakedGood — cookie consent that asks only what each place legally requires.
 *
 * One file, no dependencies. A site calls:
 *
 *   BakedGood.init({
 *     measurementId: "G-XXXXXXX",        // Google Analytics 4
 *     siteName: "Party Pal",
 *     policyUrl: "/privacy-app",
 *     geoUrl: "https://…/geo",           // returns { country, region }
 *     theme: { … },                      // optional, see DEFAULT_THEME
 *     onChange: (record) => { … },       // optional: save the answer to an account
 *   });
 *
 * To make the answer follow a signed-in person across browsers and domains,
 * store the record onChange hands you and pass it back to
 * BakedGood.restore(record) once they sign in anywhere else.
 *
 * and puts `data-bakedgood-choices` on any link or button that should open
 * the "Your privacy choices" panel.
 *
 * The rule (decided 2026-09-21): in every state and country, ask for exactly
 * what the law there requires and nothing more. See RULES.md for the sources.
 */
(function () {
  "use strict";

  // ── Where the visitor is → which tier of rules applies ──────────────────

  // Opt-in: nothing runs until the visitor says yes; saying no must be as
  // easy as saying yes.
  const OPT_IN = new Set([
    // EU + EEA (ePrivacy Art. 5(3) + GDPR)
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
    "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
    "SE", "IS", "LI", "NO",
    // Crown dependencies keep the pre-2026 UK-style consent rule
    "GG", "JE", "IM",
    // Turkey (KVKK), South Korea (PIPA), China (PIPL)
    "TR", "KR", "CN",
  ]);
  // India's DPDP consent duties start 13 May 2027.
  const INDIA_OPT_IN_FROM = Date.UTC(2027, 4, 13);
  // Quebec (Law 25 s. 8.1): tracking must be off by default.
  const OPT_IN_REGIONS = new Set(["CA-QC"]);

  // Tell + let them object: analytics runs, a notice appears once with a
  // settings review. The objection is one click inside that review, rather
  // than competing with the notice's acknowledgement. UK = the Data (Use and Access) Act statistics exemption (needs
  // GA with Google signals off); CH/CA/BR = notice-and-opt-out regimes.
  // Countries not listed anywhere also land here.
  const NOTIFY = new Set(["GB", "CH", "CA", "BR"]);

  function tierFor(geo, now) {
    if (!geo || !geo.country) return "opt-in"; // can't tell → safest fallback
    const c = String(geo.country).toUpperCase();
    const r = geo.region ? `${c}-${String(geo.region).toUpperCase()}` : "";
    if (OPT_IN_REGIONS.has(r) || OPT_IN.has(c)) return "opt-in";
    if (c === "IN" && now >= INDIA_OPT_IN_FROM) return "opt-in";
    // Everywhere outside the opt-in list gets the signed-off minimum: count
    // visits by default, give the required notice, and expose the one
    // analytics objection in settings. Do not add categories or controls.
    return "notify";
  }

  // What Google's consent switches start as, per tier, before any choice.
  // Ad signals stay off wherever the analytics-only allowance depends on it.
  function defaultsFor(tier) {
    if (tier === "opt-in") return { analytics: false, ads: false };
    if (tier === "notify") return { analytics: true, ads: false };
    return { analytics: true, ads: true };
  }

  // ── Stored choice ───────────────────────────────────────────────────────

  const KEY = "bakedgood:v1";
  const DISMISSED_KEY = "bakedgood:notice-dismissed:v1";
  function readChoice() {
    try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); return v && typeof v.analytics === "boolean" ? v : null; }
    catch { return null; }
  }
  function writeChoice(analytics, tier) {
    const v = { analytics, tier, at: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {}
    emitChange();
    return v;
  }
  function noticeDismissed() {
    try { return localStorage.getItem(DISMISSED_KEY) === "1"; } catch { return false; }
  }
  function rememberNoticeDismissal() {
    try { localStorage.setItem(DISMISSED_KEY, "1"); } catch {}
    emitChange();
  }

  // What has been decided on this browser, in one record a site can store
  // against a signed-in account and hand back through restore() elsewhere.
  function current() {
    const c = readChoice();
    const rec = { noticeDismissed: noticeDismissed() };
    if (c) Object.assign(rec, c);
    return c || rec.noticeDismissed ? rec : null;
  }
  function emitChange() {
    const fn = state.cfg && state.cfg.onChange;
    if (typeof fn === "function") { try { fn(current()); } catch {} }
  }

  // Adopt a record saved elsewhere (another browser, device or domain) so a
  // person who already answered is never asked again. Does not re-emit.
  function restore(rec) {
    if (!rec || typeof rec !== "object") return;
    let settled = false;
    if (typeof rec.analytics === "boolean") {
      const v = { analytics: rec.analytics, tier: rec.tier || null, at: rec.at || new Date().toISOString() };
      try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {}
      state.choice = v;
      if (state.tier) apply(v.analytics);
      settled = true;
    }
    if (rec.noticeDismissed) {
      try { localStorage.setItem(DISMISSED_KEY, "1"); } catch {}
      settled = true;
    }
    if (settled && !state.preview && state.ui && state.ui.kind === "banner") closeUI();
  }

  // ── Geo ─────────────────────────────────────────────────────────────────

  const GEO_KEY = "bakedgood:geo";
  async function locate(url) {
    try { const c = JSON.parse(sessionStorage.getItem(GEO_KEY) || "null"); if (c) return c; } catch {}
    if (!url) return null;
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 2000);
      const res = await fetch(url, { signal: ctl.signal, credentials: "omit" });
      clearTimeout(t);
      if (!res.ok) return null;
      const g = await res.json();
      const geo = { country: g.country || null, region: g.region || null };
      try { sessionStorage.setItem(GEO_KEY, JSON.stringify(geo)); } catch {}
      return geo;
    } catch { return null; }
  }

  // ── Google Analytics with Consent Mode v2 ───────────────────────────────

  let gaLoaded = false;
  function gtag() { window.dataLayer.push(arguments); }

  function consentState(analytics, ads) {
    const g = (on) => (on ? "granted" : "denied");
    return { analytics_storage: g(analytics), ad_storage: g(ads), ad_user_data: g(ads), ad_personalization: g(ads) };
  }

  function loadGA(id, analytics, ads) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || gtag;
    if (gaLoaded) { window.gtag("consent", "update", consentState(analytics, ads)); return; }
    // Basic consent mode: gtag.js is only fetched once analytics is allowed,
    // so nothing (not even a cookieless ping) reaches Google before that.
    if (!analytics) return;
    gaLoaded = true;
    window.gtag("consent", "default", consentState(analytics, ads));
    // pageConfigures: the page queues its own js/config calls on dataLayer (so it can
    // attach extra properties); gtag.js replays them once it loads, so skip ours.
    if (!(state.cfg && state.cfg.pageConfigures)) {
      window.gtag("js", new Date());
      window.gtag("config", id, { allow_google_signals: ads, allow_ad_personalization_signals: ads });
    }
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
  }

  function stopGA() {
    if (gaLoaded) window.gtag("consent", "update", consentState(false, false));
    // Clear the analytics cookies already set on this site.
    const host = location.hostname;
    const domains = ["", host, "." + host, "." + host.split(".").slice(-2).join(".")];
    for (const name of document.cookie.split(";").map((c) => c.split("=")[0].trim())) {
      if (!/^_ga(_|$)|^_gid$|^_gat/.test(name)) continue;
      for (const d of domains) {
        document.cookie = `${name}=; Max-Age=0; path=/${d ? "; domain=" + d : ""}`;
      }
    }
  }

  // ── UI ──────────────────────────────────────────────────────────────────
  //
  // BakedGood owns behavior (when to show, what each button does) and where
  // the banner sits. How it LOOKS belongs to the app it lives in:
  //
  //   ui.classes   → built from the app's own CSS classes, in the page itself,
  //                  so padding, type, buttons and motion are the app's.
  //   ui.render    → headless: the app draws everything; BakedGood hands it
  //                  the copy and the actions.
  //   (neither)    → fallback: an isolated card themed only by `theme` tokens.
  //
  // ui.placement: "bottom" (default) | "bottom-left" | "bottom-right" | "bar"
  //               | "inline" (renders into the app's [data-bakedgood-slot]).
  // The banner opens the review panel; visitors save their available choice there.

  const DEFAULT_THEME = {
    font: "inherit",
    surface: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    border: "#e5e7eb",
    buttonBg: "#ffffff",
    buttonText: "#111827",
    buttonBorder: "#d1d5db",
    focus: "#2563eb",
    radius: "16px",
    buttonRadius: "8px",
    shadow: "0 8px 32px rgba(0,0,0,.16)",
  };
  // offset = gap from the screen edges; bottom / bottomMobile let a site clear
  // its own fixed footer. width caps the card outside "bar" and "inline".
  const DEFAULT_UI = { placement: "bottom", offset: "16px", bottom: null, bottomMobile: "8px", width: "560px", gap: "16px" };

  const COPY = {
    optIn: () => "We use cookies.",
    notify: () => "We use cookies.",
    allow: "Allow",
    deny: "Don't allow",
    review: "Review settings",
    acknowledge: "Acknowledge",
    policy: "Privacy policy",
    panelTitle: "Cookie preferences",
    essential: "Essential cookies",
    alwaysActive: "Always active",
    // Each category says what it's for and what it doesn't do, in a line or
    // two, so nobody has to wonder about misuse. Keep the "doesn't" claims
    // true for every tier: ads stay off everywhere (defaultsFor) and no site
    // ties analytics to an account. Sites can reword with init({ copy }).
    essentialDesc: "Keep the site working and remember this choice. They don't track you, so they're always on.",
    toggle: "Analytics",
    // Opt-in places (EU/EEA, UK, Quebec, Turkey, Korea, China) must also say
    // which third party can read the cookies and how long they last
    // (CJEU Planet49), so consent there is informed. Everywhere else the
    // benefit line stands alone.
    toggleDetailOptIn: "Run by Google Analytics; its cookies last up to 2 years.",
    toggleDesc: "Shows us where people get stuck, so we can make the site easier to use. No ads, never sold, and not tied to your name or email.",
    save: "Save and close",
  };

  // Class names used by the token fallback (styled by tokenCss below).
  const TOKEN_CLASSES = {
    card: "bg-card", title: "bg-title", text: "bg-text", muted: "bg-muted",
    link: "bg-link", actions: "bg-actions", button: "bg-button",
  };

  // Placement is behavior, so BakedGood always owns it — nothing visual here.
  function placementCss(ui) {
    return `
[data-bakedgood]{position:fixed;z-index:2147483000;left:${ui.offset};right:${ui.offset};bottom:${ui.bottom || ui.offset};
  display:flex;justify-content:center;pointer-events:none}
[data-bakedgood][data-placement="bottom-left"]{justify-content:flex-start}
[data-bakedgood][data-placement="bottom-right"]{justify-content:flex-end}
[data-bakedgood][data-placement="bar"]{left:0;right:0;bottom:0}
[data-bakedgood][data-placement="inline"]{position:static;display:block}
[data-bakedgood][data-bakedgood-modal]{inset:0;left:0;right:0;bottom:0;padding:24px;
  display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.48);
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);pointer-events:auto}
[data-bakedgood][data-bakedgood-modal][data-placement="inline"]{position:fixed}
@media (max-width:480px){[data-bakedgood]:not([data-placement="bar"]):not([data-placement="inline"]){left:8px;right:8px;bottom:${ui.bottomMobile};justify-content:center}}`;
  }

  // Structural rules inside the banner (sizing, row layout, the switch).
  // `p` scopes them: "[data-bakedgood] " in the page, "" inside a shadow root.
  function structureCss(ui, p, fill, t) {
    return `
${p}[data-bg-root]{pointer-events:auto;box-sizing:border-box;width:100%;max-width:${fill ? "none" : ui.width};margin:0}
${p}[data-bakedgood-modal] [data-bg-root]{max-width:min(${ui.width}, 100%)}
${p}[data-bg-body]{margin:0}
${p}[data-bg-stack]{display:flex;flex-direction:column;gap:${ui.gap}}
${p}[data-bg-actions]:not([class]){display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
${p}[data-bg-actions]>*{flex:1 1 0}
${p}[data-bg-switch-row]{display:flex;align-items:center;justify-content:space-between;gap:16px}
${p}[data-bg-category]{padding:16px 0;border-top:1px solid ${t.border}}
${p}[data-bg-desc]{margin:8px 0 0;font-size:13px;line-height:1.4}
${p}[data-bg-category]:first-of-type{padding-top:0;border-top:0}
${p}[data-bg-switch]{position:relative;flex:none;width:48px;height:24px;padding:0;border-radius:999px;cursor:pointer;
  border:1px solid var(--bg-switch-off, ${t.border});background:var(--bg-switch-off, ${t.border})}
${p}[data-bg-switch]::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;
  background:var(--bg-switch-thumb, ${t.surface});box-shadow:0 1px 2px rgba(0,0,0,.24);transition:transform .15s ease-out}
${p}[data-bg-switch][aria-checked="true"]{background:var(--bg-switch-on, ${t.focus});border-color:var(--bg-switch-on, ${t.focus})}
${p}[data-bg-switch][aria-checked="true"]::after{transform:translateX(24px)}
${p}[data-bg-switch][disabled]{cursor:default;opacity:.72}
@media (prefers-reduced-motion: reduce){${p}[data-bg-switch]::after{transition:none}}
@media (max-width:480px){${p}[data-bg-root]{max-width:none}}`;
  }

  // The isolated fallback look, for sites that haven't mapped their classes.
  function tokenCss(t) {
    return `
:host{font-family:inherit}
.bg-card{font-family:${t.font};font-size:14px;line-height:1.5;color:${t.text};background:${t.surface};
  border:1px solid ${t.border};border-radius:${t.radius};box-shadow:${t.shadow};padding:16px 24px;
  text-align:left;letter-spacing:normal;text-transform:none;font-weight:400;
  display:flex;flex-direction:column;gap:16px}
.bg-title{font-size:16px;font-weight:600}
.bg-muted{color:${t.muted}}
.bg-link{color:inherit}
.bg-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
.bg-button{font:inherit;font-weight:600;cursor:pointer;padding:12px 24px;border-radius:${t.buttonRadius};
  border:1px solid ${t.buttonBorder};background:${t.buttonBg};color:${t.buttonText}}
.bg-button:focus-visible,.bg-link:focus-visible,[data-bg-switch]:focus-visible{outline:2px solid ${t.focus};outline-offset:2px}
:host{--bg-switch-on:${t.focus};--bg-switch-off:${t.border};--bg-switch-thumb:${t.surface}}
@media (max-width:480px){.bg-card{padding:16px}}`;
  }

  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      // Skip missing values and empty class lists; empty data-* markers stay.
      if (v === undefined || v === null || (k === "class" && v === "")) continue;
      if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const c of children || []) if (c) n.appendChild(c);
    return n;
  }

  let placementInjected = false;
  function mount(content, modal) {
    const ui = state.cfg.ui;
    const slot = ui.placement === "inline" && document.querySelector("[data-bakedgood-slot]");
    const placement = ui.placement === "inline" && !slot ? "bottom" : ui.placement;
    const fill = placement === "bar" || placement === "inline";
    const host = el("div", { "data-bakedgood": "", "data-placement": placement, "data-bakedgood-modal": modal ? "" : null });
    if (!placementInjected) {
      document.head.appendChild(el("style", { "data-bakedgood-placement": "", text: placementCss(ui) }));
      placementInjected = true;
    }
    content.setAttribute("data-bg-root", "");
    if (state.mode === "tokens") {
      // Isolated so the site's CSS can't reach in (and ours can't leak out).
      const root = host.attachShadow({ mode: "open" });
      root.appendChild(el("style", { text: structureCss(ui, "", fill, state.cfg.theme) + tokenCss(state.cfg.theme) }));
      root.appendChild(content);
    } else {
      host.appendChild(el("style", { text: structureCss(ui, "[data-bakedgood] ", fill, state.cfg.theme) }));
      host.appendChild(content);
    }
    (slot || document.body).appendChild(host);
    return { host };
  }

  // One tree for both the banner and the choices panel, dressed in whichever
  // classes the mode supplies.
  function view(kind) {
    const { cfg, tier } = state;
    const C = state.classes;
    const optIn = tier === "opt-in";
    const policy = el("a", { class: C.link, href: cfg.policyUrl, text: COPY.policy });
    const btn = (text, onclick) => el("button", { type: "button", class: C.button, text, onclick });

    if (kind === "banner") {
      const body = el("p", { class: C.text, "data-bg-body": "" }, [
        document.createTextNode((optIn ? COPY.optIn : COPY.notify)(cfg.siteName) + " "), policy,
      ]);
      const actions = optIn
        ? [btn(COPY.deny, () => choose(false)), btn(COPY.review, openChoices), btn(COPY.allow, () => choose(true))]
        // Notice places: keep the defaults in one tap, or open the panel to change them.
        : [btn(COPY.review, openChoices), btn(COPY.acknowledge, acknowledge)];
      return el("div", { class: C.card, role: "region", "aria-label": COPY.panelTitle, "data-bg-stack": "" }, [
        body, el("div", { class: C.actions, "data-bg-actions": "" }, actions),
      ]);
    }

    let checked = currentAnalytics();
    const sw = el("button", { type: "button", role: "switch", "data-bg-switch": "", "aria-labelledby": "bg-analytics-label", class: C.switch });
    const sync = () => sw.setAttribute("aria-checked", String(checked));
    sw.addEventListener("click", () => { checked = !checked; sync(); });
    sync();
    setTimeout(() => sw.focus(), 0);
    const essential = el("span", { class: C.muted, text: COPY.alwaysActive });
    const row = (title, control, desc) => el("section", { "data-bg-category": "" }, [
      el("div", { "data-bg-switch-row": "" }, [el("strong", { class: C.text, text: title }), control]),
      el("p", { class: C.muted, "data-bg-desc": "", text: desc }),
    ]);
    return el("div", { class: C.card, role: "dialog", "aria-modal": "true", "aria-labelledby": "bg-title", "data-bg-stack": "" }, [
      el("h2", { class: C.title, id: "bg-title", "data-bg-body": "", text: COPY.panelTitle }),
      row(COPY.essential, essential, COPY.essentialDesc),
      row(COPY.toggle, sw, optIn ? `${COPY.toggleDesc} ${COPY.toggleDetailOptIn}` : COPY.toggleDesc),
      el("div", { class: C.actions, "data-bg-actions": "" }, [
        // One "Save and close" button, so a flipped switch can't be lost to a separate Close.
        btn(COPY.save, () => choose(checked)),
      ]),
    ]);
  }

  // Headless mode hands the app everything it needs to draw its own UI.
  function headless(kind) {
    const optIn = state.tier === "opt-in";
    state.cfg.ui.render({
      kind, tier: state.tier, siteName: state.cfg.siteName, policyUrl: state.cfg.policyUrl,
      analytics: currentAnalytics(),
      copy: kind === "banner"
        ? {
          body: (optIn ? COPY.optIn : COPY.notify)(state.cfg.siteName),
          yes: optIn ? COPY.allow : null,
          no: optIn ? COPY.deny : null,
          review: COPY.review,
          acknowledge: optIn ? null : COPY.acknowledge,
        }
        : { title: COPY.panelTitle, essential: COPY.essential, essentialDesc: COPY.essentialDesc, alwaysActive: COPY.alwaysActive, toggle: COPY.toggle, toggleDesc: optIn ? `${COPY.toggleDesc} ${COPY.toggleDetailOptIn}` : COPY.toggleDesc, save: COPY.save },
      ...(optIn ? { yes: () => choose(true), no: () => choose(false) } : {}),
      review: openChoices,
      ...(optIn ? {} : { acknowledge }),
      save: (on) => choose(!!on),
      close: closeChoices,
    });
    state.ui = { headless: true, kind };
  }

  // ── Main ────────────────────────────────────────────────────────────────

  const state = { cfg: null, mode: "tokens", classes: TOKEN_CLASSES, tier: null, choice: null, ui: null, reviewingBanner: false };

  function apply(analytics) {
    const ads = analytics && defaultsFor(state.tier).ads;
    if (analytics) loadGA(state.cfg.measurementId, true, ads);
    else stopGA();
  }

  function closeUI() {
    if (!state.ui) return;
    if (state.ui.headless) state.cfg.ui.render(null);
    else state.ui.host.remove();
    state.ui = null;
  }

  function choose(analytics) {
    state.choice = writeChoice(analytics, state.tier);
    state.reviewingBanner = false;
    apply(analytics);
    closeUI();
  }

  function show(kind) {
    closeUI();
    if (state.mode === "headless") return headless(kind);
    state.ui = { ...mount(view(kind), kind === "choices"), kind };
  }

  function showBanner() { show("banner"); }

  function openChoices() {
    if (!state.cfg) return;
    state.reviewingBanner = !!(state.ui && state.ui.kind === "banner");
    show("choices");
  }

  function acknowledge() {
    rememberNoticeDismissal();
    closeUI();
  }

  function closeChoices() {
    if (state.reviewingBanner) rememberNoticeDismissal();
    state.reviewingBanner = false;
    closeUI();
  }

  function currentAnalytics() {
    if (state.choice) return state.choice.analytics;
    return defaultsFor(state.tier || "opt-in").analytics;
  }

  async function init(cfg) {
    if (state.cfg) return;
    if (!cfg || !cfg.measurementId) throw new Error("BakedGood: measurementId is required");
    if (cfg.copy) Object.assign(COPY, cfg.copy);
    state.cfg = {
      siteName: "This site",
      policyUrl: "/privacy",
      ...cfg,
      theme: { ...DEFAULT_THEME, ...(cfg.theme || {}) },
      ui: { ...DEFAULT_UI, ...(cfg.ui || {}) },
    };
    const ui = state.cfg.ui;
    if (typeof ui.render === "function") state.mode = "headless";
    else if (ui.classes) {
      state.mode = "classes";
      // Unmapped roles get no class at all, so they inherit the app's own
      // defaults instead of anything BakedGood invents.
      state.classes = { card: "", title: "", text: "", muted: "", link: "", actions: "", button: "", switch: "", ...ui.classes };
    }
    document.addEventListener("click", (e) => {
      const t = e.target instanceof Element && e.target.closest("[data-bakedgood-choices]");
      if (t) { e.preventDefault(); openChoices(); }
    });

    const geo = cfg.geo || (await locate(cfg.geoUrl));
    state.tier = tierFor(geo, Date.now());
    // quietOutsideOptIn sites keep their "Your privacy choices" link hidden
    // (<a hidden data-bakedgood-choices>) and reveal it only where a choice is owed.
    if (state.cfg.quietOutsideOptIn && state.tier === "opt-in") {
      const reveal = () => document.querySelectorAll("[data-bakedgood-choices][hidden]").forEach((n) => n.removeAttribute("hidden"));
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", reveal, { once: true }); else reveal();
    }
    // Read after the geo wait: restore() may have landed a saved choice.
    state.choice = readChoice();

    // ?bakedgood-preview shows the banner even after an answer, so the site
    // owner can check copy and layout. Nothing is saved unless they choose.
    let preview = false;
    try { preview = new URLSearchParams(location.search).has("bakedgood-preview"); } catch {}
    state.preview = preview;
    if (state.choice) { apply(state.choice.analytics); if (!preview) return; }
    else apply(defaultsFor(state.tier).analytics);
    if (noticeDismissed() && !preview) return;
    // quietOutsideOptIn: sites that only owe a choice where the law is opt-in
    // (Europe etc.) show nothing anywhere else; analytics behaves as it did before.
    if (state.cfg.quietOutsideOptIn && state.tier !== "opt-in" && !preview) return;
    if (document.body) showBanner();
    else document.addEventListener("DOMContentLoaded", showBanner, { once: true });
  }

  function bannerActionsFor(tier) {
    return tier === "opt-in" ? ["deny", "review", "allow"] : ["review"];
  }

  window.BakedGood = { init, openChoices, restore, current, tierFor, bannerActionsFor, _state: state };
})();
