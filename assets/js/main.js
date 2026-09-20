/* =========================================================
   Evelyn — shared site behaviour
   One file for all four pages. No build step, no dependencies.
   ========================================================= */

/* ─────────────────────────────────────────────────────────
   1. CONFIG — the only part you need to edit
   ─────────────────────────────────────────────────────────

   The contact form is frontend-only: there is no server of
   your own. Pick ONE option, paste your key in, and enquiries
   arrive in your email inbox.

   OPTION A — Formspree  (https://formspree.io)
     Sign up free, create a form, copy the endpoint it gives
     you (like https://formspree.io/f/xdorwkab) into ENDPOINT
     and set PROVIDER to "formspree".

   OPTION B — Web3Forms  (https://web3forms.com)
     Enter your email on their homepage — no account needed.
     Paste the access key they email you into ACCESS_KEY and
     set PROVIDER to "web3forms".

   OPTION C — do nothing.
     Leave PROVIDER as "mailto". The form validates, then opens
     the visitor's email app with every field filled in and
     addressed to EMAIL below. Always works, but the visitor
     has to press send themselves.
*/
const CONFIG = {
  PROVIDER:   "mailto",                              // "formspree" | "web3forms" | "mailto"
  ENDPOINT:   "https://formspree.io/f/YOUR_FORM_ID", // Formspree only
  ACCESS_KEY: "YOUR-WEB3FORMS-ACCESS-KEY",           // Web3Forms only
  EMAIL:      "rinawydmgmt@gmail.com",               // your inbox
  SUBJECT:    "New collaboration enquiry from your website"
};

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ─────────────────────────────────────────────────────────
   2. Footer year
   ───────────────────────────────────────────────────────── */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─────────────────────────────────────────────────────────
   3. Light / dark toggle (remembers the choice)
   ───────────────────────────────────────────────────────── */
const themeToggle = $("#themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const current = document.documentElement.dataset.theme || (prefersDark ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
  });
}

/* ─────────────────────────────────────────────────────────
   4. Header hairline + mobile menu
   ───────────────────────────────────────────────────────── */
const header = $(".site-header");
const nav = $("#nav");
const navToggle = $("#navToggle");

if (header) {
  const setStuck = () => header.classList.toggle("is-stuck", window.scrollY > 4);
  setStuck();
  window.addEventListener("scroll", setStuck, { passive: true });
}

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  });
}

/* ─────────────────────────────────────────────────────────
   5. Reveal on scroll
   ───────────────────────────────────────────────────────── */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealables = $$(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealables.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  revealables.forEach((el) => revealer.observe(el));
}

/* ─────────────────────────────────────────────────────────
   6. Video showcase — click a card to play it full size
   ─────────────────────────────────────────────────────────
   Grid thumbnails only load each file's first frame
   (preload="metadata"), so the page stays light. The full
   clip downloads when someone actually presses play.
   ───────────────────────────────────────────────────────── */
const lightbox = $("#lightbox");
const lightboxFrame = $("#lightboxFrame");
const lightboxClose = $("#lightboxClose");
let lastFocused = null;

function openLightbox(card) {
  const { file, youtube, vimeo, orientation } = card.dataset;
  let node;

  if (file) {
    node = document.createElement("video");
    node.src = file;
    node.controls = true;
    node.autoplay = true;
    node.playsInline = true;
    node.preload = "auto";
    // Paint the poster frame immediately so the player is never a black box
    if (card.dataset.poster) node.poster = card.dataset.poster;
  } else if (youtube) {
    node = document.createElement("iframe");
    node.src = `https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1&rel=0`;
    node.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    node.allowFullscreen = true;
    node.title = $("h2", card)?.textContent || "Video";
  } else if (vimeo) {
    node = document.createElement("iframe");
    node.src = `https://player.vimeo.com/video/${vimeo}?autoplay=1`;
    node.allow = "autoplay; fullscreen; picture-in-picture";
    node.allowFullscreen = true;
    node.title = $("h2", card)?.textContent || "Video";
  } else {
    return;
  }

  lastFocused = document.activeElement;
  lightboxFrame.classList.toggle("is-landscape", orientation === "landscape");
  lightboxFrame.replaceChildren(node);
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightboxClose.focus();

  // These clips have sound, so playback needs the click that opened this dialog
  // to count as user activation. If a browser refuses anyway, the poster frame
  // and the controls are already on screen, so pressing play still works.
  node.play?.()?.catch(() => {});
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxFrame.replaceChildren();   // removes the player, stopping playback
  document.body.style.overflow = "";
  lastFocused?.focus();
}

if (lightbox) {
  $$(".video-card").forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    const title = $("h2", card)?.textContent || "video";
    card.setAttribute("aria-label", `Play ${title}`);

    card.addEventListener("click", () => openLightbox(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(card);
      }
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });

  // Keep focus inside the dialog while it's open
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "Tab") { e.preventDefault(); lightboxClose.focus(); }
  });
}

/* ─────────────────────────────────────────────────────────
   7. Contact form
   ───────────────────────────────────────────────────────── */
const form = $("#contactForm");

if (form) {
  const statusEl = $("#formStatus");
  const submitBtn = $("#submitBtn");
  const dateInput = $("#date");
  const serviceSelect = $("#service");

  // You can't be booked in the past
  dateInput.min = new Date().toISOString().split("T")[0];

  // Arriving from a "Enquire" button on the rates page? Pre-select that package.
  const wanted = new URLSearchParams(window.location.search).get("service");
  if (wanted) {
    const match = [...serviceSelect.options].find((o) =>
      o.text.toLowerCase().startsWith(wanted.toLowerCase())
    );
    if (match) serviceSelect.value = match.value || match.text;
  }

  const RULES = {
    restaurant: (v) => (v.trim().length >= 2 ? "" : "Please tell me the restaurant's name."),
    service:    (v) => (v ? "" : "Pick the service you're interested in."),
    date:       (v) => {
      if (!v) return "Choose a date you'd like to work together.";
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return new Date(v) < today ? "Please pick today or a future date." : "";
    },
    email:      (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "That email doesn't look right."),
    phone:      (v) => {
      const digits = v.replace(/[^\d]/g, "");
      return digits.length >= 7 && digits.length <= 15 ? "" : "Please enter a number I can reach you on.";
    }
  };

  function validateField(name) {
    const input = form.elements[name];
    const field = input.closest(".field");
    const msg = RULES[name](input.value);
    field.classList.toggle("has-error", Boolean(msg));
    $(`[data-error-for="${name}"]`, field).textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  // Check on blur; once a field is flagged, re-check as they fix it
  Object.keys(RULES).forEach((name) => {
    const input = form.elements[name];
    const recheck = () => {
      if (input.closest(".field").classList.contains("has-error")) validateField(name);
    };
    input.addEventListener("blur", () => validateField(name));
    input.addEventListener("input", recheck);
    input.addEventListener("change", recheck);
  });

  const setStatus = (message, kind) => {
    statusEl.textContent = message;
    statusEl.className = `form-status is-visible ${kind}`;
  };

  const sending = (on) => {
    submitBtn.disabled = on;
    submitBtn.classList.toggle("is-sending", on);
    $(".btn-label", submitBtn).textContent = on ? "Sending" : "Send enquiry";
  };

  const prettyDate = (value) => {
    const d = new Date(value + "T00:00:00");
    return isNaN(d) ? value : d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  };

  function openMailClient(data) {
    const body = [
      `Restaurant: ${data.restaurant}`,
      `Service:    ${data.service}`,
      `Date:       ${prettyDate(data.date)}`,
      `Email:      ${data.email}`,
      `Phone:      ${data.phone}`,
      "",
      data.message ? `Message:\n${data.message}` : "(no extra message)"
    ].join("\n");

    const href =
      `mailto:${CONFIG.EMAIL}` +
      `?subject=${encodeURIComponent(`${CONFIG.SUBJECT} — ${data.restaurant}`)}` +
      `&body=${encodeURIComponent(body)}`;

    // Clicking a synthetic link opens the mail app without navigating away
    const a = document.createElement("a");
    a.href = href;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function postToProvider(data) {
    if (CONFIG.PROVIDER === "formspree") {
      const res = await fetch(CONFIG.ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, _subject: `${CONFIG.SUBJECT} — ${data.restaurant}` })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.errors?.[0]?.message || `Formspree returned ${res.status}`);
      }
      return;
    }

    if (CONFIG.PROVIDER === "web3forms") {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: CONFIG.ACCESS_KEY,
          subject: `${CONFIG.SUBJECT} — ${data.restaurant}`,
          from_name: data.restaurant,
          ...data
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || `Web3Forms returned ${res.status}`);
      return;
    }

    throw new Error("unconfigured");
  }

  const isConfigured =
    (CONFIG.PROVIDER === "formspree" && !CONFIG.ENDPOINT.includes("YOUR_FORM_ID")) ||
    (CONFIG.PROVIDER === "web3forms" && !CONFIG.ACCESS_KEY.startsWith("YOUR-"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Bots fill hidden fields; people don't.
    if (form.elements["_gotcha"].value) return;

    const results = Object.keys(RULES).map(validateField);
    if (results.includes(false)) {
      setStatus("Please fix the highlighted fields and try again.", "err");
      $(".field.has-error input, .field.has-error select", form)?.focus();
      return;
    }

    const data = {
      restaurant: form.elements.restaurant.value.trim(),
      service:    form.elements.service.value,
      date:       form.elements.date.value,
      email:      form.elements.email.value.trim(),
      phone:      form.elements.phone.value.trim(),
      message:    form.elements.message.value.trim()
    };

    if (!isConfigured) {
      setStatus("Opening your email app with the details filled in — just press send.", "ok");
      openMailClient(data);
      return;
    }

    sending(true);
    statusEl.className = "form-status";

    try {
      await postToProvider(data);
      form.reset();
      setStatus(
        `Thank you. Your enquiry for ${prettyDate(data.date)} is on its way — I'll reply within two working days.`,
        "ok"
      );
    } catch (err) {
      console.error(err);
      setStatus(`Something went wrong sending that. Please try again, or email me directly at ${CONFIG.EMAIL}.`, "err");
    } finally {
      sending(false);
    }
  });
}
