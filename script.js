const root = document.documentElement;
const themeButton = document.querySelector('.theme-button');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
const introGate = document.querySelector('.intro-gate');
const characterButton = document.querySelector('.character-button');
const introSkip = document.querySelector('.intro-skip');
const miniGuide = document.querySelector('.mini-guide');
const miniCharacter = document.querySelector('.mini-character');

document.body.style.overflow = 'hidden';

function enterSite() {
  if (introGate.classList.contains('opening')) return;
  introGate.classList.add('opening');
  window.setTimeout(() => {
    introGate.classList.add('entered');
    document.body.classList.add('exploring');
    document.body.style.overflow = '';
  }, 760);
}

characterButton.addEventListener('click', enterSite);
introSkip.addEventListener('click', enterSite);

// Preview mode is used only for local visual QA and leaves the public entrance unchanged.
if (new URLSearchParams(window.location.search).has('preview')) {
  introGate.classList.add('entered');
  document.body.classList.add('exploring');
  document.body.style.overflow = '';
}

miniCharacter.addEventListener('click', () => {
  const isOpen = miniGuide.classList.toggle('active');
  miniCharacter.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.mini-menu a').forEach((link) => {
  link.addEventListener('click', () => {
    miniGuide.classList.remove('active');
    miniCharacter.setAttribute('aria-expanded', 'false');
  });
});

const savedTheme = localStorage.getItem('personal-site-theme');
if (savedTheme) root.dataset.theme = savedTheme;

themeButton.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('personal-site-theme', nextTheme);
});

menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('p');
const lightboxClose = lightbox.querySelector('.lightbox-close');

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('.photo-card').forEach((card) => {
  card.addEventListener('click', () => {
    const sourceImage = card.querySelector('img');
    lightboxImage.src = sourceImage.src;
    lightboxImage.alt = sourceImage.alt;
    lightboxCaption.textContent = card.dataset.caption;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});

// The memory archive behaves like a strip of film instead of a static wall.
const photoWall = document.querySelector('.photo-wall');
const galleryPrevious = document.querySelector('.gallery-prev');
const galleryNext = document.querySelector('.gallery-next');
function moveFilm(direction) {
  if (!photoWall) return;
  photoWall.scrollBy({ left: direction * Math.min(photoWall.clientWidth * 0.78, 780), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}
galleryPrevious?.addEventListener('click', () => moveFilm(-1));
galleryNext?.addEventListener('click', () => moveFilm(1));

// Interactive night-sky entrance.
const cosmosCanvas = document.querySelector('#cosmos-canvas');
const cosmosContext = cosmosCanvas.getContext('2d');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let stars = [];
let pointerX = 0;
let pointerY = 0;

function sizeCosmos() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  cosmosCanvas.width = window.innerWidth * ratio;
  cosmosCanvas.height = window.innerHeight * ratio;
  cosmosContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  const starCount = window.innerWidth < 600 ? 55 : 105;
  stars = Array.from({ length: starCount }, (_, index) => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: index % 13 === 0 ? 1.8 : Math.random() * 1.15 + 0.25,
    alpha: Math.random() * 0.65 + 0.22,
    speed: Math.random() * 0.006 + 0.002,
    phase: Math.random() * Math.PI * 2
  }));
}

function drawCosmos(time = 0) {
  cosmosContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  stars.forEach((star, index) => {
    const twinkle = prefersReducedMotion ? star.alpha : star.alpha * (0.72 + Math.sin(time * star.speed + star.phase) * 0.28);
    const depth = (index % 4 + 1) * 0.8;
    const x = star.x + pointerX * depth;
    const y = star.y + pointerY * depth;
    cosmosContext.beginPath();
    cosmosContext.arc(x, y, star.radius, 0, Math.PI * 2);
    cosmosContext.fillStyle = `rgba(255, 245, 255, ${Math.max(0.08, twinkle)})`;
    cosmosContext.fill();
  });
  if (!introGate.classList.contains('entered') && !prefersReducedMotion) requestAnimationFrame(drawCosmos);
}

introGate.addEventListener('pointermove', (event) => {
  pointerX = (event.clientX / window.innerWidth - 0.5) * 5;
  pointerY = (event.clientY / window.innerHeight - 0.5) * 5;
});
window.addEventListener('resize', sizeCosmos);
sizeCosmos();
drawCosmos();

// The future-research orbit tilts gently toward the pointer.
const researchSystem = document.querySelector('.research-system');
if (researchSystem && !prefersReducedMotion) {
  researchSystem.addEventListener('pointermove', (event) => {
    const bounds = researchSystem.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    researchSystem.style.setProperty('--rx', `${x * 7}deg`);
    researchSystem.style.setProperty('--ry', `${y * -7}deg`);
  });
  researchSystem.addEventListener('pointerleave', () => {
    researchSystem.style.setProperty('--rx', '0deg');
    researchSystem.style.setProperty('--ry', '0deg');
  });
}

// Warp-style chapter navigation is reserved for the single mission path.
const warpFlash = document.querySelector('.warp-flash');
document.querySelectorAll('.first-signal, .signal-dock>a').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    warpFlash.classList.remove('active');
    void warpFlash.offsetWidth;
    warpFlash.classList.add('active');
    window.setTimeout(() => target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }), 220);
  });
});

// Five deliberate interactions reveal the qualities behind the résumé.
const signalKeys = ['origin', 'builder', 'leader', 'voice', 'future'];
const signalLabels = {
  origin: ['初心信号已接收', '从真实问题开始，而不是从奖项开始。'],
  builder: ['创造信号已接收', '把想法做成可以被体验、被验证的方案。'],
  leader: ['担当信号已接收', '带领团队，也为最终结果负责。'],
  voice: ['表达信号已接收', '让技术、善意与故事被更多人听见。'],
  future: ['未来信号已接收', '保持好奇，继续走向真正的科研现场。']
};
let savedSignals = [];
try { savedSignals = JSON.parse(sessionStorage.getItem('hxy0124-signals') || '[]'); } catch { savedSignals = []; }
const collectedSignals = new Set(savedSignals.filter((key) => signalKeys.includes(key)));
const signalCount = document.querySelector('#signal-count');
const finalSignalCount = document.querySelector('#final-signal-count');
const finalSignalMessage = document.querySelector('#final-signal-message');
const unlockToast = document.querySelector('.unlock-toast');
let unlockTimer;

function showUnlock(key) {
  const title = unlockToast.querySelector('b');
  const message = unlockToast.querySelector('p');
  const copy = signalLabels[key] || ['接收到一束新信号', '继续探索，点亮 HXY-0124 星座。'];
  title.textContent = copy[0];
  message.textContent = copy[1];
  unlockToast.classList.add('show');
  window.clearTimeout(unlockTimer);
  unlockTimer = window.setTimeout(() => unlockToast.classList.remove('show'), 3000);
}

function renderSignals() {
  const count = collectedSignals.size;
  if (signalCount) signalCount.textContent = `${count}/5`;
  if (finalSignalCount) finalSignalCount.textContent = `${count} / 5`;
  document.querySelectorAll('[data-signal-node]').forEach((node) => node.classList.toggle('active', collectedSignals.has(node.dataset.signalNode)));
  document.querySelectorAll('[data-final-signal]').forEach((node) => node.classList.toggle('active', collectedSignals.has(node.dataset.finalSignal)));
  document.querySelectorAll('[data-signal]').forEach((source) => source.classList.toggle('signal-collected', collectedSignals.has(source.dataset.signal)));
  const complete = count === signalKeys.length;
  document.body.classList.toggle('signals-complete', complete);
  document.querySelector('.hx-final')?.classList.toggle('complete', complete);
  if (finalSignalMessage) finalSignalMessage.textContent = complete ? '星座已点亮：好奇、创造、担当、表达与科研愿望，共同组成今天的华心怡。' : `还差 ${signalKeys.length - count} 束信号，继续探索。`;
}

function collectSignal(key) {
  if (!signalKeys.includes(key) || collectedSignals.has(key)) return;
  collectedSignals.add(key);
  sessionStorage.setItem('hxy0124-signals', JSON.stringify([...collectedSignals]));
  renderSignals();
  showUnlock(key);
}

document.querySelectorAll('[data-signal]').forEach((source) => source.addEventListener('click', () => collectSignal(source.dataset.signal)));
renderSignals();

// Clickable award constellation.
const awardStars = document.querySelectorAll('.award-star');
const starCategory = document.querySelector('#star-category');
const starTitle = document.querySelector('#star-title');
const starResult = document.querySelector('#star-result');
awardStars.forEach((star) => {
  star.addEventListener('click', () => {
    awardStars.forEach((item) => item.classList.remove('active'));
    star.classList.add('active');
    starCategory.textContent = star.dataset.category;
    starTitle.textContent = star.dataset.title;
    starResult.textContent = star.dataset.result;
    openAwardEvidence(star);
  });
});

// Animate key numbers once they enter the viewport.
const statsPanel = document.querySelector('.quick-stats');
let statsAnimated = false;
const statsObserver = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting || statsAnimated) return;
  statsAnimated = true;
  document.querySelectorAll('[data-count]').forEach((number) => {
    const target = Number(number.dataset.count);
    const decimals = Number(number.dataset.decimals || 0);
    const originalSmall = number.querySelector('small')?.outerHTML || '';
    const fallbackSuffix = originalSmall ? '' : (number.dataset.suffix || '');
    const start = performance.now();
    const duration = prefersReducedMotion ? 1 : 1300;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      number.innerHTML = `${(target * eased).toFixed(decimals)}${fallbackSuffix}${originalSmall}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
  statsObserver.disconnect();
}, { threshold: 0.45 });
statsObserver.observe(statsPanel);

// Project chapters behave like a route through time rather than static cards.
const projectTabs = [...document.querySelectorAll('.project-tab')];
const projectPanels = [...document.querySelectorAll('.project-panel')];
const routeProgress = document.querySelector('.route-progress');

function activateProject(projectId, shouldFocus = false) {
  const index = projectTabs.findIndex((tab) => tab.dataset.project === projectId);
  if (index < 0) return;
  projectTabs.forEach((tab, tabIndex) => {
    const active = tabIndex === index;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    if (active && shouldFocus) tab.focus();
  });
  projectPanels.forEach((panel) => {
    const active = panel.dataset.panel === projectId;
    panel.classList.toggle('active', active);
    panel.hidden = !active;
  });
  routeProgress.style.width = `${index / (projectTabs.length - 1) * 84}%`;
}

projectTabs.forEach((tab) => tab.addEventListener('click', () => activateProject(tab.dataset.project)));
document.querySelectorAll('[data-next-project]').forEach((button) => {
  button.addEventListener('click', () => {
    activateProject(button.dataset.nextProject, true);
    document.querySelector('.project-route').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
  });
});

// The final chapter is a two-universe portal: visitors choose an era, then probe its stars.
const eraTabs = [...document.querySelectorAll('.era-tab')];
const eraPanels = [...document.querySelectorAll('.era-panel')];

function activateEra(eraId) {
  eraTabs.forEach((tab) => {
    const active = tab.dataset.era === eraId;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  eraPanels.forEach((panel) => {
    const active = panel.dataset.eraPanel === eraId;
    panel.classList.toggle('active', active);
    panel.hidden = !active;
  });
  document.querySelector('.era-panels')?.classList.remove('portal-pulse');
  requestAnimationFrame(() => document.querySelector('.era-panels')?.classList.add('portal-pulse'));
}

eraTabs.forEach((tab) => tab.addEventListener('click', () => activateEra(tab.dataset.era)));

document.querySelectorAll('.era-panel').forEach((panel) => {
  const view = panel.querySelector('.era-memory-view');
  const viewImage = view?.querySelector('img');
  const viewTitle = view?.querySelector('h3');
  const viewResult = view?.querySelector('strong');
  const viewStory = view?.querySelector('p');
  panel.querySelectorAll('.era-memory').forEach((memory) => {
    memory.addEventListener('click', () => {
      panel.querySelectorAll('.era-memory').forEach((item) => item.classList.toggle('active', item === memory));
      if (viewImage) {
        viewImage.src = memory.dataset.image || '';
        viewImage.alt = `${memory.dataset.title || '成长经历'}对应照片`;
      }
      if (viewTitle) viewTitle.textContent = memory.dataset.title || '';
      if (viewResult) viewResult.textContent = memory.dataset.result || '';
      if (viewStory) viewStory.textContent = memory.dataset.story || '';
      view?.classList.remove('memory-change');
      requestAnimationFrame(() => view?.classList.add('memory-change'));
    });
  });
});

// Every award opens a photo-backed evidence card; missing photos are explicit.
const awardModal = document.querySelector('.award-modal');
const awardModalImage = awardModal.querySelector('.award-modal-visual img');
const awardModalProject = document.querySelector('#award-modal-project');
const awardModalTitle = document.querySelector('#award-modal-title');
const awardModalResult = document.querySelector('#award-modal-result');
const awardModalStory = document.querySelector('#award-modal-story');
const awardModalLink = document.querySelector('#award-modal-link');
const awardModalClose = awardModal.querySelector('.award-modal-close');

function openAwardEvidence(source) {
  const imagePath = source.dataset.image;
  awardModalProject.textContent = source.dataset.projectName || source.dataset.category || 'PROJECT';
  awardModalTitle.textContent = source.dataset.title || '';
  awardModalResult.textContent = source.dataset.result || '';
  awardModalStory.textContent = source.dataset.story || '';
  if (source.dataset.link) {
    awardModalLink.href = source.dataset.link;
    awardModalLink.hidden = false;
  } else {
    awardModalLink.href = '#';
    awardModalLink.hidden = true;
  }
  if (imagePath) {
    awardModalImage.src = imagePath;
    awardModalImage.alt = `${source.dataset.title || '奖项'}对应照片`;
    awardModal.classList.add('has-image');
  } else {
    awardModalImage.removeAttribute('src');
    awardModalImage.alt = '';
    awardModal.classList.remove('has-image');
  }
  awardModal.classList.add('open');
  awardModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  awardModalClose.focus();
}

function closeAwardEvidence() {
  awardModal.classList.remove('open');
  awardModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('.award-evidence').forEach((item) => item.addEventListener('click', () => openAwardEvidence(item)));
awardModalClose.addEventListener('click', closeAwardEvidence);
awardModal.addEventListener('click', (event) => {
  if (event.target === awardModal) closeAwardEvidence();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && awardModal.classList.contains('open')) closeAwardEvidence();
});

// Musical-theatre praise behaves like a field of warm audience signals.
const stageCosmos = document.querySelector('.stage-cosmos');
const praiseTags = [...document.querySelectorAll('.praise-tag')];
const praiseLiveText = document.querySelector('#praise-live-text');
const praiseLiveLabel = document.querySelector('.praise-receiver small');
const praiseShuffle = document.querySelector('#praise-shuffle');
let activePraise = 0;

function receivePraise(index) {
  if (!praiseTags.length || !praiseLiveText) return;
  activePraise = (index + praiseTags.length) % praiseTags.length;
  const selected = praiseTags[activePraise];
  praiseTags.forEach((tag, tagIndex) => tag.classList.toggle('active', tagIndex === activePraise));
  praiseLiveText.textContent = `“${selected.dataset.praise || selected.textContent.trim()}”`;
  if (praiseLiveLabel) praiseLiveLabel.textContent = `LIVE AUDIENCE MESSAGE · ${String(activePraise + 1).padStart(2, '0')}`;
  praiseLiveText.classList.remove('praise-change');
  requestAnimationFrame(() => praiseLiveText.classList.add('praise-change'));
  collectSignal('voice');
}

praiseTags.forEach((tag, index) => tag.addEventListener('click', () => receivePraise(index)));
praiseShuffle?.addEventListener('click', () => receivePraise(activePraise + 1));

if (stageCosmos && !prefersReducedMotion) {
  stageCosmos.addEventListener('pointermove', (event) => {
    const bounds = stageCosmos.getBoundingClientRect();
    stageCosmos.style.setProperty('--spot-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    stageCosmos.style.setProperty('--spot-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  });
}

const voicesExpand = document.querySelector('.voices-expand');
const voicesCard = document.querySelector('.voices-card');
voicesExpand?.addEventListener('click', () => {
  const expanded = voicesCard?.classList.toggle('expanded') || false;
  voicesExpand.setAttribute('aria-expanded', String(expanded));
  voicesExpand.firstChild.textContent = expanded ? '收起赞赏收藏 ' : '查看完整赞赏收藏 ';
});
