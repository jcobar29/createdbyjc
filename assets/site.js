(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");
  doc.classList.add("js");
  var cfg = window.CBJ_CONFIG || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(key, value) {
    try { if (value === undefined) return sessionStorage.getItem(key); sessionStorage.setItem(key, value); } catch (e) { return null; }
  }

  /* ---------- Header state ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll reveals (content is visible at rest; this only adds a soft entrance) ---------- */
  var revealEls = document.querySelectorAll(".reveal, .month");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Button hover light follows pointer ---------- */
  document.addEventListener("pointermove", function (e) {
    var btn = e.target.closest && e.target.closest(".btn");
    if (!btn) return;
    var r = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", (e.clientX - r.left) + "px");
    btn.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });

  /* ---------- Soft cursor glow (desktop pointer; brief glow at touch point on touch) ---------- */
  if (!reduceMotion) {
    var glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);
    var tx = -500, ty = -500, cx = tx, cy = ty, raf = 0, touchTimer = 0;
    var tick = function () {
      cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
      glow.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5) ? requestAnimationFrame(tick) : 0;
    };
    var moveTo = function (x, y, snap) {
      tx = x; ty = y;
      if (snap) { cx = x; cy = y; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      glow.classList.add("on");
      moveTo(e.clientX, e.clientY, false);
    }, { passive: true });
    document.addEventListener("mouseleave", function () { glow.classList.remove("on"); });
    window.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      moveTo(e.clientX, e.clientY, true);
      glow.classList.add("on");
      clearTimeout(touchTimer);
      touchTimer = setTimeout(function () { glow.classList.remove("on"); }, 700);
    }, { passive: true });
  }

  /* ---------- CTA links focus the first form field ---------- */
  document.querySelectorAll('a[href="#optin"]').forEach(function (a) {
    a.addEventListener("click", function () {
      var input = document.getElementById("first-name");
      if (input) setTimeout(function () { input.focus({ preventScroll: true }); }, reduceMotion ? 0 : 550);
    });
  });

  /* ---------- Image slider ---------- */
  document.querySelectorAll("[data-slider]").forEach(function (root) {
    var track = root.querySelector(".slides");
    var slides = root.querySelectorAll(".slide");
    var dots = root.querySelectorAll(".dots-nav button");
    var live = root.querySelector("[data-slider-status]");
    var i = 0, startX = null, timer = 0;
    var go = function (n, announce) {
      i = (n + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-100 * i) + "%)";
      slides.forEach(function (s, k) { s.setAttribute("aria-hidden", k === i ? "false" : "true"); });
      dots.forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
      if (announce && live) live.textContent = "Slide " + (i + 1) + " of " + slides.length;
    };
    var stop = function () { clearInterval(timer); timer = 0; };
    var play = function () { if (!reduceMotion && !timer) timer = setInterval(function () { go(i + 1, false); }, 6000); };
    root.querySelector("[data-slide-prev]").addEventListener("click", function () { stop(); go(i - 1, true); });
    root.querySelector("[data-slide-next]").addEventListener("click", function () { stop(); go(i + 1, true); });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { stop(); go(k, true); }); });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { stop(); go(i - 1, true); }
      if (e.key === "ArrowRight") { stop(); go(i + 1, true); }
    });
    root.addEventListener("pointerenter", stop);
    root.addEventListener("focusin", stop);
    track.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; stop(); }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1, true);
      startX = null;
    });
    go(0, false);
    play();
  });

  /* ---------- Opt-in form ---------- */
  var form = document.getElementById("optin-form");
  if (form) {
    var nameEl = form.querySelector("#first-name");
    var emailEl = form.querySelector("#email");
    var btn = form.querySelector("button[type=submit]");
    var status = form.querySelector(".form-status");
    var btnLabel = btn.innerHTML;
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var setError = function (input, msg) {
      var err = document.getElementById(input.id + "-error");
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    };
    var validate = function () {
      var ok = true, first = null;
      var n = nameEl.value.trim(), m = emailEl.value.trim();
      if (n.length < 2) { setError(nameEl, n ? "Pakilagay yung buong first name mo." : "Pakilagay yung first name mo."); ok = false; first = first || nameEl; }
      else setError(nameEl, "");
      if (!m) { setError(emailEl, "Pakilagay yung email address mo."); ok = false; first = first || emailEl; }
      else if (!EMAIL_RE.test(m)) { setError(emailEl, "Mukhang kulang yung email. Example: juan@business.com"); ok = false; first = first || emailEl; }
      else setError(emailEl, "");
      if (first) first.focus();
      return ok;
    };
    [nameEl, emailEl].forEach(function (el) {
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") setError(el, ""); });
    });
    var setStatus = function (kind, html) {
      status.className = "form-status" + (kind ? " is-" + kind : "");
      status.innerHTML = html || "";
    };
    var busy = function (on) {
      btn.disabled = on;
      btn.innerHTML = on ? '<span class="spinner" aria-hidden="true"></span> Sending…' : btnLabel;
      form.setAttribute("aria-busy", on ? "true" : "false");
    };
    var goThankYou = function (firstName) {
      store("cbj_first_name", firstName);
      window.location.href = form.getAttribute("data-next") || "thank-you.html";
    };

    /* Saves to the configured endpoint. With no endpoint, nothing is saved and the visitor is told so. */
    var saveLead = function (lead) {
      if (cfg.leadEndpoint) {
        return fetch(cfg.leadEndpoint, {
          method: "POST",
          /* text/plain keeps this a "simple" request, which Google Apps Script accepts without a CORS preflight */
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(lead),
          redirect: "follow"
        }).then(function (res) {
          if (!res.ok) throw new Error("http_" + res.status);
          return res.json().catch(function () { return { ok: true }; });
        }).then(function (data) {
          if (data && data.ok === false) throw new Error(data.error || "rejected");
          return "saved";
        });
      }
      return Promise.resolve("unconnected");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("", "");
      if (!validate()) return;
      var lead = {
        firstName: nameEl.value.trim(),
        email: emailEl.value.trim().toLowerCase(),
        source: "30-day-content-to-sales-roadmap",
        page: location.href.split("#")[0],
        createdAt: new Date().toISOString()
      };
      busy(true);
      saveLead(lead).then(function (result) {
        if (result === "saved") {
          setStatus("success", "Got it, " + lead.firstName.replace(/[<>&"]/g, "") + "! Opening your roadmap page…");
          setTimeout(function () { goThankYou(lead.firstName); }, 500);
          return;
        }
        busy(false);
        setStatus("info", "Heads up: hindi pa naka-connect ang form na ’to sa email list, kaya hindi na-save yung details mo. " +
          'Pwede mo pa ring <a href="' + (form.getAttribute("data-next") || "thank-you.html") + '">buksan ang roadmap page</a> ' +
          'o mag-message kay createdbyjc sa <a href="' + (cfg.facebookUrl || "#") + '" target="_blank" rel="noopener">Facebook</a>.');
      }).catch(function () {
        busy(false);
        setStatus("error", "Hindi na-send yung form. Try ulit after a minute. Kung ayaw pa rin, mag-message kay createdbyjc sa " +
          '<a href="' + (cfg.facebookUrl || "#") + '" target="_blank" rel="noopener">Facebook</a> para makuha mo yung roadmap.');
      });
    });
  }

  /* ---------- Thank-you page ---------- */
  var hello = document.querySelector("[data-hello]");
  if (hello) {
    var fn = store("cbj_first_name");
    if (fn) { hello.textContent = "Salamat, " + fn + "!"; hello.hidden = false; }
  }
  var roadmapBtn = document.querySelector("[data-roadmap-link]");
  if (roadmapBtn) {
    var pending = document.querySelector("[data-roadmap-pending]");
    if (cfg.roadmapUrl) {
      roadmapBtn.href = cfg.roadmapUrl;
      roadmapBtn.removeAttribute("aria-disabled");
      if (pending) pending.hidden = true;
    } else {
      roadmapBtn.removeAttribute("href");
      roadmapBtn.setAttribute("aria-disabled", "true");
      roadmapBtn.setAttribute("role", "link");
      if (pending) pending.hidden = false;
    }
  }
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-facebook]").forEach(function (a) { if (cfg.facebookUrl) a.href = cfg.facebookUrl; });
})();
