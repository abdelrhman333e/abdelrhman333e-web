(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const save = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  /* ---------- Language & Theme ---------- */
  const langToggle = $('#langToggle');
  const themeToggle = $('#themeToggle');

  const syncLabels = () => {
    const en = root.classList.contains('english');
    const light = root.classList.contains('light');
    langToggle.textContent = en ? 'العربية' : 'EN';
    langToggle.setAttribute('aria-label', en ? 'التبديل إلى العربية' : 'Switch to English');
    themeToggle.setAttribute('aria-label', en
      ? (light ? 'Switch to dark mode' : 'Switch to light mode')
      : (light ? 'التبديل إلى الوضع الداكن' : 'التبديل إلى الوضع الفاتح'));
    $('#toTop').setAttribute('aria-label', en ? 'Back to top' : 'العودة للأعلى');
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = light ? '#eef4fc' : '#040814';
  };

  langToggle.addEventListener('click', () => {
    const en = !root.classList.contains('english');
    root.classList.toggle('english', en);
    root.lang = en ? 'en' : 'ar';
    root.dir = en ? 'ltr' : 'rtl';
    save('lang', en ? 'en' : 'ar');
    syncLabels();
    startRoles();
  });

  themeToggle.addEventListener('click', () => {
    const light = root.classList.toggle('light');
    save('theme', light ? 'light' : 'dark');
    syncLabels();
  });

  /* ---------- Interactive Bento Spotlight Glow ---------- */
  if (!reduced) {
    $$('.bento-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });
  }

  /* ---------- Scroll Progress & Back to Top ---------- */
  const progress = $('#progress');
  const toTop = $('#toTop');
  const onScroll = () => {
    const h = root.scrollHeight - innerHeight;
    progress.style.width = (h > 0 ? Math.min(100, (scrollY / h) * 100) : 0) + '%';
    toTop.classList.toggle('show', scrollY > 500);
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

  /* ---------- Active Nav & Reveal on Scroll ---------- */
  const links = $$('.nav a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);

  if ('IntersectionObserver' in window) {
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(s => navObs.observe(s));

    const revObs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        o.unobserve(e.target);
      });
    }, { threshold: 0.1 });

    $$('.reveal').forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 65 + 'ms';
      revObs.observe(el);
    });
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ---------- Rotating Titles ---------- */
  let rolesTimer;
  function startRoles() {
    clearInterval(rolesTimer);
    if (reduced) return;
    const box = $$('.title[data-roles]').find(t => t.offsetParent !== null);
    if (!box) return;
    const roles = box.dataset.roles.split('|');
    const span = $('.role', box);
    let i = Math.max(0, roles.indexOf(span.textContent));
    rolesTimer = setInterval(() => {
      span.classList.add('out');
      setTimeout(() => {
        i = (i + 1) % roles.length;
        span.textContent = roles[i];
        span.classList.remove('out');
      }, 320);
    }, 2800);
  }

  /* ---------- Copy Email ---------- */
  const copyBtn = $('#copyMail');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const en = root.classList.contains('english');
      const label = $(en ? '.lang-en' : '.lang-ar', copyBtn);
      const old = label.textContent;
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.copy);
        label.textContent = en ? 'Copied!' : 'تم النسخ!';
      } catch (e) {
        label.textContent = en ? 'Failed' : 'تعذّر النسخ';
      }
      setTimeout(() => { label.textContent = old; }, 1800);
    });
  }

  syncLabels();
  onScroll();
  startRoles();
})();