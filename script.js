const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

siteNav?.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    siteNav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }
});

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
