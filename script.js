(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector("#nav-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const closeMenu = () => {
    if (!navToggle || !navMenu) return;
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    if (!navToggle || !navMenu) return;
    navMenu.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      if (navMenu.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!navMenu.classList.contains("open")) return;
      if (navMenu.contains(target) || navToggle.contains(target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", href);
      }

      closeMenu();
    });
  });

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 20);
  };

  const updateActiveLink = () => {
    if (!sections.length) return;
    const marker = window.scrollY + window.innerHeight * 0.36;
    let currentId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= marker) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      const isActive = id === currentId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  window.addEventListener(
    "scroll",
    () => {
      updateHeader();
      updateActiveLink();
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 780) {
        closeMenu();
      }
      updateActiveLink();
    },
    { passive: true }
  );

  updateHeader();
  updateActiveLink();

  if (prefersReducedMotion) {
    reveals.forEach((item) => item.classList.add("visible"));
  } else {
    reveals.forEach((item, index) => {
      item.style.setProperty("--delay", `${(index % 5) * 70}ms`);
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    reveals.forEach((item) => revealObserver.observe(item));
  }

  if (!prefersReducedMotion) {
    let targetX = 50;
    let targetY = 30;
    let currentX = 50;
    let currentY = 30;
    let rafId = 0;

    const renderGlow = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      document.documentElement.style.setProperty("--pointer-x", `${currentX.toFixed(2)}%`);
      document.documentElement.style.setProperty("--pointer-y", `${currentY.toFixed(2)}%`);

      const dx = Math.abs(targetX - currentX);
      const dy = Math.abs(targetY - currentY);
      if (dx > 0.06 || dy > 0.06) {
        rafId = window.requestAnimationFrame(renderGlow);
      } else {
        rafId = 0;
      }
    };

    window.addEventListener(
      "pointermove",
      (event) => {
        targetX = (event.clientX / window.innerWidth) * 100;
        targetY = (event.clientY / window.innerHeight) * 100;
        if (!rafId) {
          rafId = window.requestAnimationFrame(renderGlow);
        }
      },
      { passive: true }
    );
  }
})();
