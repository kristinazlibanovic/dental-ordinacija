/* ============================================================
   script.js — Zahnordination Zahnaesthetika, Salzburg
   ============================================================ */

/* --- Navbar scroll efekt + scroll-to-top gumb --- */
const navbar     = document.getElementById('navbar');
const scrollTop  = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  scrollTop.classList.toggle('visible', window.scrollY > 400);
});

scrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* --- Mobilni izbornik --- */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* --- Označi današnji dan u radnom vremenu --- */
const todayIndex = new Date().getDay(); // 0=Ned, 1=Pon, ..., 6=Sub
document.querySelectorAll('.hours-row').forEach(row => {
  if (parseInt(row.dataset.day) === todayIndex) {
    row.classList.add('today');
  }
});

/* --- Galerija lightbox --- */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* --- Toast notifikacije --- */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 4500);
}

/* --- Kontakt forma s validacijom --- */
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');
const submitErr   = document.getElementById('submit-err');

function getFieldGroup(input) {
  if (input.id === 'gdpr') return input.closest('.form-group-gdpr');
  return input.closest('.form-group');
}

function validateInput(input) {
  const group   = getFieldGroup(input);
  if (!group) return true;
  const errSpan = group.querySelector('.field-err');
  let valid     = true;

  if (input.type === 'checkbox') {
    valid = input.checked;
  } else if (input.type === 'email') {
    if (!input.value.trim()) {
      if (errSpan) errSpan.textContent = 'Dieses Feld ist erforderlich.';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
      if (errSpan) errSpan.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      valid = false;
    }
  } else {
    valid = input.value.trim().length > 0;
  }

  group.classList.toggle('has-error', !valid);
  return valid;
}

function validateAll() {
  let allValid = true;
  contactForm.querySelectorAll('input[required], textarea[required]').forEach(input => {
    if (!validateInput(input)) allValid = false;
  });
  return allValid;
}

if (contactForm) {
  /* Validacija pri napuštanju polja (blur) */
  contactForm.querySelectorAll('input[required], textarea[required]').forEach(input => {
    input.addEventListener('blur', () => validateInput(input));
    const evt = input.type === 'checkbox' ? 'change' : 'input';
    input.addEventListener(evt, () => {
      if (getFieldGroup(input).classList.contains('has-error')) validateInput(input);
      if (submitErr.classList.contains('show') && validateAll()) submitErr.classList.remove('show');
    });
  });

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validateAll()) {
      submitErr.classList.add('show');
      const firstErr = contactForm.querySelector('.has-error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    submitErr.classList.remove('show');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet…';

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        body:    new FormData(contactForm),
        headers: { Accept: 'application/json' }
      });
      const data = await res.json();

      if (data.success) {
        showToast('Vielen Dank! Wir melden uns so bald wie möglich.');
        contactForm.reset();
        contactForm.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
      } else {
        showToast('Fehler beim Senden. Bitte kontaktieren Sie uns telefonisch.', 'error');
      }
    } catch {
      showToast('Fehler beim Senden. Bitte kontaktieren Sie uns telefonisch.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Anfrage senden';
    }
  });
}

/* --- Scroll reveal animacije --- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* --- Godina u footeru --- */
document.getElementById('year').textContent = new Date().getFullYear();

/* --- Cookie banner --- */
const cookieBanner  = document.getElementById('cookie-banner');
const cookieAccept  = document.getElementById('cookie-accept');
const cookieReject  = document.getElementById('cookie-reject');

/* localStorage može baciti grešku (blokirani kolačići/privatni način) — ne smije srušiti ostatak skripte */
function getConsent() {
  try { return localStorage.getItem('cookie-consent'); } catch (e) { return null; }
}

if (!getConsent()) {
  setTimeout(() => cookieBanner.classList.add('show'), 1800);
}

function dismissCookie(value) {
  try { localStorage.setItem('cookie-consent', value); } catch (e) { /* nije moguće spremiti — banner se samo zatvori */ }
  cookieBanner.classList.remove('show');
}

cookieAccept.addEventListener('click', () => dismissCookie('all'));
cookieReject.addEventListener('click', () => dismissCookie('essential'));

/* ============================================================
   PRELOADER
   ============================================================ */
const hidePreloader = () => {
  const preloader = document.getElementById('preloader');
  if (preloader && !preloader.classList.contains('hide')) {
    preloader.classList.add('hide');
  }
};
/* Preloader se prikazuje samo pri prvom otvaranju stranice u sesiji (skraćen);
   pri ponovnom učitavanju ga inline skripta u <head> preskače (klasa pl-skip). */
try { sessionStorage.setItem('pl-seen', '1'); } catch (e) {}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(hidePreloader, 1200));
} else {
  setTimeout(hidePreloader, 1200);
}
setTimeout(hidePreloader, 3000);


/* ============================================================
   ANIMIRANI BROJAČI
   ============================================================ */
function runCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const suffix   = el.dataset.suffix || '';
  const decimals = target % 1 !== 0 ? 1 : 0;
  const duration = 1800;
  const start    = performance.now();

  el.classList.add('counting');
  (function update(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = (eased * target).toFixed(decimals);
    el.textContent = Number(val).toLocaleString('hr') + suffix;
    if (p < 1) requestAnimationFrame(update);
    else el.classList.remove('counting');
  })(start);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = '1';
      runCounter(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

/* ============================================================
   AKTIVNI NAV LINK (označava sekciju u kojoj se nalazi)
   ============================================================ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const anchors  = document.querySelectorAll('.nav-links a');
  if (!anchors.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        anchors.forEach(a => a.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-38% 0px -58% 0px' });

  sections.forEach(s => obs.observe(s));
})();

/* ============================================================
   STAGGERED GRID ANIMACIJE
   ============================================================ */
const staggerObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      staggerObs.unobserve(e.target);
    }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.stagger').forEach(el => staggerObs.observe(el));

/* ============================================================
   LEGAL MODALS — Impressum, Datenschutz, Cookie
   ============================================================ */
function openLegalModal(id) {
  const modal = document.getElementById('modal-' + id);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modal.querySelector('.legal-modal-close')?.focus();
}

function closeLegalModal(modal) {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function switchLegalModal(newId) {
  document.querySelectorAll('.legal-modal.open').forEach(m => closeLegalModal(m));
  const next = document.getElementById(newId);
  if (next) {
    next.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

/* Trigger linkovi (footer + cookie banner) */
document.querySelectorAll('.legal-trigger').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    openLegalModal(link.dataset.legal);
  });
});

/* Zatvaranje — X gumb, footer gumb, klik na backdrop, ESC */
document.querySelectorAll('.legal-modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) closeLegalModal(modal);
  });
  modal.querySelector('.legal-modal-close')?.addEventListener('click', () => closeLegalModal(modal));
  modal.querySelector('.legal-modal-close-btn')?.addEventListener('click', () => closeLegalModal(modal));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.legal-modal.open').forEach(m => closeLegalModal(m));
  }
});

