/* English <-> Marathi button for the whole school website (Google Translate in the background). */
(function () {
  var KEY = 'zp_lang';

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function store(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} }
  function stored() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function isMarathi() { return stored() === 'mr' || /\/mr$/.test(getCookie('googtrans')); }

  function setCookie(value) {
    var host = location.hostname, parts = host.split('.');
    var expire = value ? '' : '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    var base = 'googtrans=' + value + expire + '; path=/';
    document.cookie = base;
    document.cookie = base + '; domain=' + host;
    if (parts.length > 2) document.cookie = base + '; domain=.' + parts.slice(-2).join('.');
  }
  function setLang(lang) {
    store(lang === 'mr' ? 'mr' : '');
    setCookie(lang === 'mr' ? '/en/mr' : '');
  }

  var css = document.createElement('style');
  css.textContent =
    '#google_translate_element{position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden}' +
    '.goog-te-banner-frame,.goog-te-balloon-frame,#goog-gt-tt,.goog-tooltip,.VIpgJd-ZVi9od-ORHb-OEVmcd,.VIpgJd-ZVi9od-aZ2wEe-wOHMyf{display:none!important}' +
    'body{top:0!important}.goog-text-highlight{background:none!important;box-shadow:none!important}' +
    '.lang-btn{border:1.5px solid #e8823c;background:#fff;color:#b25716;border-radius:50px;padding:7px 15px;' +
    'font-weight:600;font-size:14px;line-height:1.2;font-family:inherit;cursor:pointer;white-space:nowrap;margin:0 6px;transition:background .2s,color .2s}' +
    '.lang-btn:hover,.lang-btn:focus-visible{background:#e8823c;color:#fff}' +
    '@media(max-width:600px){.lang-btn{padding:6px 11px;font-size:13px;margin:0 4px}}' +
    /* keep the English menu on one line now that the language button takes space */
    '@media(min-width:901px){' +
      '.site-header .main-nav a,.site-header .nav-cta .btn,.site-header .site-nav a{white-space:nowrap!important}' +
      '.site-header .main-nav{gap:12px!important}' +
      '.site-header .main-nav>a,.site-header .main-nav>.nav-item>a{font-size:15px!important;padding-left:4px!important;padding-right:4px!important}' +
      '.site-header .nav-cta .btn{padding:10px 18px!important;font-size:14px!important}' +
      '.lang-btn{padding:6px 13px;font-size:13px;margin:0 0 0 4px}' +
    '}' +
    '@media(min-width:901px) and (max-width:1100px){' +
      '.site-header .main-nav{gap:6px!important}' +
      '.site-header .main-nav>a,.site-header .main-nav>.nav-item>a{font-size:13px!important}' +
      '.site-header .nav-cta .btn{padding:8px 12px!important;font-size:13px!important}' +
    '}';
  document.head.appendChild(css);

  function addButton() {
    var marathi = isMarathi();
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'langBtn';
    btn.className = 'lang-btn notranslate';
    btn.setAttribute('translate', 'no');
    btn.textContent = marathi ? 'English' : 'मराठी';
    btn.setAttribute('aria-label', marathi ? 'Switch site to English' : 'Switch site to Marathi');
    btn.addEventListener('click', function () {
      setLang(isMarathi() ? 'en' : 'mr');
      location.reload();
    });
    var toggle = document.getElementById('navToggle');
    var box = document.querySelector('.site-header .container') || document.querySelector('.site-header .in') || document.querySelector('.site-header');
    if (toggle && toggle.parentNode) toggle.parentNode.insertBefore(btn, toggle);
    else if (box) box.appendChild(btn);
  }

  // Ask Google's hidden language list to switch to Marathi (does not depend on cookies)
  function applyMarathi() {
    var tries = 0;
    var timer = setInterval(function () {
      var combo = document.querySelector('select.goog-te-combo');
      tries++;
      if (combo) {
        if (combo.value !== 'mr') {
          combo.value = 'mr';
          combo.dispatchEvent(new Event('change'));
        }
        clearInterval(timer);
      } else if (tries > 50) { clearInterval(timer); }
    }, 200);
  }

  function loadTranslate() {
    var holder = document.createElement('div');
    holder.id = 'google_translate_element';
    document.body.appendChild(holder);
    window.gtInit = function () {
      new google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: 'mr', autoDisplay: false },
        'google_translate_element'
      );
      applyMarathi();
    };
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=gtInit';
    s.onerror = function () {
      setLang('en');
      alert('Marathi translation could not load. Please check your internet connection and try again.');
      var b = document.getElementById('langBtn');
      if (b) b.textContent = 'मराठी';
    };
    document.head.appendChild(s);
  }

  function start() {
    addButton();
    if (isMarathi()) loadTranslate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
