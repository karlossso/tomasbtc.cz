const header = document.querySelector("[data-header]");
const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector("[data-menu]");
const year = document.querySelector("[data-year]");
const revealItems = document.querySelectorAll(".reveal");
const domainForm = document.querySelector("[data-domain-form]");
const domainPickers = document.querySelectorAll("[data-domain-pick]");

if (year) {
  year.textContent = new Date().getFullYear();
}

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  menu.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  });
}

if (revealItems.length > 0) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }
}

if (domainForm) {
  const domainSelect = domainForm.querySelector('select[name="domain"]');

  domainPickers.forEach((picker) => {
    picker.addEventListener("click", () => {
      if (!(domainSelect instanceof HTMLSelectElement)) return;
      domainSelect.value = picker.getAttribute("data-domain-pick") || "Obecný dotaz";
    });
  });

  domainForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(domainForm);
    const email = String(formData.get("email") || "").trim();
    const domain = String(formData.get("domain") || "Obecný dotaz").trim();
    const message = String(formData.get("message") || "").trim();

    if (!email || !message) return;

    const subject = `Dotaz k doméně: ${domain}`;
    const body = [
      `E-mail odesílatele: ${email}`,
      `Doména / téma: ${domain}`,
      "",
      "Zpráva:",
      message,
    ].join("\n");

    window.location.href = `mailto:nemec@tomasbtc.cz?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

if (!window.chatbase || window.chatbase("getState") !== "initialized") {
  window.chatbase = (...args) => {
    if (!window.chatbase.q) {
      window.chatbase.q = [];
    }
    window.chatbase.q.push(args);
  };

  window.chatbase = new Proxy(window.chatbase, {
    get(target, prop) {
