/* Hajj App home page interactions (vanilla JS, no dependencies) */
(function () {
  "use strict";

  const root = document.documentElement;
  root.classList.remove("no-js");

  /* ---------- Journey data (mirrors the 4 journeys in the Flutter app) ---------- */
  const IMG = "assets/img/";
  const RITES = {
    miqat: { name: "Reach the Miqat", icon: "miquat.png" },
    ihram: { name: "Enter Ihram", icon: "ihram.png" },
    ihramHajj: { name: "Ihram for Hajj", icon: "ihram.png" },
    tawaf: { name: "Tawaf", icon: "tawaf.png" },
    tawafQudum: { name: "Tawaf al-Qudum", icon: "tawaf.png" },
    sai: { name: "Sa'i", icon: "sai.png" },
    halq: { name: "Halq or Taqsir", icon: "halq.png" },
    mina: { name: "Days in Mina", icon: "mina.png" },
    arafat: { name: "Standing at Arafat", icon: "arafat.png" },
    muzdalifah: { name: "Night at Muzdalifah", icon: "muzdalifah_stay.png" },
    jamarat: { name: "Stoning the Jamarat", icon: "al-jamarat.png" },
    sacrifice: { name: "Sacrifice (Hady)", icon: "sheep.png" },
    ifadah: { name: "Tawaf al-Ifadah", icon: "tawaf.png" },
    farewell: { name: "Farewell Tawaf", icon: "zamzam.png" },
  };

  const JOURNEYS = {
    umrah: {
      title: "Umrah",
      desc: "The lesser pilgrimage, which can be performed at any time of the year.",
      steps: ["miqat", "ihram", "tawaf", "sai", "halq"],
    },
    tamattu: {
      title: "Hajj al-Tamattu",
      desc: "Umrah first, then leave Ihram and enter it again for Hajj.",
      steps: ["ihram", "tawaf", "sai", "halq", "ihramHajj", "mina", "arafat", "muzdalifah", "jamarat", "sacrifice", "ifadah", "farewell"],
    },
    qiran: {
      title: "Hajj al-Qiran",
      desc: "Umrah and Hajj combined in a single state of Ihram.",
      steps: ["ihram", "tawafQudum", "sai", "mina", "arafat", "muzdalifah", "jamarat", "sacrifice", "halq", "ifadah", "farewell"],
    },
    ifrad: {
      title: "Hajj al-Ifrad",
      desc: "Hajj only, with no Umrah and no sacrifice required.",
      steps: ["ihram", "tawafQudum", "sai", "mina", "arafat", "muzdalifah", "jamarat", "halq", "ifadah", "farewell"],
    },
  };

  const timeline = document.getElementById("timeline");
  const journeyTitle = document.getElementById("journeyTitle");
  const journeyDesc = document.getElementById("journeyDesc");
  const journeyTabs = document.querySelectorAll(".journey");

  function renderJourney(key) {
    const journey = JOURNEYS[key];
    if (!journey || !timeline) return;

    journeyTitle.textContent = journey.title;
    journeyDesc.textContent = journey.desc;

    // Build with DOM APIs (no innerHTML) so data can never inject markup
    const frag = document.createDocumentFragment();
    journey.steps.forEach((id, i) => {
      const rite = RITES[id];
      if (!rite) return;
      const li = document.createElement("li");
      li.style.setProperty("--i", i);

      const iconWrap = document.createElement("span");
      iconWrap.className = "timeline__icon";
      const img = document.createElement("img");
      img.src = IMG + rite.icon;
      img.alt = "";
      img.loading = "lazy";
      iconWrap.appendChild(img);

      const num = document.createElement("span");
      num.className = "timeline__num";
      num.textContent = "STEP " + String(i + 1).padStart(2, "0");

      const name = document.createElement("span");
      name.className = "timeline__name";
      name.textContent = rite.name;

      li.append(iconWrap, num, name);
      frag.appendChild(li);
    });

    timeline.replaceChildren(frag);
    timeline.scrollTo({ left: 0 });
  }

  journeyTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      journeyTabs.forEach((t) => {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      renderJourney(tab.dataset.journey);
    });
  });
  renderJourney("umrah");

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");

  function setMenu(open) {
    if (!burger || !navLinks) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navLinks.classList.toggle("is-open", open);
  }

  burger?.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  navLinks?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 921px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* ---------- Header shadow + back-to-top (rAF-throttled) ---------- */
  const header = document.getElementById("header");
  const toTop = document.getElementById("toTop");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 10);
    toTop?.classList.toggle("is-visible", y > 700);
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Reveal on scroll + active nav link ---------- */
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    // Stagger siblings inside grids so cards cascade in
    document.querySelectorAll(".reveal").forEach((el) => {
      const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains("reveal")) : [];
      const idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 80, 400) + "ms";
      revealObserver.observe(el);
    });

    const links = document.querySelectorAll('.nav__links a[href^="#"]:not(.btn)');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("is-current", l.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- FAQ: keep one item open at a time ---------- */
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; });
    });
  });

  /* ---------- Language toggle (EN / AR with RTL) ---------- */
  const I18N = {
    ar: {
      "nav.features": "المميزات",
      "nav.journeys": "الرحلات",
      "nav.how": "كيف يعمل",
      "nav.faq": "الأسئلة الشائعة",
      "nav.download": "حمّل التطبيق",
      "hero.eyebrow": "رفيقك في الرحلة المباركة",
      "hero.title": "أدِّ الحج والعمرة <em>بوضوح</em> و<em>طمأنينة</em>",
      "hero.lead": "إرشاد خطوة بخطوة لكل منسك، من الإحرام عند الميقات إلى طواف الوداع. تابع تقدّمك، وابقَ قريبًا من رفاقك، واحصل على تنبيهات عند وصولك إلى الحدود المقدسة.",
      "store.apple.small": "حمّله من",
      "store.google.small": "احصل عليه من",
      "trust.journeys": "رحلات موجّهة",
      "trust.lang": "ثنائي اللغة",
      "trust.live": "تتبّع الرفاق",
      "card.step": "الخطوة ٢ من ٤ · العمرة",
      "card.tawaf": "الطواف حول الكعبة",
      "card.alertTitle": "تنبيه الموقع",
      "card.alert": "لقد دخلت حدود الميقات",
      "card.companions": "٣ رفاق",
      "card.companionsNear": "بالقرب من المسجد الحرام",
      "features.eyebrow": "كل ما تحتاجه في مكان واحد",
      "features.title": "صُمّم للحجاج بعناية",
      "features.lead": "تفرّغ لعبادتك، ودع التطبيق يتابع المناسك والأماكن والرفاق نيابةً عنك.",
      "cta.title": "ابدأ رحلتك بثقة",
      "cta.lead": "حمّل التطبيق واجمع مناسكك وأماكنك ورفاقك في مكان واحد.",
    },
  };

  // Snapshot the English copy from the markup so it can be restored
  const i18nNodes = document.querySelectorAll("[data-i18n], [data-i18n-html]");
  const english = new Map();
  i18nNodes.forEach((el) => english.set(el, el.innerHTML));

  const langToggle = document.getElementById("langToggle");

  function applyLang(lang) {
    const dict = I18N[lang];
    i18nNodes.forEach((el) => {
      const key = el.dataset.i18n || el.dataset.i18nHtml;
      const value = dict && dict[key];
      if (!value) { el.innerHTML = english.get(el); return; }
      // Only data-i18n-html keys may contain markup; the rest are set as plain text
      if (el.dataset.i18nHtml) el.innerHTML = value; else el.textContent = value;
    });

    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    langToggle?.querySelectorAll(".lang-toggle__opt").forEach((o) => o.classList.toggle("is-active", o.dataset.lang === lang));
    langToggle?.setAttribute("aria-label", lang === "ar" ? "Switch language to English" : "Switch language to Arabic");

    try { localStorage.setItem("hajj-lang", lang); } catch (_) { /* storage unavailable: ignore */ }
  }

  langToggle?.addEventListener("click", () => applyLang(root.lang === "ar" ? "en" : "ar"));

  let saved = null;
  try { saved = localStorage.getItem("hajj-lang"); } catch (_) { /* storage unavailable */ }
  if (saved === "ar") applyLang("ar");

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
