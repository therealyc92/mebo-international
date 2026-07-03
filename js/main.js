/* ============================================
   MEBO International — Script Principal
   ============================================ */

(function () {
  'use strict';

  /* ---------- Navegación Móvil ---------- */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      menu.classList.toggle('open');
      var expanded = menu.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('open');
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains('open')) {
        toggle.classList.remove('open');
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Sombra de navegación al desplazar ---------- */
  function initNavScroll() {
    var navbar = document.querySelector('.navbar');
    var progressBar = document.querySelector('.reading-progress');
    if (!navbar && !progressBar) return;
    var onScroll = function () {
      var y = window.scrollY;
      if (navbar) {
        if (y > 20) navbar.classList.add('navbar--scrolled');
        else navbar.classList.remove('navbar--scrolled');
      }
      if (progressBar) {
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Animación de aparición al desplazar ---------- */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Contador animado de estadísticas ---------- */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    var animateCounter = function (el) {
      var target = parseInt(el.getAttribute('data-counter'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1800;

      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        el.textContent = target.toLocaleString('es') + suffix;
        return;
      }

      var startMs = Date.now();
      var tick = setInterval(function () {
        var elapsed = Date.now() - startMs;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = current.toLocaleString('es') + suffix;
        if (progress >= 1) {
          clearInterval(tick);
          el.textContent = target.toLocaleString('es') + suffix;
        }
      }, 16);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Barras de gráfico animadas ---------- */
  function initBarCharts() {
    var bars = document.querySelectorAll('.bar-fill[data-width]');
    if (!bars.length) return;

    if (!('IntersectionObserver' in window)) {
      bars.forEach(function (bar) { bar.style.width = bar.getAttribute('data-width'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var bar = entry.target;
          setTimeout(function () {
            bar.style.width = bar.getAttribute('data-width');
          }, 100);
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(function (bar) { observer.observe(bar); });
  }

  /* ---------- Puerta HCP (Profesionales de la Salud) ---------- */
  function initHCPGate() {
    var gate = document.getElementById('hcp-gate-form');
    if (!gate) return;

    var checkbox = gate.querySelector('#hcp-confirm');
    var btn = gate.querySelector('#hcp-enter');
    var gateSection = document.getElementById('hcp-gate');
    var contentSection = document.getElementById('hcp-content');
    var contentSection2 = document.getElementById('hcp-content-section');

    if (!checkbox || !btn || !gateSection || !contentSection) return;

    // Estilo inicial del botón (deshabilitado)
    btn.style.opacity = '0.5';

    checkbox.addEventListener('change', function () {
      if (checkbox.checked) {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      } else {
        btn.style.opacity = '0.5';
      }
    });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (checkbox.checked) {
        gateSection.style.display = 'none';
        contentSection.classList.add('active');
        if (contentSection2) contentSection2.style.display = 'block';
        contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        alert('Debe confirmar que es un profesional de la salud para acceder a este contenido.');
      }
    });
  }

  /* ---------- Banner de cumplimiento ---------- */
  function initComplianceBanner() {
    var banner = document.querySelector('.compliance-banner');
    var dismissBtn = document.querySelector('.compliance-banner .dismiss-btn');
    if (!banner || !dismissBtn) return;

    if (sessionStorage.getItem('mebo-banner-dismissed') === 'true') {
      banner.style.display = 'none';
      return;
    }

    document.body.classList.add('has-banner');

    dismissBtn.addEventListener('click', function () {
      banner.style.display = 'none';
      document.body.classList.remove('has-banner');
      sessionStorage.setItem('mebo-banner-dismissed', 'true');
    });
  }

  /* ---------- Cookie Consent ---------- */
  function initCookieConsent() {
    var consent = document.getElementById('cookie-consent');
    if (!consent) return;

    // Verificar si ya se aceptó o rechazó
    var stored = localStorage.getItem('mebo-cookie-consent');
    if (stored) {
      consent.classList.remove('show');
      return;
    }

    // Mostrar después de un breve retraso
    setTimeout(function () {
      consent.classList.add('show');
    }, 1500);

    // Manejar clics en los botones
    consent.querySelectorAll('[data-cookie-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-cookie-action');
        localStorage.setItem('mebo-cookie-consent', action);
        consent.classList.remove('show');
      });
    });
  }

  /* ---------- Formulario de contacto ---------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var successMsg = document.getElementById('form-success');
      if (successMsg) {
        successMsg.style.display = 'block';
        form.reset();
        setTimeout(function () {
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    });
  }

  /* ---------- Año dinámico en el pie de página ---------- */
  function initFooterYear() {
    var yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ---------- Language Switcher (同期跳转) ---------- */
  function initLanguageSwitcher() {
    var switcher = document.querySelector('.lang-switcher');
    if (!switcher) return;

    switcher.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        // El href ya contiene la URL destino. Solo añadimos manejo adicional si hay data-page.
        var targetPage = link.getAttribute('data-target-page');
        if (targetPage) {
          e.preventDefault();
          window.location.href = targetPage;
        }
      });
    });
  }

  /* ---------- Inicialización ---------- */
  function init() {
    initMobileNav();
    initNavScroll();
    initScrollAnimations();
    initCounters();
    initBarCharts();
    initHCPGate();
    initComplianceBanner();
    initCookieConsent();
    initContactForm();
    initFooterYear();
    initLanguageSwitcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
