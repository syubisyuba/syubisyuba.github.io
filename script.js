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
  statusElement.textContent = 'Running';
  startButton.disabled = true;
  pauseButton.disabled = false;
  pauseButton.textContent = 'Pause';
  startTimer();
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    clearInterval(timerId);
    timerId = null;
    statusElement.textContent = 'Paused';
    pauseButton.textContent = 'Resume';
  } else {
    statusElement.textContent = 'Running';
    pauseButton.textContent = 'Pause';
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
  statusElement.textContent = 'Game over';
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

resetState();
