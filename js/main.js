/* Hajj App home page interactions (vanilla JS, no dependencies) */
(function () {
  "use strict";

  const root = document.documentElement;
  root.classList.remove("no-js");

  /* ---------- Journey data ----------
     Pin icons (assets/img/pins) and guide photos (assets/img/rites) are the app's own
     assets; rite names follow the app's guide cards. */
  const PIN = "assets/img/pins/";
  const PHOTO = "assets/img/rites/";
  const RITES = {
    ihram: { name: "Enter Ihram at the Miqat", icon: "miquat.png", photo: "ihram.jpg",
      desc: "Make your intention and enter the state of Ihram before crossing the Miqat. The app alerts you when you reach the boundary." },
    ihramHajj: { name: "Ihram for Hajj", icon: "ihram.png", photo: "ihram.jpg",
      desc: "On the 8th of Dhul Hijjah, enter Ihram again from your place in Makkah with the intention for Hajj." },
    arrive: { name: "Arrive in Makkah", icon: "mecca.png", photo: "arrive-makkah.jpg",
      desc: "Reach the holy city. The app notes when you have entered Makkah so your guide moves to the next step." },
    masjid: { name: "Enter Masjid al-Haram", icon: "masjid_al_haram.png", photo: "masjid-al-haram.jpg",
      desc: "Enter the Sacred Mosque with your right foot and the supplication for entering the masjid." },
    tawaf: { name: "Perform Tawaf", icon: "tawaf.png", photo: "tawaf.jpg",
      desc: "Circle the Kaaba seven times, starting and ending at the Black Stone. The guide counts the rounds with you." },
    tawafQudum: { name: "Tawaf al-Qudum", icon: "tawaf.png", photo: "tawaf.jpg",
      desc: "The Tawaf of arrival: seven rounds around the Kaaba as you first come to Masjid al-Haram." },
    maqam: { name: "Pray at Maqam Ibrahim", icon: "macaqam_Ibrahim.png", photo: "maqam-ibrahim.jpg",
      desc: "After Tawaf, pray two units of prayer behind Maqam Ibrahim, or anywhere in the masjid if it is crowded." },
    zamzam: { name: "Drink Zamzam", icon: "zamzam.png", photo: "zamzam.jpg",
      desc: "Drink from the blessed water of Zamzam and make dua before heading to Safa." },
    sai: { name: "Sa'i between Safa & Marwah", icon: "sai.png", photo: "sai.jpg",
      desc: "Walk seven times between the hills of Safa and Marwah, starting at Safa and ending at Marwah." },
    halq: { name: "Halq or Taqsir", icon: "halq.png", photo: "halq.jpg",
      desc: "Men shave or shorten their hair; women trim a fingertip's length." },
    exitIhram: { name: "Exit Ihram", icon: "Gate.png", photo: "exit-ihram.jpg",
      desc: "Your Umrah is complete and the restrictions of Ihram are lifted." },
    remainIhram: { name: "Remain in Ihram", icon: "sand_clock.png", photo: "remain-ihram.jpg",
      desc: "Stay in Ihram and wait for the days of Hajj to begin on the 8th of Dhul Hijjah." },
    mina: { name: "Days in Mina", icon: "mina.png", photo: "mina.jpg",
      desc: "Spend the Day of Tarwiyah in Mina, praying each prayer in its time." },
    arafat: { name: "Day of Arafat", icon: "arafat.png", photo: "arafat.jpg",
      desc: "Stand at Arafat from midday until sunset in prayer and supplication: the heart of Hajj." },
    muzdalifah: { name: "Night at Muzdalifah", icon: "muzdalifah_stay.png", photo: "muzdalifah.jpg",
      desc: "Spend the night under the open sky and collect pebbles for the stoning." },
    jamarat: { name: "Rami al-Jamarat", icon: "al-jamarat.png", photo: "jamarat.jpg",
      desc: "Stone the Jamarat on the days of Eid and Tashreeq, following the order in your guide." },
    sacrifice: { name: "Animal sacrifice", icon: "sheep.png", photo: "sacrifice.jpg",
      desc: "Offer the Hady sacrifice, in person or through an authorised voucher." },
    ifadah: { name: "Tawaf al-Ifadah", icon: "tawaf.png", photo: "tawaf.jpg",
      desc: "Return to Masjid al-Haram for the obligatory Tawaf of Hajj." },
    farewell: { name: "Farewell Tawaf", icon: "hands.png", photo: "masjid-al-haram.jpg",
      desc: "Make the Farewell Tawaf as your last act in Makkah before you leave." },
  };

  const UMRAH = ["ihram", "arrive", "masjid", "tawaf", "maqam", "zamzam", "sai", "halq", "exitIhram"];
  const JOURNEYS = {
    umrah: {
      title: "Umrah",
      desc: "The lesser pilgrimage, which can be performed at any time of the year.",
      steps: UMRAH,
    },
    tamattu: {
      title: "Hajj al-Tamattu",
      desc: "Umrah first, then leave Ihram and enter it again for Hajj.",
      steps: [...UMRAH, "ihramHajj", "mina", "arafat", "muzdalifah", "jamarat", "sacrifice", "halq", "ifadah", "sai", "farewell"],
    },
    qiran: {
      title: "Hajj al-Qiran",
      desc: "Umrah and Hajj combined in a single state of Ihram.",
      steps: ["ihram", "arrive", "masjid", "tawafQudum", "maqam", "zamzam", "sai", "remainIhram", "mina", "arafat", "muzdalifah", "jamarat", "sacrifice", "halq", "ifadah", "farewell"],
    },
    ifrad: {
      title: "Hajj al-Ifrad",
      desc: "Hajj only, with no Umrah and no sacrifice required.",
      steps: ["ihram", "arrive", "masjid", "tawafQudum", "maqam", "zamzam", "sai", "remainIhram", "mina", "arafat", "muzdalifah", "jamarat", "halq", "ifadah", "farewell"],
    },
  };

  const timeline = document.getElementById("timeline");
  const journeyTitle = document.getElementById("journeyTitle");
  const journeyDesc = document.getElementById("journeyDesc");
  const journeyTabs = document.querySelectorAll(".journey");
  const rite = {
    photo: document.getElementById("ritePhoto"),
    icon: document.getElementById("riteIcon"),
    name: document.getElementById("riteName"),
    step: document.getElementById("riteStep"),
    desc: document.getElementById("riteDesc"),
    prev: document.getElementById("ritePrev"),
    next: document.getElementById("riteNext"),
  };
  let current = { journey: "umrah", index: 0 };

  function selectRite(index, { scroll = true } = {}) {
    const steps = JOURNEYS[current.journey].steps;
    const data = RITES[steps[index]];
    if (!data || !rite.photo) return;
    current.index = index;

    // Fade the photo out, swap it, fade back in once loaded (or on error, so it never stays hidden)
    rite.photo.classList.add("is-loading");
    const done = () => rite.photo.classList.remove("is-loading");
    rite.photo.onload = done;
    rite.photo.onerror = done;
    rite.photo.src = PHOTO + data.photo;
    rite.photo.alt = data.name;

    rite.icon.src = PIN + data.icon;
    rite.name.textContent = data.name;
    rite.desc.textContent = data.desc;
    rite.step.textContent = `Step ${index + 1} of ${steps.length} · ${JOURNEYS[current.journey].title}`;
    rite.prev.disabled = index === 0;
    rite.next.disabled = index === steps.length - 1;

    timeline.querySelectorAll(".timeline__btn").forEach((btn, i) => {
      if (i === index) {
        btn.setAttribute("aria-current", "step");
        if (scroll) btn.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      } else {
        btn.removeAttribute("aria-current");
      }
    });
  }

  function renderJourney(key) {
    const journey = JOURNEYS[key];
    if (!journey || !timeline) return;
    current = { journey: key, index: 0 };

    journeyTitle.textContent = journey.title;
    journeyDesc.textContent = journey.desc;

    // Build with DOM APIs (no innerHTML) so data can never inject markup
    const frag = document.createDocumentFragment();
    journey.steps.forEach((id, i) => {
      const data = RITES[id];
      if (!data) return;
      const li = document.createElement("li");
      li.style.setProperty("--i", i);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "timeline__btn";
      btn.addEventListener("click", () => selectRite(i));

      const iconWrap = document.createElement("span");
      iconWrap.className = "timeline__icon";
      const img = document.createElement("img");
      img.src = PIN + data.icon;
      img.alt = "";
      img.loading = "lazy";
      iconWrap.appendChild(img);

      const num = document.createElement("span");
      num.className = "timeline__num";
      num.textContent = "STEP " + String(i + 1).padStart(2, "0");

      const name = document.createElement("span");
      name.className = "timeline__name";
      name.textContent = data.name;

      btn.append(iconWrap, num, name);
      li.appendChild(btn);
      frag.appendChild(li);
    });

    timeline.replaceChildren(frag);
    timeline.scrollTo({ left: 0 });
    selectRite(0, { scroll: false });
  }

  rite.prev?.addEventListener("click", () => selectRite(Math.max(0, current.index - 1)));
  rite.next?.addEventListener("click", () => selectRite(Math.min(JOURNEYS[current.journey].steps.length - 1, current.index + 1)));

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
      "brand": "حج ذكي", // matches AppLocale.hajjSmart in the app
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
      "card.step": "الخطوة ٤ من ٩ · العمرة",
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
