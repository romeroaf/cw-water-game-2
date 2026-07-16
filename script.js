// Game configuration and state variables
const DIFFICULTIES = {
  easy: { label: 'Easy', goal: 10, timeLimit: 45, spawnInterval: 1400 },
  normal: { label: 'Normal', goal: 15, timeLimit: 30, spawnInterval: 1000 },
  hard: { label: 'Hard', goal: 20, timeLimit: 20, spawnInterval: 700 }
};

let currentCans = 0;
let gameActive = false;
let spawnInterval;
let timerInterval;
let timeLeft = 0;
let goalCans = 0;
let currentDifficulty = 'normal';

const grid = document.querySelector('.game-grid');
const startButton = document.getElementById('start-game');
const difficultySelect = document.getElementById('difficulty');
const currentCansDisplay = document.getElementById('current-cans');
const timerDisplay = document.getElementById('timer');
const instructions = document.querySelector('.game-instructions');
const achievementBox = document.getElementById('achievements');

function createGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

function getCurrentDifficulty() {
  return DIFFICULTIES[currentDifficulty] || DIFFICULTIES.normal;
}

function updateInstructions() {
  const selectedDifficulty = getCurrentDifficulty();
  instructions.textContent = `Collect ${selectedDifficulty.goal} cans on ${selectedDifficulty.label} mode before the timer runs out!`;
}

function updateStats() {
  currentCansDisplay.textContent = currentCans;
  timerDisplay.textContent = timeLeft;
}

function setStatus(message, isSuccess = false) {
  achievementBox.textContent = message;
  achievementBox.className = `achievement ${isSuccess ? 'success' : ''}`.trim();
}

function clearGrid() {
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach((cell) => {
    cell.innerHTML = '';
    cell.classList.remove('has-water-can');
  });
}

function spawnWaterCan() {
  if (!gameActive) return;

  clearGrid();

  const cells = document.querySelectorAll('.grid-cell');
  const randomCell = cells[Math.floor(Math.random() * cells.length)];
  const wrapper = document.createElement('div');
  wrapper.className = 'water-can-wrapper';

  const waterCan = document.createElement('div');
  waterCan.className = 'water-can';
  waterCan.setAttribute('role', 'button');
  waterCan.setAttribute('tabindex', '0');
  waterCan.setAttribute('aria-label', 'Collect water can');

  wrapper.appendChild(waterCan);
  randomCell.appendChild(wrapper);
  randomCell.classList.add('has-water-can');
}

function endGame(message) {
  if (!gameActive) return;

  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearGrid();
  setStatus(message, currentCans >= goalCans);
  startButton.textContent = 'Start Game';
}

function startGame() {
  if (gameActive) {
    endGame('Game restarted.');
  }

  currentDifficulty = difficultySelect.value;
  const selectedDifficulty = getCurrentDifficulty();
  currentCans = 0;
  goalCans = selectedDifficulty.goal;
  timeLeft = selectedDifficulty.timeLimit;
  gameActive = true;
  startButton.textContent = 'Restart Game';

  createGrid();
  updateInstructions();
  updateStats();
  setStatus(`Starting ${selectedDifficulty.label} mode!`);

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  spawnInterval = setInterval(spawnWaterCan, selectedDifficulty.spawnInterval);
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateStats();

    if (timeLeft <= 0) {
      endGame(`Time is up! You collected ${currentCans} cans.`);
    }
  }, 1000);

  spawnWaterCan();
}

grid.addEventListener('click', (event) => {
  const can = event.target.closest('.water-can');
  if (!can || !gameActive) return;

  const cell = can.closest('.grid-cell');
  if (!cell) return;

  cell.innerHTML = '';
  currentCans += 1;
  updateStats();

  if (currentCans >= goalCans) {
    endGame(`You win! You collected ${currentCans} cans.`);
    return;
  }

  setStatus(`Collected ${currentCans} so far! ${goalCans - currentCans} to go.`);

  setTimeout(() => {
    if (gameActive) {
      spawnWaterCan();
    }
  }, 250);
});

difficultySelect.addEventListener('change', () => {
  currentDifficulty = difficultySelect.value;
  updateInstructions();

  if (!gameActive) {
    const selectedDifficulty = getCurrentDifficulty();
    timeLeft = selectedDifficulty.timeLimit;
    updateStats();
    setStatus(`Ready for ${selectedDifficulty.label} mode.`);
  }
});

startButton.addEventListener('click', startGame);

createGrid();
updateInstructions();
updateStats();
setStatus('Choose a difficulty and start the game.');
