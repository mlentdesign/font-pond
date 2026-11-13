// BakedGood setup for Font Pond. Load AFTER bakedgood.js on every page.
// Where the law needs a yes first (Europe and a few other places) analytics waits for
// the visitor's choice. Everywhere else nothing is shown and analytics runs as before.
// bakedgood.js is a byte-for-byte copy of ~/Developer/projects/bakedgood/src/bakedgood.js.
(function () {
  var MEASUREMENT_ID = "G-N6BYH6MQKP";
  var HOSTS = ["fontpond.melware.art"];
  if (!window.BakedGood || HOSTS.indexOf(location.hostname) < 0) return;
  // Also report to the melware.art umbrella property, behind the same choice.
  var UMBRELLA_ID = "G-DVXTH1CEY6";
  window.dataLayer = window.dataLayer || [];
  var dl = window.dataLayer, basePush = dl.push;
  dl.push = function () {
    var r = basePush.apply(dl, arguments);
    var a = arguments[0];
    if (a && a[0] === "config" && a[1] === MEASUREMENT_ID) {
      dl.push = basePush; // once is enough
      window.gtag("config", UMBRELLA_ID);
    }
    return r;
  };

  window.BakedGood.init({
    measurementId: MEASUREMENT_ID,
    siteName: "Font Pond",
    policyUrl: "/privacy.html",
    geoUrl: "https://melware.art/geo",
    quietOutsideOptIn: true,
    theme: {
      font: "inherit",
      surface: "var(--bg-card, #d4edeb)",
      text: "var(--text-heading, #0b2b26)",
      muted: "var(--text-muted, #3f625c)",
      border: "var(--border-card, rgba(0,77,64,.2))",
      buttonBg: "var(--bg-card, #d4edeb)",
      buttonText: "var(--text-heading, #0b2b26)",
      buttonBorder: "var(--border, rgba(0,77,64,.3))",
      focus: "var(--accent, #00695c)",
      radius: "16px",
      buttonRadius: "8px",
    },
    ui: { placement: "bottom", width: "480px" },
  });
})();
