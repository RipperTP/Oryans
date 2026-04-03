(function () {
  const pathname = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".site-nav a");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === pathname) {
      link.classList.add("is-active");
    }
  });

  if (menuToggle && siteNav) {
    const mobileMenuQuery = window.matchMedia("(max-width: 780px)");

    function setMenuState(isOpen) {
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Fermer le menu principal" : "Ouvrir le menu principal");
      siteNav.classList.toggle("is-open", isOpen);
      siteNav.setAttribute("aria-hidden", String(!isOpen));
      document.body.classList.toggle("is-menu-open", isOpen && mobileMenuQuery.matches);
    }

    function closeMenu() {
      setMenuState(false);
    }

    setMenuState(false);

    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!expanded);
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (!mobileMenuQuery.matches || !siteNav.classList.contains("is-open")) {
        return;
      }

      if (!(event.target instanceof Node)) {
        return;
      }

      if (siteNav.contains(event.target) || menuToggle.contains(event.target)) {
        return;
      }

      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    mobileMenuQuery.addEventListener("change", () => {
      closeMenu();
    });
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const revealNodes = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  const galleryItems = Array.from(document.querySelectorAll("[data-gallery-item]"));
  const lightbox = document.querySelector("[data-gallery-lightbox]");
  const lightboxImage = lightbox?.querySelector("[data-gallery-active-image]");
  const closeGalleryButton = lightbox?.querySelector("[data-gallery-close]");
  const previousGalleryButton = lightbox?.querySelector("[data-gallery-prev]");
  const nextGalleryButton = lightbox?.querySelector("[data-gallery-next]");
  const galleryStage = lightbox?.querySelector("[data-gallery-stage]");

  if (galleryItems.length && lightbox && lightboxImage && galleryStage) {
    let activeGalleryIndex = 0;
    let touchStartX = null;

    function renderGalleryImage(index) {
      const item = galleryItems[index];
      const source = item.dataset.gallerySrc || item.querySelector("img")?.getAttribute("src") || "";
      const alt = item.dataset.galleryAlt || item.querySelector("img")?.getAttribute("alt") || "";
      lightboxImage.setAttribute("src", source);
      lightboxImage.setAttribute("alt", alt);
    }

    function stepGallery(direction) {
      activeGalleryIndex = (activeGalleryIndex + direction + galleryItems.length) % galleryItems.length;
      renderGalleryImage(activeGalleryIndex);
    }

    function openGallery(index) {
      activeGalleryIndex = index;
      renderGalleryImage(activeGalleryIndex);
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-gallery-open");
    }

    function closeGallery() {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-gallery-open");
      lightboxImage.setAttribute("src", "");
      lightboxImage.setAttribute("alt", "");
    }

    galleryItems.forEach((item, index) => {
      item.addEventListener("click", () => openGallery(index));
    });

    closeGalleryButton?.addEventListener("click", closeGallery);
    previousGalleryButton?.addEventListener("click", () => stepGallery(-1));
    nextGalleryButton?.addEventListener("click", () => stepGallery(1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeGallery();
      }
    });

    galleryStage.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    galleryStage.addEventListener("touchend", (event) => {
      if (touchStartX === null) {
        return;
      }

      const deltaX = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;

      if (Math.abs(deltaX) < 40) {
        return;
      }

      stepGallery(deltaX < 0 ? 1 : -1);
    }, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) {
        return;
      }

      if (event.key === "Escape") {
        closeGallery();
      }

      if (event.key === "ArrowLeft") {
        stepGallery(-1);
      }

      if (event.key === "ArrowRight") {
        stepGallery(1);
      }
    });
  }
})();
