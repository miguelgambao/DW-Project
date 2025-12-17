// Constants
const SECONDS_PER_MINUTE = 60;
const MIN_DURATION = 1;
const MAX_DURATION = 120;
const DEFAULT_DURATIONS = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15
};

// State variables
let timerInterval = null;
let timeRemaining = DEFAULT_DURATIONS.pomodoro * SECONDS_PER_MINUTE;
let isRunning = false;
let currentMode = 'pomodoro';
const durations = { ...DEFAULT_DURATIONS };

// DOM element references
let startBtn = null;
let timerDisplay = null;

// Helper functions
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function isValidDuration(value) {
  const duration = parseInt(value, 10);
  return !isNaN(duration) && duration >= MIN_DURATION && duration <= MAX_DURATION;
}

function updateButtonText(text) {
  if (startBtn) {
    startBtn.textContent = text;
  }
}

// Timer functions
function startTimer() {
  isRunning = true;
  timerInterval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateDisplay();
    } else {
      handleTimerComplete();
    }
  }, 1000);
}

function handleTimerComplete() {
  pauseTimer();
  updateButtonText('Start');
  alert('Timer complete!');
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
}

function resetTimer() {
  pauseTimer();
  timeRemaining = durations[currentMode] * SECONDS_PER_MINUTE;
  updateDisplay();
}

function switchMode(mode) {
  if (isRunning) {
    alert('Please stop the timer before switching modes.');
    return;
  }
  currentMode = mode;
  timeRemaining = durations[currentMode] * SECONDS_PER_MINUTE;
  updateDisplay();
}

function updateDisplay() {
  if (timerDisplay) {
    timerDisplay.textContent = formatTime(timeRemaining);
  }
}

// Event handlers
function handleStartClick() {
  if (isRunning) {
    pauseTimer();
    updateButtonText('Resume');
  } else {
    startTimer();
    updateButtonText('Pause');
  }
}

function handleResetClick() {
  resetTimer();
  updateButtonText('Start');
}

function handleModeClick(btn, modeBtns) {
  const mode = btn.dataset.mode;
  switchMode(mode);
  
  modeBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateButtonText('Start');
}

function handleSaveSettings(pomodoroInput, shortBreakInput, longBreakInput) {
  const pomodoroMin = parseInt(pomodoroInput.value, 10);
  const shortBreakMin = parseInt(shortBreakInput.value, 10);
  const longBreakMin = parseInt(longBreakInput.value, 10);

  if (!isValidDuration(pomodoroMin) || !isValidDuration(shortBreakMin) || !isValidDuration(longBreakMin)) {
    alert(`Please enter values between ${MIN_DURATION} and ${MAX_DURATION} minutes.`);
    return;
  }

  durations.pomodoro = pomodoroMin;
  durations.shortBreak = shortBreakMin;
  durations.longBreak = longBreakMin;

  if (!isRunning) {
    timeRemaining = durations[currentMode] * SECONDS_PER_MINUTE;
    updateDisplay();
  }

  alert('Settings saved!');
}

// DOM initialization
function initializeEventListeners(elements) {
  const { startBtn, resetBtn, modeBtns, pomodoroInput, shortBreakInput, longBreakInput, saveSettingsBtn } = elements;

  startBtn.addEventListener('click', handleStartClick);
  resetBtn.addEventListener('click', handleResetClick);
  
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => handleModeClick(btn, modeBtns));
  });

  saveSettingsBtn.addEventListener('click', () => {
    handleSaveSettings(pomodoroInput, shortBreakInput, longBreakInput);
  });
}

function getDOMElements() {
  return {
    startBtn: document.getElementById('startBtn'),
    resetBtn: document.getElementById('resetBtn'),
    timerDisplay: document.getElementById('timerDisplay'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    pomodoroInput: document.getElementById('pomodoroInput'),
    shortBreakInput: document.getElementById('shortBreakInput'),
    longBreakInput: document.getElementById('longBreakInput'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn')
  };
}

function resetTimerState() {
  clearInterval(timerInterval);
  currentMode = 'pomodoro';
  timeRemaining = durations[currentMode] * SECONDS_PER_MINUTE;
  isRunning = false;
}

export function showPomodoroPage() {
  const contentSection = document.querySelector('.content');

  if (!contentSection) {
    console.error('Content section not found');
    return;
  }

  resetTimerState();

  contentSection.innerHTML = `
    <div class="pomodoro-page">
      <div class="pomodoro-timer-card">
        <div class="mode-selector">
          <button class="mode-btn active" id="pomodoroBtn" data-mode="pomodoro">Pomodoro</button>
          <button class="mode-btn" id="shortBreakBtn" data-mode="shortBreak">Short Break</button>
          <button class="mode-btn" id="longBreakBtn" data-mode="longBreak">Long Break</button>
        </div>
        <h2 class="timer-display" id="timerDisplay">25:00</h2>
        <div class="pomodoro-controls">
          <button class="button-primary M" id="startBtn">Start</button>
          <button class="button-secondary M" id="resetBtn">Reset</button>
        </div>
      </div>
      <div class="pomodoro-settings">
        <h3>Settings</h3>
        <div class="settings-grid">
          <div class="time-selector">
            <label for="pomodoroInput">Pomodoro (minutes):</label>
            <input type="number" id="pomodoroInput" min="${MIN_DURATION}" max="${MAX_DURATION}" value="${durations.pomodoro}" />
          </div>
          <div class="time-selector">
            <label for="shortBreakInput">Short Break (minutes):</label>
            <input type="number" id="shortBreakInput" min="${MIN_DURATION}" max="${MAX_DURATION}" value="${durations.shortBreak}" />
          </div>
          <div class="time-selector">
            <label for="longBreakInput">Long Break (minutes):</label>
            <input type="number" id="longBreakInput" min="${MIN_DURATION}" max="${MAX_DURATION}" value="${durations.longBreak}" />
          </div>
        </div>
        <button class="button-secondary M" id="saveSettingsBtn">Save Settings</button>
      </div>
    </div>
  `;

  const elements = getDOMElements();
  
  // Assign to module-level variables
  startBtn = elements.startBtn;
  timerDisplay = elements.timerDisplay;
  
  // Initialize event listeners
  initializeEventListeners(elements);
}
