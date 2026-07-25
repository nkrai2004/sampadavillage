// Sampada Village — shared interactions
document.addEventListener('DOMContentLoaded', function () {

  // Sticky header solid state
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('solid');
    else header.classList.remove('solid');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      var expanded = navLinks.classList.contains('open');
      menuBtn.setAttribute('aria-expanded', expanded);
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });
  }

  // Reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Lightbox for gallery
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    document.querySelectorAll('[data-lightbox]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        lbImg.src = link.getAttribute('href');
        lbImg.alt = link.querySelector('img') ? link.querySelector('img').alt : '';
        lightbox.classList.add('open');
      });
    });
    function closeLB() { lightbox.classList.remove('open'); lbImg.src = ''; }
    closeBtn.addEventListener('click', closeLB);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLB(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLB(); });
  }

  // Footer year
  var y = document.querySelector('#year');
  if (y) y.textContent = new Date().getFullYear();

  // Promo popup — show once per browser session, a couple seconds after load
  var overlay = document.querySelector('.promo-overlay');
  if (overlay) {
    var SEEN_KEY = 'sampada_promo_seen';
    var closeBtn = overlay.querySelector('#promoClose');
    var dismissBtn = overlay.querySelector('#promoDismiss');

    function openPromo() {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closePromo() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
    }

    var alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) {}

    if (!alreadySeen) {
      setTimeout(openPromo, 1400);
    }
    if (closeBtn) closeBtn.addEventListener('click', closePromo);
    if (dismissBtn) dismissBtn.addEventListener('click', closePromo);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closePromo(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePromo(); });
  }
});
