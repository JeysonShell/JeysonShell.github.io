(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) root.classList.add("rm");

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- меню ---------- */
  const menuBtn = $("#menu-btn");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  };
  menuBtn.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- появление блоков ---------- */
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          revealIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );
  $$("[data-reveal]").forEach((el) => revealIO.observe(el));

  /* ---------- счётчики в hero ---------- */
  const counters = $$("[data-count]");
  const fmt = (n, sep) => (sep ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : String(n));
  const runCounters = () => {
    counters.forEach((el) => {
      const end = Number(el.dataset.count);
      const sep = el.dataset.sep === "1";
      if (reduced) return;
      const t0 = performance.now();
      const dur = 1500;
      const step = (now) => {
        const k = clamp((now - t0) / dur);
        el.textContent = fmt(Math.round(end * easeOut(k)), sep);
        if (k < 1) requestAnimationFrame(step);
      };
      el.textContent = fmt(0, sep);
      requestAnimationFrame(step);
    });
  };

  /* ---------- hero: запуск ---------- */
  const hero = $(".hero");
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      hero.classList.add("is-ready");
      setTimeout(runCounters, 500);
    })
  );
  hero.addEventListener(
    "pointermove",
    (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", e.clientX - r.left + "px");
      hero.style.setProperty("--my", e.clientY - r.top + "px");
    },
    { passive: true }
  );

  /* ---------- чтение «по словам» ---------- */
  const read = $("#read");
  const splitWords = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) frag.appendChild(document.createTextNode(t));
          else {
            const s = document.createElement("span");
            s.className = "w";
            s.textContent = t;
            frag.appendChild(s);
          }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) splitWords(n);
    });
  };
  splitWords(read);
  const words = $$(".w", read);
  let wordsOn = -1;

  /* ---------- закреплённые сцены ---------- */
  const exp = $("#experience");
  const stepEls = $$(".step", exp);
  const tickEls = $$("#ticks i");
  const capEls = $$(".phone__cap", exp);
  const shotEls = $$(".phone__shot", exp);
  const phone = $("#phone");
  const STEPS = stepEls.length;
  exp.style.setProperty("--steps", exp.dataset.steps);

  const hs = $("#projects");
  const track = $("#hs-track");
  const hsNow = $("#hs-now");
  const hsBar = $("#hs-bar");
  const cardCount = $$(".card", track).length;
  let hsDist = 0;
  let hsCur = 0;

  const layoutHS = () => {
    if (reduced) return;
    hsDist = Math.max(0, track.scrollWidth - window.innerWidth);
    hs.style.height = Math.round(window.innerHeight + hsDist) + "px";
  };

  const stepsBox = $("#steps");
  const layoutSteps = () => {
    stepsBox.style.minHeight = "";
    const h = Math.max(...stepEls.map((s) => s.offsetHeight));
    stepsBox.style.minHeight = h + "px";
  };

  const pinProgress = (el) => {
    const total = el.offsetHeight - window.innerHeight;
    return total > 0 ? clamp(-el.getBoundingClientRect().top / total) : 0;
  };

  let lastStep = -1;
  const updateExp = () => {
    if (reduced) return;
    const p = pinProgress(exp);
    const sf = p * STEPS;
    const active = clamp(Math.floor(sf + 0.15), 0, STEPS - 1);
    if (active !== lastStep) {
      lastStep = active;
      stepEls.forEach((s, i) => {
        s.classList.toggle("is-active", i === active);
        s.classList.toggle("is-past", i < active);
      });
      capEls.forEach((c, i) => c.classList.toggle("is-active", i === active));
    }
    shotEls.forEach((s, i) => {
      if (i === 0) return;
      const t = ease(clamp((sf - (i - 0.15)) / 0.3));
      s.style.setProperty("--cut", (1 - t) * 100 + "%");
    });
    tickEls.forEach((t, i) => t.style.setProperty("--t", clamp(sf - i)));
    phone.style.setProperty("--ry", (-9 + p * 16).toFixed(2) + "deg");
    phone.style.setProperty("--rx", (3 - p * 3).toFixed(2) + "deg");
  };

  let hsTarget = 0;
  const updateHS = () => {
    if (reduced) return;
    const p = pinProgress(hs);
    hsTarget = p * hsDist;
    const idx = clamp(Math.round(p * (cardCount - 1)), 0, cardCount - 1);
    hsNow.textContent = String(idx + 1).padStart(2, "0");
    hsBar.style.setProperty("--hp", p.toFixed(3));
  };

  /* ---------- главный цикл скролла ---------- */
  const hud = $("#hud");
  const progressBar = $(".progress");
  const navLinks = $$("#nav a[data-nav]");
  const sectionEls = $$("[data-section]");
  const bands = $$(".band__track").map((el) => ({ el, anim: el.getAnimations ? el.getAnimations()[0] : null }));
  const clipEls = $$("[data-clip]");
  let lastY = window.scrollY;
  let vel = 0;
  let pageP = 0;
  let queued = false;
  let activeNav = "";

  const frame = () => {
    queued = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const doc = document.documentElement.scrollHeight - vh;
    pageP = doc > 0 ? clamp(y / doc) : 0;
    progressBar.style.setProperty("--sp", pageP.toFixed(4));
    hud.classList.toggle("is-stuck", y > 12);

    // активный пункт меню
    let current = "";
    for (const s of sectionEls) {
      const r = s.getBoundingClientRect();
      if (r.top <= vh * 0.4 && r.bottom > vh * 0.4) current = s.dataset.section;
    }
    if (current !== activeNav) {
      activeNav = current;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === current));
    }

    // чтение по словам
    const rr = read.getBoundingClientRect();
    const rp = clamp((vh * 0.82 - rr.top) / (rr.height + vh * 0.32));
    const n = reduced ? words.length : Math.min(words.length, Math.floor(rp * (words.length + 2)));
    if (n !== wordsOn) {
      const from = wordsOn < 0 ? 0 : Math.min(n, wordsOn);
      const to = wordsOn < 0 ? words.length : Math.max(n, wordsOn);
      for (let i = from; i < to; i++) words[i].classList.toggle("on", i < n);
      wordsOn = n;
    }

    // раскрытие фото
    clipEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--c", reduced ? 1 : ease(clamp((vh * 0.95 - r.top) / (vh * 0.55))).toFixed(3));
    });

    updateExp();
    updateHS();

    // сглаживание горизонтальной ленты
    hsCur += (hsTarget - hsCur) * 0.14;
    if (Math.abs(hsTarget - hsCur) < 0.3) hsCur = hsTarget;
    track.style.transform = `translate3d(${(-hsCur).toFixed(2)}px,0,0)`;

    // скорость скролла ускоряет ленты-разделители
    vel += (Math.abs(y - lastY) - vel) * 0.2;
    lastY = y;
    const rate = 1 + Math.min(5, vel * 0.12);
    bands.forEach((b) => {
      if (b.anim) b.anim.playbackRate = rate;
    });

    if (!reduced && (Math.abs(hsTarget - hsCur) > 0.3 || vel > 0.05)) request();
  };
  const request = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(frame);
    }
  };
  window.addEventListener("scroll", request, { passive: true });

  let lastW = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth !== lastW) {
      lastW = window.innerWidth;
      layoutHS();
      layoutSteps();
      initCanvas();
    }
    request();
  });

  /* ---------- фон: сеть узлов ---------- */
  const canvas = $("#bg");
  const ctx = canvas.getContext("2d");
  let W = 0;
  let H = 0;
  let dpr = 1;
  let nodes = [];
  const mouse = { x: -999, y: -999 };

  function initCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = clamp(Math.round((W * H) / (W < 700 ? 24000 : 20000)), 24, 72);
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      z: 0.3 + Math.random() * 0.9,
    }));
    if (reduced) drawCanvas();
  }

  function drawCanvas() {
    ctx.clearRect(0, 0, W, H);
    const hue = 165 + pageP * 55;
    const link = 150;
    const off = window.scrollY * 0.06;
    for (const n of nodes) {
      if (!reduced) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = W + 20;
        if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H + 20) n.y = -20;
      }
      n.px = n.x;
      n.py = (((n.y - off * n.z) % H) + H) % H;
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.px - b.px;
        const dy = a.py - b.py;
        const d = dx * dx + dy * dy;
        if (d < link * link) {
          const al = (1 - Math.sqrt(d) / link) * 0.22;
          ctx.strokeStyle = `hsla(${hue},85%,68%,${al})`;
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
          ctx.stroke();
        }
      }
      const md = Math.hypot(a.px - mouse.x, a.py - mouse.y);
      const glow = md < 160 ? 1 - md / 160 : 0;
      ctx.fillStyle = `hsla(${hue},90%,72%,${0.35 + glow * 0.6})`;
      ctx.beginPath();
      ctx.arc(a.px, a.py, 1.3 + a.z * 0.8 + glow * 1.5, 0, Math.PI * 2);
      ctx.fill();
      if (glow > 0.2) {
        ctx.strokeStyle = `hsla(${hue},90%,72%,${glow * 0.35})`;
        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }

  let canvasRunning = false;
  const canvasLoop = () => {
    if (document.hidden) {
      canvasRunning = false;
      return;
    }
    drawCanvas();
    requestAnimationFrame(canvasLoop);
  };
  initCanvas();
  if (!reduced) {
    window.addEventListener(
      "pointermove",
      (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      },
      { passive: true }
    );
    canvasRunning = true;
    canvasLoop();
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !canvasRunning) {
        canvasRunning = true;
        canvasLoop();
      }
    });
  }

  /* ---------- подсветка карточек ---------- */
  $$(".lab-card").forEach((card) => {
    card.addEventListener(
      "pointermove",
      (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      },
      { passive: true }
    );
  });

  /* ---------- лайтбокс ---------- */
  const lb = $("#lb");
  const lbImg = $("#lb-img");
  const lbCap = $("#lb-cap");
  const lbCount = $("#lb-count");
  const lbPrev = $("#lb-prev");
  const lbNext = $("#lb-next");
  const lbClose = $("#lb-close");
  const galleries = new Map();
  $$("a[data-gallery]").forEach((a) => {
    const k = a.dataset.gallery;
    if (!galleries.has(k)) galleries.set(k, []);
    galleries.get(k).push({ idx: Number(a.dataset.index), href: a.getAttribute("href"), cap: a.dataset.caption || "" });
  });
  galleries.forEach((list) => list.sort((a, b) => a.idx - b.idx));

  let curG = null;
  let curI = 0;
  let lastFocus = null;

  const show = (i) => {
    const list = galleries.get(curG);
    curI = clamp(i, 0, list.length - 1);
    const it = list[curI];
    lbImg.style.opacity = "0";
    lbImg.onload = () => (lbImg.style.opacity = "1");
    lbImg.src = it.href;
    lbImg.alt = it.cap;
    lbCap.textContent = it.cap;
    lbCount.textContent = `${String(curI + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
    lbPrev.disabled = curI === 0;
    lbNext.disabled = curI === list.length - 1;
    [list[curI + 1], list[curI - 1]].forEach((n) => {
      if (n) new Image().src = n.href;
    });
  };
  const openLB = (g, i) => {
    if (!galleries.has(g)) return;
    curG = g;
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add("lb-open");
    show(i);
    lbClose.focus();
  };
  const closeLB = () => {
    lb.hidden = true;
    document.body.classList.remove("lb-open");
    lbImg.removeAttribute("src");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-gallery]");
    if (a) {
      e.preventDefault();
      openLB(a.dataset.gallery, Number(a.dataset.index));
      return;
    }
    const b = e.target.closest("[data-open]");
    if (b) openLB(b.dataset.open, 0);
  });
  lbClose.addEventListener("click", closeLB);
  lbPrev.addEventListener("click", () => show(curI - 1));
  lbNext.addEventListener("click", () => show(curI + 1));
  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target.classList.contains("lb__fig")) closeLB();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!lb.hidden) closeLB();
      else setMenu(false);
    }
    if (lb.hidden) return;
    if (e.key === "ArrowLeft") show(curI - 1);
    if (e.key === "ArrowRight") show(curI + 1);
    if (e.key === "Tab") {
      const f = [lbClose, lbPrev, lbNext].filter((b) => !b.disabled);
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  let tx = 0;
  lb.addEventListener("touchstart", (e) => (tx = e.changedTouches[0].clientX), { passive: true });
  lb.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) show(curI + (dx < 0 ? 1 : -1));
    },
    { passive: true }
  );

  /* ---------- старт ---------- */
  layoutHS();
  layoutSteps();
  hsCur = 0;
  request();
  window.addEventListener("load", () => {
    layoutHS();
    layoutSteps();
    request();
    if (location.hash && $(location.hash)) $(location.hash).scrollIntoView();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layoutHS(); layoutSteps(); request(); });
})();
