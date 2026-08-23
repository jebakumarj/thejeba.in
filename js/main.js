// Minimalist Portfolio JS
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initCopyEmail();
});

function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlEl = document.documentElement;

  // Saved preference or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';

  if (savedTheme === 'light') {
    htmlEl.classList.remove('dark');
  } else {
    htmlEl.classList.add('dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      if (htmlEl.classList.contains('dark')) {
        htmlEl.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        htmlEl.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }
}

function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const email = 'hello@thejeba.in';
    
    // Clipboard API with fallback
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
