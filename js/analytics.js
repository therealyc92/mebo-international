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

  // Public API: track event (auto-attaches language + page path to every event)
  function trackEvent(eventName, params) {
    if (!hasAnalyticsConsent()) return;
    if (typeof window.gtag !== 'function') return;
    params = params || {};
    if (!params.language) params.language = document.documentElement.lang || 'unknown';
    if (!params.page_path) params.page_path = window.location.pathname;
    window.gtag('event', eventName, params);
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
    var is404 = /404\.html/.test(window.location.pathname) ||
      document.title.indexOf('404') > -1;
    var pageType = 'standard';
    if (is404) pageType = '404_error';
    else if (document.querySelector('.hcp-gate')) pageType = 'hcp_gated';
    else if (document.querySelector('.hero')) pageType = 'home';
    else if (document.querySelector('.page-hero')) pageType = 'inner_page';
    else if (document.querySelector('#contact-form')) pageType = 'contact';

    setTimeout(function () {
      trackEvent('page_view_enriched', {
        page_type: pageType,
        language: lang,
        has_hcp_gate: !!document.querySelector('.hcp-gate'),
        has_contact_form: !!document.querySelector('#contact-form'),
        sections_count: document.querySelectorAll('section').length
      });
      if (is404) {
        trackEvent('page_not_found', {
          attempted_url: window.location.pathname + window.location.search,
          referrer: document.referrer || '(direct)'
        });
      }
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

  // 10. Site search (search.js overlay)
  function initSearchTracking() {
    // Overlay open
    document.addEventListener('click', function (e) {
      if (e.target.closest('.nav-search')) {
        trackEvent('search_open', { page: window.location.pathname });
      }
    });
    // Query submitted (debounced keystrokes -> one 'search' event per query)
    var debounceTimer = null;
    var lastTracked = '';
    document.addEventListener('input', function (e) {
      if (!e.target || !e.target.classList || !e.target.classList.contains('search-input')) return;
      var q = (e.target.value || '').trim();
      if (q.length < 2) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (q === lastTracked) return;
        lastTracked = q;
        trackEvent('search', { search_term: q });
      }, 900);
    });
    // Result click
    document.addEventListener('click', function (e) {
      var item = e.target.closest('.search-item');
      if (!item) return;
      var input = document.querySelector('.search-input');
      var items = document.querySelectorAll('.search-item');
      var pos = Array.prototype.indexOf.call(items, item) + 1;
      trackEvent('select_search_result', {
        search_term: input ? (input.value || '').trim() : '',
        result_url: item.getAttribute('href') || '',
        result_position: pos
      });
    });
  }

  // 11. News category filter
  function initNewsFilterTracking() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.news-filter button[data-cat]');
      if (!btn) return;
      trackEvent('news_filter', {
        category: btn.getAttribute('data-cat'),
        filter_label: (btn.textContent || '').trim()
      });
    });
  }

  // 12. News list pagination
  function initNewsPagerTracking() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('#pager-prev, #pager-next');
      if (!btn) return;
      var input = document.getElementById('pager-input');
      trackEvent('news_pager', {
        direction: btn.id === 'pager-prev' ? 'prev' : 'next',
        from_page: input ? parseInt(input.value, 10) || 1 : 1
      });
    });
    document.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'pager-input') {
        trackEvent('news_pager', {
          direction: 'jump',
          to_page: parseInt(e.target.value, 10) || 1
        });
      }
    });
  }

  // 13. Featured story carousel
  function initCarouselTracking() {
    document.addEventListener('click', function (e) {
      var dot = e.target.closest('.fc-dot');
      if (dot) {
        trackEvent('carousel_interaction', {
          action: 'dot_nav',
          slide_index: parseInt(dot.getAttribute('data-slide'), 10) + 1 || 0,
          slide_title: dot.getAttribute('aria-label') || ''
        });
        return;
      }
      var slide = e.target.closest('.fc-slide');
      if (slide) {
        var t = slide.querySelector('.fc-title, h3, h2');
        trackEvent('carousel_interaction', {
          action: 'slide_click',
          slide_title: t ? (t.textContent || '').trim().substring(0, 80) : (slide.getAttribute('href') || '')
        });
      }
    });
  }

  // 14. Video engagement (media events don't bubble -> capture phase)
  function initVideoTracking() {
    function videoName(v) {
      return v.getAttribute('aria-label') || v.id ||
        (v.currentSrc || v.src || '').split('/').pop() || 'unknown';
    }
    document.addEventListener('play', function (e) {
      if (e.target.tagName !== 'VIDEO') return;
      trackEvent('video_play', {
        video_title: videoName(e.target),
        video_location: getElementSection(e.target)
      });
    }, true);
    document.addEventListener('timeupdate', function (e) {
      var v = e.target;
      if (v.tagName !== 'VIDEO' || !v.duration) return;
      var pct = (v.currentTime / v.duration) * 100;
      if (pct >= 50 && !v._meboTracked50) {
        v._meboTracked50 = true;
        trackEvent('video_progress', {
          video_title: videoName(v),
          percent: 50
        });
      }
    }, true);
    document.addEventListener('ended', function (e) {
      if (e.target.tagName !== 'VIDEO') return;
      trackEvent('video_complete', {
        video_title: videoName(e.target)
      });
    }, true);
  }

  // 15. Contact channels: floating widget + any mailto/WhatsApp link
  function initContactChannelTracking() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      var isFloat = !!link.closest('.contact-float');
      if (href.indexOf('https://wa.me/') === 0) {
        trackEvent('contact_click', {
          channel: 'whatsapp',
          source: isFloat ? 'float_widget' : 'page',
          link_location: getElementSection(link)
        });
      } else if (href.indexOf('mailto:') === 0) {
        trackEvent('contact_click', {
          channel: 'email',
          source: isFloat ? 'float_widget' : 'page',
          email_address: href.replace('mailto:', '').split('?')[0]
        });
      }
    });
  }

  // 16. File downloads (PDF studies, etc.)
  function initFileDownloadTracking() {
    var exts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip'];
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = (link.getAttribute('href') || '').split('?')[0].toLowerCase();
      for (var i = 0; i < exts.length; i++) {
        if (href.slice(-exts[i].length) === exts[i]) {
          trackEvent('file_download', {
            file_name: decodeURIComponent(href.split('/').pop()),
            file_extension: exts[i].replace('.', ''),
            link_url: link.getAttribute('href')
          });
          return;
        }
      }
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
    initSearchTracking();
    initNewsFilterTracking();
    initNewsPagerTracking();
    initCarouselTracking();
    initVideoTracking();
    initContactChannelTracking();
    initFileDownloadTracking();
    enrichPageView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
