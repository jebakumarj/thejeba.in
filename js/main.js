// Portfolio Interactions & Smooth Theme Controller
document.addEventListener('DOMContentLoaded', () => {
  initThemeAndLayout();
  initCopyEmail();
  initHeaderScrollShadow();
  initFormSubmissions();
});

function switchTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('portfolio-layout-theme', themeName);

  const bentoRoot = document.getElementById('theme-bento-root');
  const modernRoot = document.getElementById('theme-modern-root');
  const cyberRoot = document.getElementById('theme-cyber-root');
  const roots = [bentoRoot, modernRoot, cyberRoot];

  // Active theme selector styling update
  ['bento', 'modern', 'cyber'].forEach(t => {
    const btn = document.getElementById(`btn-theme-${t}`);
    if (btn) {
      if (t === themeName) {
        btn.className = 'px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer bg-indigo-600 text-white shadow-md active:scale-95 text-[11px] sm:text-xs';
      } else {
        btn.className = 'px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95 text-[11px] sm:text-xs';
      }
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
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function initThemeAndLayout() {
  const savedDark = localStorage.getItem('theme');
  if (savedDark === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
  }

  const savedTheme = localStorage.getItem('portfolio-layout-theme') || 'bento';
  switchTheme(savedTheme);
}

function initHeaderScrollShadow() {
  const header = document.querySelector('header');
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

    form.addEventListener('submit', () => {
      if (status) {
        status.classList.remove('hidden');
        status.innerHTML = `<span class="text-emerald-500 font-bold flex items-center gap-1">✓ Thank you! Sending message...</span>`;
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

