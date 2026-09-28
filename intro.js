(function () {
  var root = document.documentElement;
  var intro = document.getElementById('intro');
  var spacer = document.getElementById('introSpacer');
  var site = document.getElementById('site');
  if (!intro || !spacer || !site || root.classList.contains('skip-intro')) return;

  var hint = intro.querySelector('.intro-scroll');
  var H = window.innerHeight;
  var W = window.innerWidth;
  var ticking = false;

  function update() {
    ticking = false;
    var s = Math.max(0, Math.min(window.scrollY, H));
    if (s >= H) {
      // fully lifted: hide the curtain and drop the transform
      // (a transform would break the position:fixed mobile menu)
      intro.style.visibility = 'hidden';
      site.style.transform = '';
      return;
    }
    intro.style.visibility = 'visible';
    // curtain moves up with the scroll, the page underneath stays put
    intro.style.transform = 'translate3d(0,' + (-s) + 'px,0)';
    site.style.transform = 'translate3d(0,' + (-(H - s)) + 'px,0)';
    if (hint) hint.style.opacity = Math.max(0, 1 - s / (H * 0.2));
  }

  function layout() {
    spacer.style.height = H + 'px';
    intro.style.height = H + 'px';
    update();
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  // ignore height-only resizes (mobile address bar) to avoid jitter
  window.addEventListener('resize', function () {
    if (window.innerWidth !== W) {
      W = window.innerWidth;
      H = window.innerHeight;
      layout();
    }
  });

  // tap / click on the curtain lifts it
  intro.addEventListener('click', function () {
    window.scrollTo({ top: H, behavior: 'smooth' });
  });

  layout();
})();
