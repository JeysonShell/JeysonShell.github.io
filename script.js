document.getElementById("year").textContent = new Date().getFullYear();

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
const overlay = document.getElementById("nav-overlay");

function setMenuOpen(open) {
  nav?.classList.toggle("is-open", open);
  overlay?.classList.toggle("is-visible", open);
  document.body.classList.toggle("menu-open", open);
  menuBtn?.setAttribute("aria-expanded", String(open));
  if (overlay) {
    overlay.hidden = !open;
  }
}

menuBtn?.addEventListener("click", () => {
  setMenuOpen(!nav?.classList.contains("is-open"));
});

overlay?.addEventListener("click", () => setMenuOpen(false));

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenuOpen(false);
});
