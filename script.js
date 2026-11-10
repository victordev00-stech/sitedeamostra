/* ==========================================================================
   AMOSTRA · JOÃO VICTOR DEV — script.js
   1. Configuração e utilidades
   2. Links de WhatsApp
   3. Cabeçalho, progresso e menu mobile
   4. Revelação ao rolar
   5. Contadores animados
   6. Inclinação com rolagem + parallax
   7. Galeria com lightbox
   8. Carrossel de depoimentos
   9. FAQ (acordeão)
   10. Comparador antes/depois
   11. Fallback de imagens e ano do rodapé
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, min, max) { return Math.min(Math.max(v, min), max); };

  /* ------------------------- 2. LINKS DE WHATSAPP ------------------------- */
  var WA_NUMBER = "5583999999999";
  var WA_MESSAGE = "Olá! Vim pelo site da Amostra e gostaria de agendar uma avaliação.";

  // Cada botão tem a sua própria mensagem (data-wa-msg).
  // Os cards de tratamento usam data-service para citar o procedimento.
  function waLink(link) {
    var text = link.getAttribute("data-wa-msg");
    var service = link.getAttribute("data-service");

    if (!text && service) {
      text = "Olá! Tenho interesse em " + service +
        ". Gostaria de saber mais e de agendar uma avaliação.";
    }
    if (!text) text = WA_MESSAGE;

    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }

  $$("[data-wa]").forEach(function (link) {
    link.setAttribute("href", waLink(link));
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener");
  });

  /* ---------------- 3. CABEÇALHO, PROGRESSO E MENU MOBILE ---------------- */
  var header = $("#siteHeader");
  var progressBar = $(".scroll-progress span");
  var menuToggle = $("#menuToggle");
  var mobileMenu = $("#mobileMenu");

  function closeMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("no-scroll", "menu-open");
  }

  function openMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("no-scroll", "menu-open");
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      if (mobileMenu.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    $$("a", mobileMenu).forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu();
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("is-open")) {
      closeMenu();
      if (menuToggle) menuToggle.focus();
    }
  });

  var scrollTicking = false;

  function onScrollFrame() {
    var y = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle("is-scrolled", y > 40);
    }

    if (progressBar) {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? clamp(y / docHeight, 0, 1) : 0;
      progressBar.style.transform = "scaleX(" + progress + ")";
    }

    updateMotion();
    scrollTicking = false;
  }

  function requestScrollFrame() {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(onScrollFrame);
    }
  }

  window.addEventListener("scroll", requestScrollFrame, { passive: true });
  window.addEventListener("resize", requestScrollFrame);

  /* ---------------------- 4. REVELAÇÃO AO ROLAR -------------------------- */
  var revealEls = $$(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ----------------------- 5. CONTADORES ANIMADOS ------------------------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var formatter = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    var duration = 1500;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatter.format(target * eased);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = formatter.format(target);
      }
    }

    window.requestAnimationFrame(step);
  }

  var counterEls = $$("[data-count]");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ------------- 6. INCLINAÇÃO COM ROLAGEM + PARALLAX -------------------- */
  var motionEls = $$(".media").filter(function (el) {
    return !el.classList.contains("media--collage");
  });

  motionEls.forEach(function (el, index) {
    if (!el.hasAttribute("data-tilt-start")) {
      var base = index % 2 === 0 ? 1.8 : -1.8;
      el.setAttribute("data-tilt-start", (base + 2).toFixed(2));
      el.setAttribute("data-tilt-end", (base - 2).toFixed(2));
    }
  });

  function updateMotion() {
    if (reduceMotion.matches) return;

    var viewport = window.innerHeight || document.documentElement.clientHeight;
    var isSmall = window.matchMedia("(max-width: 759px)").matches;

    motionEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > viewport + 120) return;

      var progress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
      var start = parseFloat(el.getAttribute("data-tilt-start")) || 0;
      var end = parseFloat(el.getAttribute("data-tilt-end")) || 0;
      var factor = isSmall ? 0.45 : 1;
      var tilt = (start + (end - start) * progress) * factor;

      el.style.setProperty("--tilt", tilt.toFixed(2) + "deg");

      if (el.hasAttribute("data-parallax") || el.querySelector("[data-parallax]")) {
        var img = el.hasAttribute("data-parallax") ? el : el.querySelector("[data-parallax]");
        var py = (progress - 0.5) * (isSmall ? 18 : 34);
        img.style.setProperty("--py", py.toFixed(2) + "px");
      }
    });
  }

  if (!reduceMotion.matches) {
    updateMotion();
    requestScrollFrame();
    reduceMotion.addEventListener("change", function () {
      if (reduceMotion.matches) {
        motionEls.forEach(function (el) {
          el.style.removeProperty("--tilt");
          var px = el.querySelector("[data-parallax]");
          if (px) px.style.removeProperty("--py");
        });
      }
    });
  }

  /* ---------------------- 7. GALERIA / LIGHTBOX --------------------------- */
  var galleryItems = $$("#gallery .gallery__item");
  var lightbox = $("#lightbox");
  var lightboxImage = $("#lightboxImage");
  var lightboxCaption = $("#lightboxCaption");
  var lightboxClose = $("#lightboxClose");
  var lightboxPrev = $("#lightboxPrev");
  var lightboxNext = $("#lightboxNext");
  var currentPhoto = 0;
  var lastFocused = null;

  function renderPhoto(index) {
    if (!galleryItems.length || !lightboxImage) return;
    currentPhoto = (index + galleryItems.length) % galleryItems.length;
    var item = galleryItems[currentPhoto];
    var img = item.querySelector("img");
    lightboxImage.src = item.getAttribute("data-src");
    lightboxImage.alt = img ? img.alt : "";
    lightboxCaption.textContent = item.getAttribute("data-caption") || "";
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    renderPhoto(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener("click", function () { openLightbox(index); });
  });

  if (lightbox) {
    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", function () { renderPhoto(currentPhoto - 1); });
    lightboxNext.addEventListener("click", function () { renderPhoto(currentPhoto + 1); });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    lightboxImage.addEventListener("error", function () {
      lightboxImage.alt = "Imagem indisponível nesta demonstração";
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") renderPhoto(currentPhoto - 1);
      if (e.key === "ArrowRight") renderPhoto(currentPhoto + 1);
    });
  }

  /* --------------------- 8. CARROSSEL DE DEPOIMENTOS ---------------------- */
  var track = $("#carouselTrack");
  var dotsWrap = $("#carouselDots");
  var prevBtn = $("#prevTestimonial");
  var nextBtn = $("#nextTestimonial");

  if (track && dotsWrap) {
    var slides = $$(".testimonial", track);
    var current = 0;
    var startX = 0;
    var deltaX = 0;
    var dragging = false;

    var dots = slides.map(function (_, index) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Ir para o depoimento " + (index + 1));
      dot.addEventListener("click", function () { goTo(index); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function syncDots() {
      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === current);
        dot.setAttribute("aria-selected", index === current ? "true" : "false");
      });
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      syncDots();
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); });

    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      deltaX = 0;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      deltaX = e.clientX - startX;
      track.style.transform = "translateX(calc(-" + current * 100 + "% + " + deltaX + "px))";
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");

      if (Math.abs(deltaX) > 45) {
        goTo(current + (deltaX < 0 ? 1 : -1));
      } else {
        goTo(current);
      }
      deltaX = 0;
    }

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("pointerleave", function () {
      if (dragging) endDrag();
    });

    document.addEventListener("keydown", function (e) {
      var lightboxOpen = lightbox && lightbox.classList.contains("is-open");
      if (lightboxOpen) return;
      var rect = track.getBoundingClientRect();
      var inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === "ArrowLeft" && document.activeElement === track) goTo(current - 1);
      if (e.key === "ArrowRight" && document.activeElement === track) goTo(current + 1);
    });

    track.setAttribute("tabindex", "0");
    track.setAttribute("role", "group");
    track.setAttribute("aria-label", "Depoimentos — arraste para os lados ou use as setas");

    syncDots();
  }

  /* --------------------------- 9. FAQ ------------------------------------ */
  var faqButtons = $$("#faqAccordion .accordion__button");

  faqButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var item = button.closest(".accordion__item");
      var isOpen = item.classList.contains("is-open");

      $$("#faqAccordion .accordion__item").forEach(function (other) {
        other.classList.remove("is-open");
        var otherBtn = $(".accordion__button", other);
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* --------------------- 10. ANTES / DEPOIS ------------------------------ */
  $$("[data-ba]").forEach(function (ba) {
    var frame = $(".ba__frame", ba);
    var value = 50;
    var isDragging = false;

    function apply() {
      value = clamp(value, 0, 100);
      ba.style.setProperty("--pos", value + "%");
      ba.setAttribute("aria-valuenow", Math.round(value));
      ba.setAttribute("aria-valuetext", Math.round(value) + " por cento");
    }

    function setFromClientX(clientX) {
      var rect = frame.getBoundingClientRect();
      if (!rect.width) return;
      value = ((clientX - rect.left) / rect.width) * 100;
      apply();
    }

    apply();

    frame.addEventListener("pointerdown", function (e) {
      isDragging = true;
      ba.classList.add("is-dragging");
      frame.setPointerCapture(e.pointerId);
      setFromClientX(e.clientX);
      e.preventDefault();
    });

    frame.addEventListener("pointermove", function (e) {
      if (!isDragging) return;
      setFromClientX(e.clientX);
    });

    function stopDragging() {
      isDragging = false;
      ba.classList.remove("is-dragging");
    }

    frame.addEventListener("pointerup", stopDragging);
    frame.addEventListener("pointercancel", stopDragging);

    ba.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 10 : 4;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        value -= step;
        apply();
        e.preventDefault();
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        value += step;
        apply();
        e.preventDefault();
      } else if (e.key === "Home") {
        value = 0;
        apply();
        e.preventDefault();
      } else if (e.key === "End") {
        value = 100;
        apply();
        e.preventDefault();
      }
    });
  });

  /* ------------- 11. FALLBACK DE IMAGENS E ANO DO RODAPÉ ----------------- */
  function markMissing(img) {
    img.classList.add("img-missing");
    var media = img.closest(".media");
    if (media) media.classList.add("is-missing");

    var heroMedia = img.closest(".hero__media");
    if (heroMedia) heroMedia.classList.add("is-missing");

    var cta = img.closest(".cta-final");
    if (cta) cta.classList.add("is-missing");
  }

  $$("img").forEach(function (img) {
    img.addEventListener("error", function () { markMissing(img); });
    if (img.complete && img.naturalWidth === 0) markMissing(img);
  });

  var yearEl = $("#year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* Garante o estado inicial do cabeçalho/progresso */
  onScrollFrame();
})();
