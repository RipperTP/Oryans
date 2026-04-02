(function () {
  const form = document.getElementById("contactPlanner");

  if (form) {
    const nameField = document.getElementById("visitorName");
    const emailField = document.getElementById("visitorEmail");
    const subjectField = document.getElementById("contactSubject");
    const messageField = document.getElementById("contactMessage");
    const recipient = "sugarshack@oryans.ca";

    function buildBody() {
      const name = nameField.value.trim();
      const email = emailField.value.trim();
      const message = messageField.value.trim();

      const lines = [
        "Bonjour a la Sucrerie o'Ryans,",
        "",
        message,
        "",
        `Nom: ${name}`,
        `Courriel: ${email}`
      ];

      return lines.join("\n");
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const subject = subjectField.value.trim() || "Message pour la Sucrerie o'Ryans";
      const body = buildBody();
      const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoLink;
    });
  }

  const slideshow = document.querySelector("[data-contact-slideshow]");

  if (!slideshow) {
    return;
  }

  const stage = slideshow.querySelector("[data-contact-stage]");
  const dots = slideshow.querySelector("[data-contact-dots]");
  const caption = slideshow.querySelector("[data-contact-caption]");
  const counter = slideshow.querySelector("[data-contact-counter]");
  const previousButton = slideshow.querySelector("[data-contact-prev]");
  const nextButton = slideshow.querySelector("[data-contact-next]");
  const imageFiles = [
    "Bonichoix.png",
    "canoryan.jpg",
    "cantuque.jpg",
    "counter.jpg",
    "displaySyrup.jpg",
    "download.png",
    "draw.jpg",
    "glassbottle.jpg",
    "hose.jpg",
    "main.png",
    "oryans-2016-default.jpg",
    "oryans-2016-thumb.jpg",
    "oryans-2017-default.jpg",
    "oryans-2017-thumb.jpg",
    "oryans-logo-facebook.jpg",
    "overall.jpg",
    "poster.png",
    "sellbonichoix.jpg",
    "setup.jpg",
    "tuque.jpg",
    "woodlog.jpg"
  ];
  const customLabels = {
    "Bonichoix.png": "Marche BoniChoix",
    "canoryan.jpg": "Canne o'Ryans",
    "cantuque.jpg": "Canne et tuque",
    "counter.jpg": "Comptoir de vente",
    "displaySyrup.jpg": "Presentoir de sirop",
    "download.png": "Visuel telecharge",
    "draw.jpg": "Croquis de la cabane",
    "glassbottle.jpg": "Bouteille en verre",
    "hose.jpg": "Tubulure",
    "main.png": "Logo principal",
    "oryans-2016-default.jpg": "Saison 2016",
    "oryans-2016-thumb.jpg": "Saison 2016 mini",
    "oryans-2017-default.jpg": "Saison 2017",
    "oryans-2017-thumb.jpg": "Saison 2017 mini",
    "oryans-logo-facebook.jpg": "Logo Facebook",
    "overall.jpg": "Vue generale",
    "poster.png": "Affiche",
    "sellbonichoix.jpg": "Point de vente BoniChoix",
    "setup.jpg": "Installation",
    "tuque.jpg": "Tuque o'Ryans",
    "woodlog.jpg": "Bois d'erable"
  };

  if (!stage || !dots || !caption || !counter || imageFiles.length === 0) {
    return;
  }

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const slideLabels = imageFiles.map((filename) => {
    if (customLabels[filename]) {
      return customLabels[filename];
    }

    return filename
      .replace(/\.[^.]+$/, "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  });
  let activeIndex = 0;
  let autoplayId = null;

  const slides = imageFiles.map((filename, index) => {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    const captionText = document.createElement("figcaption");

    figure.className = "contact-slide";
    figure.setAttribute("aria-hidden", "true");

    image.src = `assets/images/${filename}`;
    image.alt = `${slideLabels[index]} - Sucrerie o'Ryans`;
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = "async";

    captionText.textContent = slideLabels[index];

    figure.append(image, captionText);
    stage.append(figure);

    return figure;
  });

  const dotButtons = imageFiles.map((_, index) => {
    const button = document.createElement("button");

    button.className = "contact-slideshow-dot";
    button.type = "button";
    button.setAttribute("aria-label", `Afficher ${slideLabels[index]}`);

    button.addEventListener("click", () => {
      renderSlide(index);
      restartAutoplay();
    });

    dots.append(button);
    return button;
  });

  function renderSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dotButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === activeIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    caption.textContent = slideLabels[activeIndex];
    counter.textContent = `${activeIndex + 1} / ${slides.length}`;
  }

  function stopAutoplay() {
    if (autoplayId !== null) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();

    if (slides.length < 2 || reducedMotionQuery.matches || document.hidden) {
      return;
    }

    autoplayId = window.setInterval(() => {
      renderSlide(activeIndex + 1);
    }, 4200);
  }

  function restartAutoplay() {
    startAutoplay();
  }

  previousButton?.addEventListener("click", () => {
    renderSlide(activeIndex - 1);
    restartAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    renderSlide(activeIndex + 1);
    restartAutoplay();
  });

  slideshow.addEventListener("mouseenter", stopAutoplay);
  slideshow.addEventListener("mouseleave", startAutoplay);
  slideshow.addEventListener("focusin", stopAutoplay);
  slideshow.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!slideshow.contains(document.activeElement)) {
        startAutoplay();
      }
    }, 0);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
      return;
    }

    startAutoplay();
  });

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", startAutoplay);
  } else if (typeof reducedMotionQuery.addListener === "function") {
    reducedMotionQuery.addListener(startAutoplay);
  }

  renderSlide(0);
  startAutoplay();
})();
