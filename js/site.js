(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header: solid background once the page scrolls (always solid on pages without a hero) */
  var head = document.querySelector(".site-head");
  var hasHero = !!document.querySelector(".hero");
  function onScroll() { if (head) head.classList.toggle("solid", !hasHero || window.scrollY > 40); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  var btn = document.querySelector(".menu-btn");
  if (btn) btn.addEventListener("click", function () {
    var open = document.body.classList.toggle("menu-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  /* Hero slideshow */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero figure"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
  var cap = document.querySelector(".hero-cap");
  var cur = 0, timer = null;
  function show(i) {
    if (!slides.length) return;
    slides[cur].classList.remove("on"); if (dots[cur]) dots[cur].setAttribute("aria-current", "false");
    cur = (i + slides.length) % slides.length;
    var img = slides[cur].querySelector("img");
    if (img && img.dataset.src) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
    slides[cur].classList.add("on"); if (dots[cur]) dots[cur].setAttribute("aria-current", "true");
    if (cap) cap.textContent = slides[cur].dataset.cap || "";
  }
  function start() { if (reduce || slides.length < 2) return; clearInterval(timer); timer = setInterval(function () { show(cur + 1); }, 6500); }
  dots.forEach(function (d, i) { d.addEventListener("click", function () { show(i); start(); }); });
  if (slides.length) { show(0); start(); }

  /* Lightbox */
  var items = Array.prototype.slice.call(document.querySelectorAll(".grid figure"));
  if (!items.length) return;
  var lb = document.createElement("div");
  lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo viewer"); lb.hidden = true;
  var arrow = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; };
  lb.innerHTML =
    '<div class="lb-top"><span class="lb-count"></span><button type="button" class="lb-close">Close</button></div>' +
    '<div class="lb-stage"><img alt=""><button type="button" class="lb-nav lb-prev" aria-label="Previous photo">' + arrow("M15 4 7 12l8 8") + '</button>' +
    '<button type="button" class="lb-nav lb-next" aria-label="Next photo">' + arrow("M9 4l8 8-8 8") + '</button></div>' +
    '<div class="lb-bottom"><div class="lb-cap"><h3></h3><p></p><span class="lb-exif"></span></div><a class="lb-print" href="about.html#prints">Inquire about a print</a></div>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector(".lb-stage img"), idx = 0, lastFocus = null;
  function render() {
    var f = items[idx], d = f.dataset;
    lbImg.classList.add("loading");
    lbImg.onload = function () { lbImg.classList.remove("loading"); };
    lbImg.src = d.full; lbImg.alt = d.title + ", " + d.place;
    lb.querySelector("h3").textContent = d.title;
    lb.querySelector(".lb-cap p").textContent = d.place + " · " + d.year;
    lb.querySelector(".lb-exif").textContent = d.exif || "";
    lb.querySelector(".lb-count").textContent = String(idx + 1).padStart(2, "0") + " / " + String(items.length).padStart(2, "0");
    lb.querySelector(".lb-print").href = "about.html#prints";
    [items[idx + 1], items[idx - 1]].forEach(function (n) { if (n) { var p = new Image(); p.src = n.dataset.full; } });
  }
  function open(i) { lastFocus = document.activeElement; idx = i; lb.hidden = false; render(); requestAnimationFrame(function () { lb.classList.add("open"); }); document.documentElement.style.overflow = "hidden"; lb.querySelector(".lb-close").focus(); }
  function close() { lb.classList.remove("open"); document.documentElement.style.overflow = ""; setTimeout(function () { lb.hidden = true; }, 300); if (lastFocus) lastFocus.focus(); }
  function step(n) { idx = (idx + n + items.length) % items.length; render(); }
  items.forEach(function (f, i) { var a = f.querySelector("a"); a.addEventListener("click", function (e) { e.preventDefault(); open(i); }); });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { step(1); });
  lb.querySelector(".lb-stage").addEventListener("click", function (e) { if (e.target === this) close(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close(); else if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1);
  });
  var x0 = null;
  lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1); x0 = null; });
})();
