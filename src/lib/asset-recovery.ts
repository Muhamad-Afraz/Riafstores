/**
 * Inline boot guard for the document shell.
 *
 * Next.js dev (and occasionally a newly deployed production build) can hand
 * the browser a stale HTML/CSS/chunk graph: the page then renders as raw,
 * unstyled text with oversized icons until the dev server is restarted. This
 * script detects that state and reloads once so the browser recovers on its
 * own. A short cooldown prevents reload loops if the server is truly broken.
 */
export const assetRecoveryScript = `
(function () {
  var KEY = "riaf:asset-recovery";
  var WINDOW_MS = 60000;
  var MAX_RELOADS = 3;

  function recover() {
    try {
      var now = Date.now();
      var state = null;
      try {
        state = JSON.parse(window.sessionStorage.getItem(KEY) || "null");
      } catch (error) {
        state = null;
      }
      if (!state || typeof state.at !== "number" || now - state.at > WINDOW_MS) {
        state = { at: now, count: 0 };
      }
      if (state.count >= MAX_RELOADS) return;
      state.count += 1;
      window.sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch (error) {
      // Without storage we cannot count attempts, so don't risk a reload loop.
      return;
    }
    window.location.reload();
  }

  function appStylesheetMissing() {
    var links = document.querySelectorAll(
      'link[rel="stylesheet"][href*="/_next/static/css/"]'
    );
    if (links.length === 0) return false;
    for (var index = 0; index < links.length; index += 1) {
      if (links[index].sheet) return false;
    }
    return true;
  }

  function unstyled() {
    if (!document.body) return false;
    var background = window.getComputedStyle(document.body).backgroundColor;
    return background === "rgba(0, 0, 0, 0)" || background === "transparent";
  }

  function verify() {
    if (appStylesheetMissing() || unstyled()) recover();
  }

  document.addEventListener(
    "error",
    function (event) {
      var target = event.target;
      if (!target || !target.tagName) return;
      if (target.tagName === "SCRIPT") {
        recover();
        return;
      }
      if (target.tagName === "LINK") {
        var rel = (target.getAttribute("rel") || "").toLowerCase();
        if (rel === "stylesheet") recover();
      }
    },
    true
  );

  function checkChunk(message) {
    if (!message) return;
    if (
      /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed/i.test(
        String(message)
      )
    ) {
      recover();
    }
  }

  window.addEventListener("error", function (event) {
    checkChunk(event.message);
  });

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    checkChunk((reason && (reason.message || reason)) || "");
  });

  window.addEventListener("load", function () {
    window.setTimeout(verify, 400);
  });

  window.addEventListener("pageshow", function (event) {
    if (event.persisted) window.setTimeout(verify, 400);
  });
})();
`;
