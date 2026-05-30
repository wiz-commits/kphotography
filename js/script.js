const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const brandMarks = document.querySelectorAll(".brand");
const canAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canAnimate) {
  document.body.classList.add("is-loading");

  const pageLoader = document.createElement("div");
  pageLoader.className = "page-loader";
  pageLoader.innerHTML = "<span>K Photography</span>";
  document.body.prepend(pageLoader);

  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  document.body.appendChild(progressBar);

  const cursorGlow = document.createElement("div");
  cursorGlow.className = "cursor-glow";
  document.body.appendChild(cursorGlow);

  const finishLoading = () => {
    window.setTimeout(() => {
      document.body.classList.remove("is-loading");
      document.body.classList.add("page-ready");
    }, 450);
  };

  if (document.readyState === "complete") {
    finishLoading();
  } else {
    window.addEventListener("load", finishLoading, { once: true });
  }

  window.addEventListener("pointermove", (event) => {
    document.body.classList.add("cursor-active");
    cursorGlow.style.transform = `translate3d(${event.clientX - 140}px, ${event.clientY - 140}px, 0)`;
  });

  window.addEventListener("pointerleave", () => {
    document.body.classList.remove("cursor-active");
  });
}

const logoFiles = ["images/logo.png", "images/logo.jpg", "images/logo.jpeg"];

const applyLogo = (src) => {
  brandMarks.forEach((brand) => {
    brand.classList.add("has-logo");
    brand.innerHTML = `<img class="brand-logo" src="${src}" alt="K Photography" />`;
  });
};

// Apply immediately from cache so there's no text flash between pages
const cachedLogo = sessionStorage.getItem("kp_logo");
if (cachedLogo && brandMarks.length) {
  applyLogo(cachedLogo);
}

const loadLogo = (index = 0) => {
  if (!brandMarks.length || index >= logoFiles.length) return;

  const testImage = new Image();
  testImage.onload = () => {
    sessionStorage.setItem("kp_logo", logoFiles[index]);
    applyLogo(logoFiles[index]);
  };
  testImage.onerror = () => loadLogo(index + 1);
  testImage.src = `${logoFiles[index]}?v=1`;
};

loadLogo();

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 18);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (menuButton) {
  menuButton.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.style.setProperty("--link-index", [...navLinks].indexOf(link));
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    if (menuButton) menuButton.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".category-grid, .works-grid, .editorial-grid, .service-list, .journal-grid").forEach((grid) => {
  grid.classList.add("stagger");
  [...grid.children].forEach((child, index) => child.style.setProperty("--i", index));
});

const revealItems = document.querySelectorAll(".reveal, .stagger > *");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const parallaxTargets = document.querySelectorAll(".hero, .cta-panel");
let ticking = false;

const cinematicScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    const offset = window.scrollY * 0.16;

    const progressBar = document.querySelector(".scroll-progress");
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;

    parallaxTargets.forEach((target) => {
      if (window.matchMedia("(min-width: 1041px)").matches) {
        target.style.backgroundPositionY = `${offset * -0.18}px, center`;
      }
    });
    ticking = false;
  });
};

window.addEventListener("scroll", cinematicScroll, { passive: true });
cinematicScroll();

const motionCards = document.querySelectorAll(".category-card, .work-card, .gallery-card, .journal-card, .service-card");

if (canAnimate && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  motionCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 7;
      const rotateX = ((y / rect.height) - 0.5) * -7;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

const filters = document.querySelectorAll("[data-filter]");
const filterCards = document.querySelectorAll("[data-category]");

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    filterCards.forEach((card) => {
      const shouldShow = category === "all" || card.dataset.category === category;
      card.classList.toggle("hide", !shouldShow);
      if (shouldShow) {
        card.classList.remove("visible", "motion-pop");
        requestAnimationFrame(() => card.classList.add("visible", "motion-pop"));
      }
    });
  });
});

const testimonials = document.querySelectorAll(".testimonial");
const dots = document.querySelectorAll(".slider-dots button");
let activeQuote = 0;

const showQuote = (index) => {
  if (!testimonials.length) return;
  activeQuote = index;
  testimonials.forEach((quote, quoteIndex) => quote.classList.toggle("active", quoteIndex === index));
  dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
};

dots.forEach((dot, index) => dot.addEventListener("click", () => showQuote(index)));

if (testimonials.length) {
  setInterval(() => showQuote((activeQuote + 1) % testimonials.length), 6500);
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toastStack = document.createElement("div");
toastStack.className = "toast-stack";
toastStack.setAttribute("aria-live", "polite");
toastStack.setAttribute("aria-atomic", "true");
document.body.appendChild(toastStack);

const showToast = ({ title, message, type = "success" }) => {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : ""}`.trim();
  toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  toastStack.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 4200);
};

const showFieldError = (field, message) => {
  const wrapper = field.closest(".field-group");
  const error = wrapper ? wrapper.querySelector(".field-error") : null;
  if (error) error.textContent = message;
  field.classList.toggle("has-error", Boolean(message));
  field.setAttribute("aria-invalid", message ? "true" : "false");
};

const validateForm = (form) => {
  let isValid = true;

  form.querySelectorAll("[required]").forEach((field) => {
    const value = field.value.trim();
    let message = "";

    if (!value) {
      message = "This field is required.";
      isValid = false;
    } else if (field.type === "email" && !emailPattern.test(value)) {
      message = "Enter a valid email address.";
      isValid = false;
    } else if (field.type === "date") {
      const chosenDate = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (chosenDate < today) {
        message = "Choose today or a future date.";
        isValid = false;
      }
    }

    showFieldError(field, message);
  });

  return isValid;
};

document.querySelectorAll("[data-validate]").forEach((form) => {
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => showFieldError(field, ""));
    field.addEventListener("change", () => showFieldError(field, ""));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = form.querySelector(".form-message");
    const isValid = validateForm(form);
    const isBookingForm = Boolean(form.querySelector("#session"));

    if (message) {
      message.textContent = isValid
        ? "Email sent successfully. We will reply shortly."
        : "Please fix the highlighted fields before sending.";
    }

    if (isValid) {
      showToast({
        title: isBookingForm ? "Booking request sent" : "Email sent successfully",
        message: isBookingForm
          ? "Your session request has been received. We will confirm availability soon."
          : "Your inquiry has been received. We will get back to you shortly."
      });
      form.reset();
    } else {
      showToast({
        title: "Check the form",
        message: "Some required details are missing or need correction.",
        type: "error"
      });
    }
  });
});
