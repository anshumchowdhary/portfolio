const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const cursorAura = document.querySelector('.cursor-aura');
const progress = document.querySelector('.scroll-progress span');
const soundToggle = document.querySelector('#sound-toggle');
const soundMute = document.querySelector('#sound-mute');
const soundVolume = document.querySelector('#sound-volume');
const themeAudio = document.querySelector('#theme-audio');
const soundPlayer = document.querySelector('.sound-player');
const soundStatus = document.querySelector('.sound-copy small');
const soundAction = document.querySelector('.sound-action');
const spellTrigger = document.querySelector('.spell-trigger');
const spellbook = document.querySelector('.spellbook');
const spellClose = document.querySelector('.spell-close');
const spellBackdrop = document.querySelector('.spell-backdrop');
const toast = document.querySelector('#toast');
const awakeningFx = document.querySelector('#awakening-fx');

document.querySelector('#year').textContent = new Date().getFullYear();

const setHeaderState = () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${maxScroll ? (window.scrollY / maxScroll) * 100 : 0}%`;
};
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

navLinks.forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', ({ clientX, clientY }) => {
    cursorAura.style.left = `${clientX}px`;
    cursorAura.style.top = `${clientY}px`;
  });

  document.querySelector('.hero-visual').addEventListener('pointermove', (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  });

  document.querySelectorAll('.skill-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty('--card-x', `${x * 100}%`);
      card.style.setProperty('--card-y', `${y * 100}%`);
      card.style.setProperty('--tilt-x', `${(x - .5) * 7}deg`);
      card.style.setProperty('--tilt-y', `${(y - .5) * -7}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

async function toggleSound() {
  if (themeAudio.paused) {
    try {
      await themeAudio.play();
      notify('Black Catcher is playing');
    } catch {
      soundStatus.textContent = 'Unable to play this track';
      notify('The theme track could not be played');
    }
  } else {
    themeAudio.pause();
  }
}

soundToggle.addEventListener('click', toggleSound);
soundMute.addEventListener('click', () => {
  themeAudio.muted = !themeAudio.muted;
  soundMute.setAttribute('aria-pressed', String(themeAudio.muted));
  soundMute.setAttribute('aria-label', themeAudio.muted ? 'Unmute theme music' : 'Mute theme music');
  soundStatus.textContent = themeAudio.muted ? 'Theme / muted' : (themeAudio.paused ? 'Theme / Paused' : 'Theme / Playing');
});
soundVolume.addEventListener('input', () => {
  themeAudio.volume = Number(soundVolume.value) / 100;
});
themeAudio.volume = Number(soundVolume.value) / 100;
themeAudio.addEventListener('play', () => {
  soundPlayer.classList.add('playing');
  soundToggle.setAttribute('aria-pressed', 'true');
  soundStatus.textContent = themeAudio.muted ? 'Theme / muted' : 'Theme / playing';
  soundAction.textContent = 'PAUSE';
});
themeAudio.addEventListener('pause', () => {
  soundPlayer.classList.remove('playing');
  soundToggle.setAttribute('aria-pressed', 'false');
  soundStatus.textContent = 'Theme / paused';
  soundAction.textContent = 'PLAY';
});

function setSpellbook(open) {
  spellbook.classList.toggle('open', open);
  spellBackdrop.classList.toggle('visible', open);
  spellbook.setAttribute('aria-hidden', String(!open));
  spellTrigger.setAttribute('aria-expanded', String(open));
}

spellTrigger.addEventListener('click', () => setSpellbook(!spellbook.classList.contains('open')));
spellClose.addEventListener('click', () => setSpellbook(false));
spellBackdrop.addEventListener('click', () => setSpellbook(false));

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

let awakeningTimer;
function triggerAwakeningFx() {
  document.body.classList.remove('awakening');
  awakeningFx.classList.remove('active');
  awakeningFx.querySelectorAll('.magic-particle').forEach((particle) => particle.remove());
  void awakeningFx.offsetWidth;

  const colors = ['#e7f6ff', '#9fd7ff', '#b6e954'];
  for (let index = 0; index < 34; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 110 + Math.random() * Math.max(window.innerWidth, window.innerHeight) * .58;
    const particle = document.createElement('span');
    particle.className = 'magic-particle';
    particle.style.setProperty('--size', `${2 + Math.random() * 6}px`);
    particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    particle.style.setProperty('--particle-color', colors[index % colors.length]);
    particle.style.animationDelay = `${Math.random() * .13}s`;
    awakeningFx.append(particle);
  }

  document.body.classList.add('awakening');
  awakeningFx.classList.add('active');
  window.clearTimeout(awakeningTimer);
  awakeningTimer = window.setTimeout(() => {
    document.body.classList.remove('awakening');
    awakeningFx.classList.remove('active');
    awakeningFx.querySelectorAll('.magic-particle').forEach((particle) => particle.remove());
  }, 1350);
}

function playAwakeningSfx() {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  const context = new Context();
  const master = context.createGain();
  master.gain.setValueAtTime(.0001, context.currentTime);
  master.gain.exponentialRampToValueAtTime(.19, context.currentTime + .05);
  master.gain.exponentialRampToValueAtTime(.0001, context.currentTime + 1.12);
  master.connect(context.destination);

  const makeChime = (startFrequency, endFrequency, delay, duration, volume) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFrequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration * .72);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + .03);
  };

  makeChime(175, 932, 0, .64, .55);
  makeChime(261, 1318, .11, .76, .38);
  makeChime(392, 1567, .23, .86, .24);
  window.setTimeout(() => context.close().catch(() => {}), 1450);
}

function awaken() {
  const active = document.body.classList.toggle('awakened');
  if (active) {
    triggerAwakeningFx();
    playAwakeningSfx();
  }
  notify(active ? 'The grimoire has awakened' : 'The grimoire rests again');
}

document.querySelectorAll('[data-command]').forEach((command) => {
  command.addEventListener('click', () => {
    if (command.dataset.command === 'awaken') awaken();
    if (command.dataset.command === 'sound') toggleSound();
    setSpellbook(false);
  });
});

const secret = 'GRIMOIRE';
let typedSecret = '';
window.addEventListener('keydown', (event) => {
  if (event.target.matches('input, textarea')) return;
  typedSecret = `${typedSecret}${event.key.toUpperCase()}`.slice(-secret.length);
  if (typedSecret === secret) {
    awaken();
    typedSecret = '';
  }
  if (event.key === 'Escape') setSpellbook(false);
});

(function () {
  const track = document.querySelector('.project-track');
  if (!track) return;
  const cards = Array.from(track.children);
  const dots = document.querySelectorAll('.project-dot');
  let index = 0;

  function goTo(i) {
    index = Math.max(0, Math.min(cards.length - 1, i));
    cards[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
  }

  document.querySelector('.project-nav-btn[data-dir="-1"]')?.addEventListener('click', () => goTo(index - 1));
  document.querySelector('.project-nav-btn[data-dir="1"]')?.addEventListener('click', () => goTo(index + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const trackLeft = track.getBoundingClientRect().left;
      let closest = 0, closestDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.getBoundingClientRect().left - trackLeft);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      index = closest;
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
    }, 100);
  });
})();
