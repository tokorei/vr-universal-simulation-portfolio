const $ = (selector) => document.querySelector(selector);
const menu = $('#mobile-menu');
const menuButton = $('#menu-toggle');
function closeMenu() {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  document.body.classList.remove('menu-open');
}
menuButton.addEventListener('click', () => {
  const opening = menu.hidden;
  menu.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('menu-open', opening);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); }
  if (event.key === 'Tab' && !menu.hidden) {
    const focusable = [menuButton, ...menu.querySelectorAll('a')];
    const index = focusable.indexOf(document.activeElement);
    if (event.shiftKey && index === 0) { event.preventDefault(); focusable.at(-1).focus(); }
    else if (!event.shiftKey && index === focusable.length - 1) { event.preventDefault(); menuButton.focus(); }
  }
});
window.matchMedia('(min-width:701px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

// Each product is a real in-page section. The index follows normal page scrolling.
const productSections = [...document.querySelectorAll('.product-article')];
const productLinks = [...document.querySelectorAll('.portfolio-nav a')];
const portfolioNav = document.querySelector('.portfolio-nav');
let currentProduct = '';
let scrollPending = false;
function updateProductIndex() {
  scrollPending = false;
  const readingLine = innerHeight * (innerWidth < 801 ? 0.46 : 0.38);
  let current = productSections[0];
  for (const section of productSections) {
    if (section.getBoundingClientRect().top <= readingLine) current = section;
    else break;
  }
  if (!current) return;
  currentProduct = current.id;
  productLinks.forEach(link => {
    const active = link.hash === '#' + currentProduct;
    link.classList.toggle('is-active', active);
    if (active) {
      link.setAttribute('aria-current', 'location');
      document.querySelector('#product-progress').textContent = link.dataset.number + ' / ' + String(productSections.length).padStart(2, '0');
      if (matchMedia('(max-width:800px)').matches) {
        const left = link.offsetLeft - portfolioNav.offsetLeft;
        if (left < portfolioNav.scrollLeft) portfolioNav.scrollLeft = left;
        else if (left + link.offsetWidth > portfolioNav.scrollLeft + portfolioNav.clientWidth) portfolioNav.scrollLeft = left + link.offsetWidth - portfolioNav.clientWidth;
      }
    } else link.removeAttribute('aria-current');
  });
}
function scheduleIndexUpdate() {
  if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateProductIndex); }
}
window.addEventListener('scroll', scheduleIndexUpdate, { passive: true });
window.addEventListener('resize', scheduleIndexUpdate);
window.addEventListener('hashchange', scheduleIndexUpdate);
window.addEventListener('load', scheduleIndexUpdate);
updateProductIndex();

let paused = matchMedia('(prefers-reduced-motion:reduce)').matches;
function showPauseState() {
  $('#motion-toggle').setAttribute('aria-pressed', String(paused));
  $('#motion-toggle').setAttribute('aria-label', paused ? 'Resume scene motion' : 'Pause scene motion');
  $('#motion-icon').textContent = paused ? '▷' : 'Ⅱ';
}
showPauseState();
$('#motion-toggle').addEventListener('click', () => { paused = !paused; showPauseState(); document.dispatchEvent(new CustomEvent('vru-motion', { detail: paused })); });
$('#scene-reset').addEventListener('click', () => document.dispatchEvent(new Event('vru-reset')));
const startScene = () => import('./scene.js').then(module => module.startScene(paused)).catch(() => {
  $('#motion-toggle').disabled = true;
  $('#scene-reset').disabled = true;
  $('#scene-wrap').setAttribute('aria-label', 'Static illustration of a connected demonstration campus.');
  $('#campus-view-toggle').disabled = true;
  $('.campus-hotspots').hidden = true;
});
if ('requestIdleCallback' in window) requestIdleCallback(startScene, { timeout: 1000 });
else setTimeout(startScene, 100);
