(function () {
  "use strict";

  var cfg = window.DONATE_CONFIG || {};
  var upi = cfg.upi || {};
  var bank = cfg.bank || {};

  function $(sel) { return document.querySelector(sel); }
  function text(sel, value) { var el = $(sel); if (el) el.textContent = value || ""; }
  function show(sel) { var el = $(sel); if (el) el.hidden = false; }

  // UPI apps expect the '@' in the VPA unescaped.
  function upiUri(amount) {
    if (!upi.id) return "";
    var enc = function (s) { return encodeURIComponent(s).replace(/%40/g, "@"); };
    var q = "pa=" + enc(upi.id.trim());
    if (upi.payeeName) q += "&pn=" + encodeURIComponent(upi.payeeName.trim());
    q += "&cu=INR";
    if (amount) q += "&am=" + String(amount);
    if (upi.note) q += "&tn=" + encodeURIComponent(upi.note.trim());
    return "upi://pay?" + q;
  }

  function currentAmount() {
    var input = $("#amount");
    var n = input ? parseInt(input.value, 10) : NaN;
    return isFinite(n) && n > 0 ? n : 0;
  }

  var QR_TARGET_PX = 256;

  function drawQr(uri) {
    var canvas = $("#qr");
    if (!canvas || !window.qrcodegen) return;
    var qr = qrcodegen.QrCode.encodeText(uri, qrcodegen.QrCode.Ecc.MEDIUM);
    var quiet = 2;
    var modules = qr.size + quiet * 2;
    var scale = Math.max(1, Math.floor(QR_TARGET_PX / modules));
    var side = modules * scale;
    canvas.width = side;
    canvas.height = side;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, side, side);
    ctx.fillStyle = "#000000";
    for (var y = 0; y < qr.size; y++) {
      for (var x = 0; x < qr.size; x++) {
        if (qr.getModule(x, y)) ctx.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
      }
    }
  }

  function refreshUpi() {
    var uri = upiUri(currentAmount());
    var link = $("#upi-link");
    if (link) link.href = uri;
    drawQr(uri);
  }

  function setPressed(value) {
    var chips = document.querySelectorAll("#amounts .chip");
    for (var i = 0; i < chips.length; i++) {
      chips[i].setAttribute("aria-pressed", String(parseInt(chips[i].dataset.amount, 10) === value));
    }
  }

  function buildAmounts() {
    var box = $("#amounts");
    var input = $("#amount");
    if (!box || !input) return;
    (upi.amounts || []).forEach(function (a) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset.amount = String(a);
      b.setAttribute("aria-pressed", "false");
      b.textContent = "₹" + a;
      b.addEventListener("click", function () {
        input.value = String(a);
        setPressed(a);
        refreshUpi();
      });
      box.appendChild(b);
    });
    input.addEventListener("input", function () { setPressed(currentAmount()); refreshUpi(); });
    var clear = $("#amount-clear");
    if (clear) clear.addEventListener("click", function () { input.value = ""; setPressed(0); refreshUpi(); });
  }

  var toastTimer = 0;
  function toast(msg) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 1600);
  }

  function copyText(value, button) {
    var done = function () {
      toast("Copied");
      if (button) {
        var old = button.textContent;
        button.textContent = "Copied";
        button.classList.add("copied");
        setTimeout(function () { button.textContent = old; button.classList.remove("copied"); }, 1400);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, function () { fallbackCopy(value); done(); });
    } else {
      fallbackCopy(value);
      done();
    }
  }

  function fallbackCopy(value) {
    var ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { }
    document.body.removeChild(ta);
  }

  function wireCopyButtons() {
    var buttons = document.querySelectorAll("[data-copy]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (ev) {
        var btn = ev.currentTarget;
        var target = $(btn.dataset.copy);
        if (!target) return;
        var attr = btn.dataset.copyAttr;
        var value = attr ? target.getAttribute(attr) : target.textContent;
        if (value) copyText(value.trim(), btn);
      });
    }
  }

  function initUpi() {
    if (!upi.id || upi.id.indexOf("@") < 0) return;
    text("#upi-id", upi.id.trim());
    text("#upi-payee", upi.payeeName || "—");
    buildAmounts();
    show("#upi");
    refreshUpi();
  }

  function initBank() {
    if (!bank.account || !bank.ifsc) return;
    text("#bank-holder", bank.holder);
    text("#bank-name", bank.name);
    text("#bank-account", bank.account);
    text("#bank-ifsc", String(bank.ifsc).toUpperCase());
    show("#bank");
  }

  function initLinks() {
    var store = $("#store-link");
    if (store) {
      // ms-windows-store: only resolves on Windows.
      var onWindows = /Windows/i.test(navigator.userAgent);
      var href = (onWindows && cfg.storeUrl) ? cfg.storeUrl : (cfg.storeWebUrl || cfg.storeUrl || "");
      if (href) store.href = href; else store.closest(".card").hidden = true;
    }
    var map = { "#repo-link": cfg.repoUrl, "#issues-link": cfg.issuesUrl, "#privacy-link": cfg.privacyUrl };
    Object.keys(map).forEach(function (sel) {
      var a = $(sel);
      if (!a) return;
      if (map[sel]) a.href = map[sel]; else a.hidden = true;
    });
  }

  function initEmptyState() {
    if ($("#upi").hidden && $("#bank").hidden) {
      var note = document.createElement("section");
      note.className = "card";
      note.innerHTML = "<h2>Coming soon</h2><p class=\"muted\">Payment details have not been published yet. Please check back later.</p>";
      $(".cards").insertBefore(note, $(".cards").firstChild);
    }
  }

  initUpi();
  initBank();
  initLinks();
  initEmptyState();
  wireCopyButtons();
})();
