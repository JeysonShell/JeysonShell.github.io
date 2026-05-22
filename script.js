document.getElementById("year").textContent = new Date().getFullYear();

function slugifyGalleryName(name, index) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/^-+|-+$/g, "") || `gallery-${index}`
  );
}

function initFancyboxGalleries() {
  document.querySelectorAll(".project-gallery, .experience-gallery").forEach((gallery, index) => {
    const groupId = slugifyGalleryName(
      gallery.getAttribute("aria-label") || `gallery-${index}`,
      index
    );

    gallery.querySelectorAll(".project-gallery__item").forEach((figure) => {
      const img = figure.querySelector("img");
      const caption =
        figure.querySelector("figcaption")?.textContent?.trim() || img?.alt || "";

      if (!img || figure.querySelector("a[data-fancybox]")) {
        return;
      }

      const link = document.createElement("a");
      link.href = img.currentSrc || img.src;
      link.className = "gallery-lightbox__link";
      link.setAttribute("data-fancybox", groupId);
      link.setAttribute("data-caption", caption);
      link.setAttribute("aria-label", caption ? `Открыть: ${caption}` : "Открыть изображение");

      img.parentNode.insertBefore(link, img);
      link.appendChild(img);
    });
  });

  if (typeof Fancybox !== "undefined") {
    Fancybox.bind("[data-fancybox]", {
      Carousel: {
        infinite: false,
      },
      Images: {
        zoom: true,
      },
      Toolbar: {
        display: {
          left: ["infobar"],
          middle: [],
          right: ["slideshow", "zoom", "close"],
        },
      },
    });
  }
}

initFancyboxGalleries();

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
