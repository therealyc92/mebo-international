/* ============================================
   MEBO International — Script Principal
   ============================================ */

(function () {
  'use strict';

  /* ---------- Hero Carousel ---------- */
  function initHeroCarousel() {
    var slides = document.querySelectorAll('.hero-slide');
    var dots = document.querySelectorAll('.hero-dot');
    if (!slides.length || !dots.length) return;

    var current = 0;
    var total = slides.length;
    var interval = 8000;
    var timer = null;

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = index % total;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    function next() { goTo(current + 1); }

    function start() {
      timer = setInterval(next, interval);
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        stop();
        goTo(i);
        start();
      });
    });

    // Pause on hover
    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    start();
  }

  /* ---------- Featured News Carousel (news page) ---------- */
  function initFeaturedCarousel() {
    var box = document.querySelector('.feat-carousel');
    if (!box) return;
    var slides = box.querySelectorAll('.fc-slide');
    var dots = box.querySelectorAll('.fc-dot');
    if (!slides.length || !dots.length) return;

    var current = 0;
    var total = slides.length;
    var interval = 5000;
    var timer = null;

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = ((index % total) + total) % total;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    function next() { goTo(current + 1); }
    function start() { if (!timer) timer = setInterval(next, interval); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        stop();
        goTo(i);
        start();
      });
    });

    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', start);

    start();
  }

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

  /* ---------- Contador animado de estadísticas (Odometer style) ---------- */
  function initCounters() {
    var odometers = document.querySelectorAll('.odometer');
    if (!odometers.length) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var buildOdometer = function (el) {
      var target = el.getAttribute('data-target');
      var suffix = el.getAttribute('data-suffix') || '';

      // If target is not numeric, just show text
      if (!target || !/^\d+$/.test(target)) {
        el.textContent = (target || '') + suffix;
        return;
      }

      var digits = target.split('');

      digits.forEach(function (digit, i) {
        var digitWrap = document.createElement('span');
        digitWrap.className = 'odometer-digit';

        var strip = document.createElement('span');
        strip.className = 'odometer-digit-strip';

        // Build 0-9 digit strip
        for (var n = 0; n <= 9; n++) {
          var num = document.createElement('span');
          num.textContent = n;
          strip.appendChild(num);
        }

        digitWrap.appendChild(strip);
        el.appendChild(digitWrap);

        if (!reduceMotion) {
          // Animate with staggered delay per digit
          setTimeout(function () {
            strip.style.transform = 'translateY(-' + (parseInt(digit, 10) * 10) + '%)';
          }, 150 + i * 120);
        } else {
          // Show final value immediately for reduced motion
          strip.style.transform = 'translateY(-' + (parseInt(digit, 10) * 10) + '%)';
        }
      });

      if (suffix) {
        var suffixEl = document.createElement('span');
        suffixEl.className = 'odometer-suffix';
        suffixEl.textContent = suffix;
        el.appendChild(suffixEl);
      }
    };

    if (!('IntersectionObserver' in window)) {
      odometers.forEach(buildOdometer);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          buildOdometer(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    odometers.forEach(function (el) { observer.observe(el); });
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
    initHeroCarousel();
    initFeaturedCarousel();
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
    initContactFloat();
  }

  /* ---------- 悬浮联系按钮 (WhatsApp / Email) ---------- */
  function initContactFloat() {
    if (document.querySelector('.contact-float')) return;
    var isEN = /^\/en\//.test(location.pathname) || document.documentElement.lang === 'en';
    var waLabel = isEN ? 'Chat on WhatsApp' : 'Chatear por WhatsApp';
    var mailLabel = isEN ? 'Email us' : 'Escríbenos';
    var wrap = document.createElement('div');
    wrap.className = 'contact-float';
    wrap.innerHTML =
      '<a class="cf-btn cf-btn--mail" href="mailto:contacto@mebo.com" aria-label="' + mailLabel + '">'
      + '<span class="cf-tip">' + mailLabel + '</span>'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
      + '</a>'
      + '<a class="cf-btn cf-btn--wa" href="https://wa.me/8615210986621?text=' + encodeURIComponent(isEN ? 'Hello, I would like to know more about MEBO products.' : 'Hola, quisiera más información sobre los productos MEBO.') + '" target="_blank" rel="noopener" aria-label="' + waLabel + '">'
      + '<span class="cf-tip">' + waLabel + '</span>'
      + '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 0 1 9.88 9.89c0 5.45-4.44 9.88-9.89 9.88zm8.42-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.47-8.41z"/></svg>'
      + '</a>';
    document.body.appendChild(wrap);
  }

  // content.js(CMS 渲染层)先渲染动态内容,再执行本站初始化
  function boot() {
    if (window.MEBO_READY && typeof window.MEBO_READY.then === 'function') {
      window.MEBO_READY.then(init, init);
    } else {
      init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
