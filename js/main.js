// Portfolio Interactions & Smooth Theme Controller
document.addEventListener('DOMContentLoaded', () => {
  initThemeAndLayout();
  initCopyEmail();
  initHeaderScrollShadow();
  initFormSubmissions();
  initRepoStars();
});

const ACTIVE_BTN_CLASSES = ['bg-indigo-600', 'text-white', 'shadow-md'];
const INACTIVE_BTN_CLASSES = ['text-slate-600', 'dark:text-slate-400', 'hover:text-slate-900', 'dark:hover:text-white'];

function switchTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  try { localStorage.setItem('portfolio-layout-theme', themeName); } catch (e) { }

  const bentoRoot = document.getElementById('theme-bento-root');
  const modernRoot = document.getElementById('theme-modern-root');
  const cyberRoot = document.getElementById('theme-cyber-root');
  const roots = [bentoRoot, modernRoot, cyberRoot];

  // Active theme selector styling update
  ['bento', 'modern', 'cyber'].forEach(t => {
    const btn = document.getElementById(`btn-theme-${t}`);
    if (btn) {
      const isActive = t === themeName;
      btn.setAttribute('aria-pressed', String(isActive));
      ACTIVE_BTN_CLASSES.forEach(c => btn.classList.toggle(c, isActive));
      INACTIVE_BTN_CLASSES.forEach(c => btn.classList.toggle(c, !isActive));
    }
  });

  // Smooth Cross-Fade Switch between layout roots
  roots.forEach(root => {
    if (root) {
      root.classList.add('hidden');
      root.classList.remove('fade-in-item');
    }
  });

  let activeRoot = null;
  if (themeName === 'modern') activeRoot = modernRoot;
  else if (themeName === 'cyber') activeRoot = cyberRoot;
  else activeRoot = bentoRoot;

  if (activeRoot) {
    activeRoot.classList.remove('hidden');
    // Trigger reflow to restart CSS animation seamlessly
    void activeRoot.offsetWidth;
    activeRoot.classList.add('fade-in-item');
  }
}

function toggleDarkLight() {
  const htmlEl = document.documentElement;
  htmlEl.classList.toggle('dark');
  const isDark = htmlEl.classList.contains('dark');
  try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) { }
}

function initThemeAndLayout() {
  // Dark/light mode and data-theme are already applied by the inline script in <head>
  const savedTheme = document.documentElement.getAttribute('data-theme') || 'bento';
  switchTheme(savedTheme);
}

function initHeaderScrollShadow() {
  const header = document.getElementById('control-bar');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('shadow-2xl', 'border-indigo-500/30');
    } else {
      header.classList.remove('shadow-2xl', 'border-indigo-500/30');
    }
  }, { passive: true });
}

function initFormSubmissions() {
  ['bento', 'modern', 'cyber'].forEach(theme => {
    const form = document.getElementById(`contact-form-${theme}`);
    const status = document.getElementById(`form-status-${theme}`);
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    const showStatus = (text, ok) => {
      if (!status) return;
      status.classList.remove('hidden');
      // Cyber cards stay dark in light mode, so they always use the light-on-dark tones
      const tone = theme === 'cyber'
        ? (ok ? 'text-emerald-400' : 'text-rose-400')
        : (ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400');
      status.innerHTML = `<span class="${tone} font-bold flex items-center gap-1">${text}</span>`;
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submitBtn) submitBtn.disabled = true;
      showStatus('Sending message...', true);

      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString()
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        form.reset();
        showStatus('✓ Thank you! Your message has been sent.', true);
      } catch (err) {
        showStatus('✗ Could not send. Please email jjebakumar@outlook.com instead.', false);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
}

function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const email = 'jjebakumar@outlook.com';
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email).then(showCopiedStatus).catch(() => fallbackCopy(email));
    } else {
      fallbackCopy(email);
    }
  });

  function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showCopiedStatus();
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  }

  function showCopiedStatus() {
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      <span class="text-emerald-500 font-bold">Copied!</span>
    `;
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 2500);
  }
}


// GitHub star counts on project cards (cached for an hour; badges stay hidden on failure)
const STARS_CACHE_KEY = 'gh-stars-v1';
const STARS_CACHE_MS = 60 * 60 * 1000;

async function initRepoStars() {
  const badges = document.querySelectorAll('.repo-stars[data-repo]');
  if (!badges.length) return;

  let stars = null;
  try {
    const cached = JSON.parse(sessionStorage.getItem(STARS_CACHE_KEY));
    if (cached && Date.now() - cached.t < STARS_CACHE_MS) stars = cached.stars;
  } catch (e) { }

  if (!stars) {
    try {
      const response = await fetch('https://api.github.com/users/jebakumarj/repos?per_page=100');
      if (!response.ok) return;
      const repos = await response.json();
      stars = Object.fromEntries(repos.map(r => [r.name, r.stargazers_count]));
      try { sessionStorage.setItem(STARS_CACHE_KEY, JSON.stringify({ t: Date.now(), stars })); } catch (e) { }
    } catch (e) {
      return;
    }
  }

  badges.forEach(badge => {
    const count = stars[badge.dataset.repo];
    if (typeof count !== 'number') return;
    badge.querySelector('.repo-stars-count').textContent = count.toLocaleString();
    badge.classList.remove('hidden');
    badge.classList.add('inline-flex');
  });
}
