/* Hi Bot Code — viewer share-link encoding (HTML/CSS/JS payload in URL fragment) */
(function (global) {
  "use strict";

  function encodeCode(obj) {
    var bytes = new TextEncoder().encode(JSON.stringify(obj));
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function decodeCode(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function buildViewerUrl(viewerPath, payload) {
    var base = viewerPath || "/viewer.html";
    if (base.indexOf("http") !== 0 && typeof location !== "undefined") {
      base = location.origin + (base.charAt(0) === "/" ? base : "/" + base);
    }
    var encoded = encodeURIComponent(encodeCode(payload));
    return base + "#code=" + encoded;
  }

  global.hibotShare = {
    encodeCode: encodeCode,
    decodeCode: decodeCode,
    buildViewerUrl: buildViewerUrl
  };
})(typeof window !== "undefined" ? window : globalThis);
