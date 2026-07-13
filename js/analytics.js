/* ============================================
   MEBO International - Google Analytics 4
   Measurement ID: G-X9NMMSXRDT
   ============================================ */

(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-X9NMMSXRDT';
  var COOKIE_CONSENT_KEY = 'mebo-cookie-consent';

  // Don't load GA until user has accepted cookies
  function hasAnalyticsConsent() {
    try {
      return localStorage.getItem(COOKIE_CONSENT_KEY) === 'all';
    } catch (e) {
      return false;
    }
  }

  // Load gtag.js script
  function loadGA() {
    if (window.gtag_loaded) return;
    window.gtag_loaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: true,
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(s);
  }

  // Public API: track event
  function trackEvent(eventName, params) {
    if (!hasAnalyticsConsent()) return;
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params || {});
  }

  // ---------- Auto-tracking setups ----------

  // 1. Language switcher
  function initLanguageSwitcherTracking() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('.lang-switcher a');
      if (!link) return;
      var targetLang = link.textContent.trim();
      var currentLang = document.documentElement.lang || 'unknown';
      trackEvent('language_switch', {
        from_language: currentLang,
        to_language: targetLang,
        target_url: link.getAttribute('href'),
        page_location: window.location.pathname
      });
    });
  }

  // 2. CTA button clicks
  function initCTATracking() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn, .hero-actions a, .cta-section a, .study-link, .resource-card');
      if (!btn) return;
      var text = (btn.textContent || '').trim().substring(0, 80);
      var href = btn.getAttribute('href') || '';
      var className = btn.className || '';
      trackEvent('cta_click', {
        cta_text: text,
        cta_url: href,
        cta_location: getElementSection(btn),
        cta_type: getCTAClass(className)
      });
    });
  }

  function getElementSection(el) {
    var section = el.closest('section, header, footer, nav, main');
    if (!section) return 'unknown';
    if (section.classList.contains('hero')) return 'hero';
    if (section.classList.contains('page-hero')) return 'page_hero';
    if (section.classList.contains('cta-section')) return 'cta_section';
    if (section.classList.contains('footer')) return 'footer';
    if (section.tagName === 'NAV') return 'navigation';
    return section.className.split(' ')[0] || 'body';
  }

  function getCTAClass(className) {
    if (className.indexOf('btn--primary') > -1) return 'primary';
    if (className.indexOf('btn--accent') > -1) return 'accent';
    if (className.indexOf('btn--light') > -1) return 'light';
    if (className.indexOf('btn--outline') > -1) return 'outline';
    if (className.indexOf('study-link') > -1) return 'study_link';
    if (className.indexOf('resource-card') > -1) return 'resource';
    return 'default';
  }

  // 3. HCP Gate interactions
  function initHCPGateTracking() {
    document.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'hcp-confirm') {
        trackEvent('hcp_gate_interaction', {
          action: e.target.checked ? 'checkbox_checked' : 'checkbox_unchecked',
          page: window.location.pathname
        });
      }
    });

    document.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'hcp-enter') {
        var checked = document.getElementById('hcp-confirm');
        trackEvent('hcp_gate_access', {
          confirmed: !!(checked && checked.checked),
          page: window.location.pathname
        });
      }
    });
  }

  // 4. Contact form
  function initContactFormTracking() {
    document.addEventListener('focusin', function (e) {
      var field = e.target;
      if (!field || !field.id) return;
      var form = field.closest('form');
      if (!form || form.id !== 'contact-form') return;
      trackEvent('form_field_focus', {
        field_name: field.id,
        field_type: field.type || field.tagName.toLowerCase(),
        form_id: 'contact-form'
      });
    });

    // Listen for form submit to track conversion.
    // main.js handles the form reset and success display; we just track.
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || form.id !== 'contact-form') return;
      trackEvent('form_submit', {
        form_id: 'contact-form',
        form_name: 'contact_inquiry',
        page: window.location.pathname
      });
    }, true); // capture phase so we fire before main.js's preventDefault
  }

  // 5. Scroll depth tracking
  function initScrollDepthTracking() {
    var milestones = [25, 50, 75, 100];
    var reached = {};
    var ticking = false;

    function checkScroll() {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      var percent = Math.round((window.scrollY / docHeight) * 100);
      milestones.forEach(function (m) {
        if (percent >= m && !reached[m]) {
          reached[m] = true;
          trackEvent('scroll_depth', {
            percent: m,
            page: window.location.pathname
          });
        }
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(checkScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  // 6. Page metadata enrichment
  function enrichPageView() {
    var lang = document.documentElement.lang || 'unknown';
    var pageType = 'standard';
    if (document.querySelector('.hcp-gate')) pageType = 'hcp_gated';
    if (document.querySelector('.hero')) pageType = 'home';
    if (document.querySelector('.page-hero')) pageType = 'inner_page';
    if (document.querySelector('#contact-form')) pageType = 'contact';

    setTimeout(function () {
      trackEvent('page_view_enriched', {
        page_type: pageType,
        language: lang,
        has_hcp_gate: !!document.querySelector('.hcp-gate'),
        has_contact_form: !!document.querySelector('#contact-form'),
        sections_count: document.querySelectorAll('section').length
      });
    }, 1000);
  }

  // 7. Reading progress milestone
  function initReadingProgressTracking() {
    var reached50 = false;
    var reached100 = false;
    function check() {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      var p = (window.scrollY / docHeight) * 100;
      if (p >= 50 && !reached50) {
        reached50 = true;
        trackEvent('reading_progress', { milestone: '50_percent' });
      }
      if (p >= 100 && !reached100) {
        reached100 = true;
        trackEvent('reading_progress', { milestone: 'complete' });
      }
    }
    window.addEventListener('scroll', check, { passive: true });
  }

  // 8. External link tracking
  function initExternalLinkTracking() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      if (href.indexOf('http') === 0 && href.indexOf('mebo') === -1) {
        trackEvent('external_link_click', {
          link_url: href,
          link_domain: link.hostname,
          link_text: (link.textContent || '').trim().substring(0, 50)
        });
      }
    });
  }

  // 9. Cookie consent change tracking
  function initCookieConsentTracking() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cookie-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-cookie-action');
      trackEvent('cookie_consent', {
        action: action,
        page: window.location.pathname
      });
    });
  }

  // ---------- Public API ----------
  window.MEBOAnalytics = {
    track: trackEvent,
    trackPageView: function (pagePath) {
      trackEvent('page_view', { page_path: pagePath || window.location.pathname });
    }
  };

  // ---------- Initialization ----------
  function init() {
    if (hasAnalyticsConsent()) {
      loadGA();
    }

    // Listen for cookie consent changes
    window.addEventListener('storage', function (e) {
      if (e.key === COOKIE_CONSENT_KEY && e.newValue === 'all') {
        loadGA();
        // Track the consent change
        setTimeout(function () {
          trackEvent('cookie_consent_granted', { page: window.location.pathname });
        }, 500);
      }
    });

    // Override cookie consent to trigger GA load
    var origInitCookieConsent = window.MEBO_initCookieConsent;
    if (origInitCookieConsent) {
      window.MEBO_initCookieConsent = origInitCookieConsent;
    }

    // Patch the consent button handlers to load GA on accept
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cookie-action="all"]');
      if (btn && !window.gtag_loaded) {
        setTimeout(loadGA, 100);
      }
    });

    // Initialize auto-trackers regardless (they will only fire if GA is loaded)
    initLanguageSwitcherTracking();
    initCTATracking();
    initHCPGateTracking();
    initContactFormTracking();
    initScrollDepthTracking();
    initReadingProgressTracking();
    initExternalLinkTracking();
    initCookieConsentTracking();
    enrichPageView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
