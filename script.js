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

const translations = {
  en: {
    menu: 'Menu', navHome: 'Home', navAbout: 'About', navProjects: 'Projects', navExperience: 'Experience', navResearch: 'Research', navContact: 'Contact', navGames: 'Games', eyebrow: 'PRODUCT-MINDED DEVELOPER', availability: 'AVAILABLE TO CREATE', heroTitle: 'Ideas into<br /><em>working experiences.</em>', heroCopy: 'I turn ambiguous problems into clear interfaces, useful products, and dependable systems.', stackSummary: 'Explore the stack', scroll: 'SCROLL TO EXPLORE', aboutLabel: 'ABOUT', aboutTitle: 'Clear structure,<br />sharp details.', aboutCopy: 'Software engineer focused on turning complex problems into useful product experiences.', focusLabel: 'FOCUS', focusCopy: 'Making products faster to understand and easier to use.', projectsLabel: 'SELECTED WORK', experienceLabel: 'EXPERIENCE', experienceTitle: 'Build, learn,<br />iterate.', experienceCopy: '14+ Years of Software Engineering experience in mobile &amp; system platforms.', researchLabel: 'RESEARCH', researchTitle: 'Curiosity<br />with intent.', researchCopy: 'Exploring practical AI patterns, interaction design, and creative browser experiences.', playgroundLabel: 'PLAYGROUND', playgroundTitle: 'Playground', gameCopy: 'A mini-game built with the HTML5 Canvas API and JavaScript. Collect food, grow longer, and stay alive.', scoreLabel: 'Score', bestLabel: 'Best', ready: 'Ready', start: 'Start', pause: 'Pause', resume: 'Resume', restart: 'Restart', contactLabel: 'CONTACT', contactTitle: 'Have a good<br /><em>idea?</em>', footerNote: 'Software Engineer Portfolio', contributionLabel: 'Contribution', stackLabel: 'Stack', linksLabel: 'Links', projectOverview: 'Overview', projectContribution: 'Contribution', projectStack: 'Stack', projectLinks: 'Links', running: 'Running', paused: 'Paused', gameOver: 'Game over'
  },
  ko: {
    menu: '메뉴', navHome: '홈', navAbout: '소개', navProjects: '프로젝트', navExperience: '경력', navResearch: '리서치', navContact: '연락처', navGames: '게임', eyebrow: '제품 중심 개발자', availability: '함께 만들 준비가 됐습니다', heroTitle: '아이디어를<br /><em>작동하는 경험으로.</em>', heroCopy: '복잡한 문제를 명확한 인터페이스와 유용한 제품으로 구현합니다.', stackSummary: '기술 스택 보기', scroll: '스크롤해서 탐색하기', aboutLabel: '소개', aboutTitle: '명확한 구조,<br />섬세한 디테일.', aboutCopy: '복잡한 문제를 유용한 제품 경험으로 바꾸는 소프트웨어 엔지니어입니다.', focusLabel: '집중 영역', focusCopy: '제품을 더 빠르게 이해하고 쉽게 사용할 수 있도록 만듭니다.', projectsLabel: '주요 프로젝트', experienceLabel: '경력', experienceTitle: '만들고, 배우고,<br />반복합니다.', experienceCopy: '14년 차 소프트웨어 엔지니어 (모바일 및 시스템 플랫폼 개발)', researchLabel: '리서치', researchTitle: '호기심을<br />목적 있게.', researchCopy: '실용적인 AI 패턴, 인터랙션 디자인, 브라우저 경험을 탐구합니다.', playgroundLabel: '플레이그라운드', playgroundTitle: '미니게임', gameCopy: 'HTML5 Canvas API와 JavaScript로 구현한 미니게임입니다. 음식을 먹고 성장하며 오래 버텨보세요.', scoreLabel: '점수', bestLabel: '최고 점수', ready: '준비', start: '시작', pause: '일시정지', resume: '계속하기', restart: '다시 시작', contactLabel: '연락하기', contactTitle: '좋은<br /><em>아이디어가 있나요?</em>', footerNote: '소프트웨어 엔지니어 포트폴리오', contributionLabel: '기여', stackLabel: '기술 스택', linksLabel: '링크', projectOverview: '개요', projectContribution: '기여 내용', projectStack: '사용 기술', projectLinks: '링크', running: '진행 중', paused: '일시정지', gameOver: '게임 오버'
  }
};

let currentLanguage = localStorage.getItem('soobeen-language') || 'en';
function t(key) { return translations[currentLanguage][key] || translations.en[key] || key; }
function applyLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  localStorage.setItem('soobeen-language', language);
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.innerHTML = t(element.dataset.i18n); });
  document.querySelectorAll('[data-language]').forEach((button) => button.classList.toggle('active', button.dataset.language === language));
  if (statusElement && !running) statusElement.textContent = t('ready');
}
document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => applyLanguage(button.dataset.language)));

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const canvas = document.querySelector('#game-canvas');
const startButton = document.querySelector('#start-game');
const pauseButton = document.querySelector('#pause-game');
const restartButton = document.querySelector('#restart-game');
const scoreElement = document.querySelector('#score');
const highScoreElement = document.querySelector('#high-score');
const statusElement = document.querySelector('#game-status');
const context = canvas?.getContext('2d');
const gridSize = 20;
const columns = canvas ? canvas.width / gridSize : 24;
const rows = canvas ? canvas.height / gridSize : 16;
const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

let snake;
let food;
let direction;
let nextDirection;
let score = 0;
let highScore = readHighScore();
let timerId = null;
let running = false;
let paused = false;

function readHighScore() {
  try {
    return Number(localStorage.getItem('soobeen-worm-high-score')) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore() {
  try {
    localStorage.setItem('soobeen-worm-high-score', String(highScore));
  } catch {
    // The game remains playable when storage is unavailable.
  }
}

function resetState() {
  snake = [{ x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }];
  direction = directions.right;
  nextDirection = direction;
  score = 0;
  food = createFood();
  scoreElement.textContent = String(score);
  highScoreElement.textContent = String(highScore);
  draw();
}

function createFood() {
  let candidate;
  do {
    candidate = { x: Math.floor(Math.random() * columns), y: Math.floor(Math.random() * rows) };
  } while (snake?.some((segment) => segment.x === candidate.x && segment.y === candidate.y));
  return candidate;
}

function setDirection(name) {
  if (!directions[name] || !running || paused) return;
  const proposed = directions[name];
  const isReverse = proposed.x === -nextDirection.x && proposed.y === -nextDirection.y;
  if (!isReverse) nextDirection = proposed;
}

function startTimer() {
  if (timerId !== null) return;
  timerId = window.setInterval(tick, 135);
}

function startGame() {
  if (running && !paused) return;
  if (!running) resetState();
  running = true;
  paused = false;
  statusElement.textContent = t('running');
  startButton.disabled = true;
  pauseButton.disabled = false;
  pauseButton.textContent = t('pause');
  startTimer();
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    clearInterval(timerId);
    timerId = null;
    statusElement.textContent = t('paused');
    pauseButton.textContent = t('resume');
  } else {
    statusElement.textContent = t('running');
    pauseButton.textContent = t('pause');
    startTimer();
  }
}

function restartGame() {
  clearInterval(timerId);
  timerId = null;
  running = false;
  paused = false;
  resetState();
  startGame();
}

function tick() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const hitWall = head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows;
  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);
  if (hitWall || hitSelf) return endGame();

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    highScore = Math.max(highScore, score);
    scoreElement.textContent = String(score);
    highScoreElement.textContent = String(highScore);
    saveHighScore();
    food = createFood();
  } else {
    snake.pop();
  }
  draw();
}

function endGame() {
  clearInterval(timerId);
  timerId = null;
  running = false;
  paused = false;
  statusElement.textContent = t('gameOver');
  startButton.disabled = false;
  pauseButton.disabled = true;
  draw(true);
}

function draw(gameOver = false) {
  if (!context) return;
  context.fillStyle = '#0e1213';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(215, 255, 69, .06)';
  for (let x = 0; x <= canvas.width; x += gridSize) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke();
  }
  for (let y = 0; y <= canvas.height; y += gridSize) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke();
  }
  context.fillStyle = '#ff6b5f';
  context.fillRect(food.x * gridSize + 3, food.y * gridSize + 3, gridSize - 6, gridSize - 6);
  snake.forEach((segment, index) => {
    context.fillStyle = index === 0 ? '#f2f0e9' : '#d7ff45';
    context.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
  });
  if (gameOver) {
    context.fillStyle = 'rgba(8, 9, 11, .72)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#d7ff45';
    context.font = '700 22px system-ui';
    context.textAlign = 'center';
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
  }
}

startButton?.addEventListener('click', startGame);
pauseButton?.addEventListener('click', togglePause);
restartButton?.addEventListener('click', restartGame);

window.addEventListener('keydown', (event) => {
  const keyMap = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  if (event.code === 'Space') {
    event.preventDefault();
    togglePause();
    return;
  }
  const name = keyMap[event.key];
  if (name) { event.preventDefault(); setDirection(name); }
});

document.querySelectorAll('[data-direction]').forEach((button) => {
  button.addEventListener('click', () => setDirection(button.dataset.direction));
});

const projectModal = document.querySelector('#project-modal');
const projectData = {
  dashboard: {
    title: 'CP Insight Dashboard',
    overview: { en: 'A focused dashboard concept for turning operational signals into clear decisions.', ko: '운영 데이터를 명확한 의사결정으로 연결하는 대시보드 콘셉트입니다.' },
    contribution: { en: 'Information architecture, responsive UI, and interaction prototype.', ko: '정보 구조, 반응형 UI, 인터랙션 프로토타입을 설계했습니다.' },
    stack: 'React · TypeScript · Node.js',
    links: 'GitHub: github.com/syubisyuba/syubisyuba.github.io · Demo: syubisyuba.github.io'
  },
  flow: {
    title: 'Flow Assist',
    overview: { en: 'An AI-assisted workflow concept that summarizes context and surfaces the next action.', ko: '업무 맥락을 요약하고 다음 행동을 제안하는 AI 업무 도구 콘셉트입니다.' },
    contribution: { en: 'Prompt flow, UI states, and browser-first experience design.', ko: '프롬프트 흐름, UI 상태, 브라우저 중심 경험을 설계했습니다.' },
    stack: 'Python · RAG · OpenAI API',
    links: 'GitHub: github.com/syubisyuba/syubisyuba.github.io · Demo: syubisyuba.github.io'
  }
};
function openProject(projectId) {
  const project = projectData[projectId];
  if (!project || !projectModal) return;
  document.querySelector('#modal-title').textContent = project.title;
  document.querySelector('#modal-overview').textContent = project.overview[currentLanguage];
  document.querySelector('#modal-contribution').textContent = project.contribution[currentLanguage];
  document.querySelector('#modal-stack').textContent = project.stack;
  document.querySelector('#modal-links').textContent = project.links;
  if (typeof projectModal.showModal === 'function') projectModal.showModal();
}
document.querySelectorAll('[data-project]').forEach((button) => button.addEventListener('click', () => openProject(button.dataset.project)));
document.querySelector('.modal-close')?.addEventListener('click', () => projectModal?.close());
projectModal?.addEventListener('click', (event) => { if (event.target === projectModal) projectModal.close(); });

resetState();
applyLanguage(currentLanguage);
