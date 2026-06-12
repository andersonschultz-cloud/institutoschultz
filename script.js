/* ==========================================================================
   INSTITUTO SCHULTZ — Interações (Vanilla JS, sem dependências)
   ========================================================================== */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============ Ano no rodapé ============ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============ Header: estado ao rolar ============ */
  const header = document.querySelector(".header");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ============ Menu mobile ============ */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
    document.body.style.overflow = "";
  }

  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("is-open")) closeMenu();
  });

  /* ============ Navegação suave (com offset do header) ============ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  /* ============ Reveal on scroll ============ */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Pequeno escalonamento para elementos que entram juntos
            entry.target.style.transitionDelay = `${(i % 4) * 80}ms`;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ============ Contadores animados ============ */
  const counters = document.querySelectorAll(".stat__number[data-count]");

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString("pt-BR") + (progress === 1 ? suffix : "");
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      counters.forEach((el) => {
        el.textContent =
          parseInt(el.dataset.count, 10).toLocaleString("pt-BR") + (el.dataset.suffix || "");
      });
    } else {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => counterObserver.observe(el));
    }
  }

  /* ============ Slider de depoimentos ============ */
  const track = document.getElementById("sliderTrack");
  if (track) {
    const slides = Array.from(track.children);
    const dotsWrap = document.getElementById("sliderDots");
    let index = 0;
    let autoTimer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "slider__dot";
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Ir para o depoimento ${i + 1}`);
      dot.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.children);

    function goTo(i, manual) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
      if (manual) restartAuto();
    }

    function restartAuto() {
      if (prefersReducedMotion) return;
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(index + 1, false), 7000);
    }

    document.getElementById("prevSlide").addEventListener("click", () => goTo(index - 1, true));
    document.getElementById("nextSlide").addEventListener("click", () => goTo(index + 1, true));

    // Suporte a gesto de arrastar (touch)
    let startX = null;
    track.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
    track.addEventListener(
      "touchend",
      (e) => {
        if (startX === null) return;
        const delta = e.changedTouches[0].clientX - startX;
        if (Math.abs(delta) > 50) goTo(index + (delta < 0 ? 1 : -1), true);
        startX = null;
      },
      { passive: true }
    );

    goTo(0, false);
    restartAuto();
  }

  /* ============ Formulário de contato ============ */
  const form = document.getElementById("contactForm");
  if (form) {
    const feedback = document.getElementById("formFeedback");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      feedback.className = "form__feedback";
      feedback.textContent = "";

      const fields = form.querySelectorAll("input, select, textarea");
      let valid = true;

      fields.forEach((field) => {
        field.classList.remove("is-invalid");
        if (!field.checkValidity()) {
          field.classList.add("is-invalid");
          valid = false;
        }
      });

      if (!valid) {
        feedback.textContent = "Verifique os campos destacados e tente novamente.";
        feedback.classList.add("is-error");
        return;
      }

      // Sem backend no GitHub Pages: abre o cliente de e-mail com a mensagem pronta.
      // Para envio automático, conecte um serviço como Formspree ou similar.
      const nome = form.nome.value.trim();
      const email = form.email.value.trim();
      const interesse = form.interesse.value;
      const mensagem = form.mensagem.value.trim();

      const subject = encodeURIComponent(`[Site] Novo contato — ${interesse}`);
      const body = encodeURIComponent(
        `Nome: ${nome}\nE-mail: ${email}\nInteresse: ${interesse}\n\nMensagem:\n${mensagem}`
      );

      window.location.href = `mailto:contato@institutoschultz.com?subject=${subject}&body=${body}`;

      feedback.textContent = "Tudo certo! Abrimos seu e-mail com a mensagem pronta para envio.";
      feedback.classList.add("is-success");
      form.reset();
    });

    // Remove o destaque de erro assim que a pessoa corrige o campo
    form.addEventListener("input", (e) => {
      if (e.target.checkValidity()) e.target.classList.remove("is-invalid");
    });
  }

  /* ============ Assinatura visual: órbitas no hero ============ */
  // Reinterpretação animada da logomarca — anéis orbitais com nós conectados.
  const canvas = document.getElementById("orbitCanvas");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let width, height, cx, cy, baseRadius;
    let rafId = null;

    const ORBITS = [
      { rx: 1.0, ry: 0.62, tilt: 0.35, speed: 0.00012, nodes: 4, phase: 0.0 },
      { rx: 0.78, ry: 0.94, tilt: -0.5, speed: -0.00016, nodes: 3, phase: 1.4 },
      { rx: 0.9, ry: 0.78, tilt: 1.1, speed: 0.0001, nodes: 4, phase: 2.6 },
    ];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // No desktop, as órbitas vivem à direita; no mobile, ao fundo, mais sutis.
      const desktop = width >= 900;
      cx = desktop ? width * 0.74 : width * 0.5;
      cy = desktop ? height * 0.48 : height * 0.3;
      baseRadius = desktop ? Math.min(width, height) * 0.34 : Math.min(width, height) * 0.42;
    }

    function orbitPoint(orbit, angle) {
      const x0 = Math.cos(angle) * orbit.rx * baseRadius;
      const y0 = Math.sin(angle) * orbit.ry * baseRadius;
      const cos = Math.cos(orbit.tilt);
      const sin = Math.sin(orbit.tilt);
      return { x: cx + x0 * cos - y0 * sin, y: cy + x0 * sin + y0 * cos };
    }

    function draw(t) {
      ctx.clearRect(0, 0, width, height);
      const mobile = width < 900;
      const alpha = mobile ? 0.45 : 1;

      const nodePositions = [];

      ORBITS.forEach((orbit) => {
        // Anel
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.05) {
          const p = orbitPoint(orbit, a);
          a === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        const grad = ctx.createLinearGradient(cx - baseRadius, cy, cx + baseRadius, cy);
        grad.addColorStop(0, `rgba(29, 122, 156, ${0.28 * alpha})`);
        grad.addColorStop(1, `rgba(111, 216, 230, ${0.34 * alpha})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Nós em movimento
        for (let n = 0; n < orbit.nodes; n++) {
          const angle = orbit.phase + t * orbit.speed + (n * Math.PI * 2) / orbit.nodes;
          const p = orbitPoint(orbit, angle);
          nodePositions.push(p);

          const r = 4.2;
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.4);
          glow.addColorStop(0, `rgba(43, 175, 201, ${0.5 * alpha})`);
          glow.addColorStop(1, "rgba(43, 175, 201, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(29, 122, 156, ${0.95 * alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Conexões sutis entre nós próximos — a "rede" da marca
      const maxDist = baseRadius * 0.55;
      for (let i = 0; i < nodePositions.length; i++) {
        for (let j = i + 1; j < nodePositions.length; j++) {
          const a = nodePositions[i];
          const b = nodePositions[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < maxDist) {
            const strength = (1 - dist / maxDist) * 0.22 * alpha;
            ctx.strokeStyle = `rgba(43, 175, 201, ${strength})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    function start() {
      resize();
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(draw);
    }

    // Pausa a animação quando o hero sai da tela (performance)
    const hero = document.querySelector(".hero");
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
        } else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { threshold: 0 }
    );
    heroObserver.observe(hero);

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    start();
  }
})();
