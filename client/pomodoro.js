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
let pomodoroCount = 0; // Track completed pomodoros
let longBreakInterval = 3; // Number of short breaks before long break
let autoStart = false; // Auto-start next timer when current one completes

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

function isValidInterval(value) {
  const interval = parseInt(value, 10);
  return !isNaN(interval) && interval >= 1 && interval <= 10;
}

function updateButtonText(text) {
  if (startBtn) {
    startBtn.textContent = text;
    // Add paused class when button shows Start/Resume
    if (text === 'Start' || text === 'Resume') {
      startBtn.classList.add('paused');
    } else {
      startBtn.classList.remove('paused');
    }
  }
}

function getModeLabel(mode) {
  const labels = {
    pomodoro: 'Work Session',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  };
  return labels[mode] || 'Work Session';
}

function showNotification(title, body) {
  // Use Electron notification if available
  if (window.api && window.api.showNotification) {
    window.api.showNotification(title, body);
  } 
  // Otherwise use browser Notification API
  else if ('Notification' in window) {
    // Check if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: 'assets/icons/icon.png' });
    } 
    // Request permission if not determined
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, icon: 'assets/icons/icon.png' });
        }
      });
    }
  } 
  // Fallback to alert if Notification API not supported
  else {
    alert(`${title}\n${body}`);
  }
}

// Request notification permission when page loads (for web version)
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Timer functions
function startTimer() {
  // Clear any existing interval to prevent piling up
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  isRunning = true;
  updateDashboardWidget();
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
  
  if (currentMode === 'pomodoro') {
    pomodoroCount++;
    
    // Check if it's time for a long break
    if (pomodoroCount % longBreakInterval === 0) {
      showNotification('Pomodoro Complete!', 'Time for a long break.');
      currentMode = 'longBreak';
    } else {
      showNotification('Pomodoro Complete!', `Starting short break ${pomodoroCount} of ${longBreakInterval}.`);
      currentMode = 'shortBreak';
    }
    
    timeRemaining = durations[currentMode] * SECONDS_PER_MINUTE;
    updateDisplay();
    updateActiveModeButton();
  } else if (currentMode === 'shortBreak') {
    showNotification('Short Break Complete!', 'Ready for another pomodoro.');
    currentMode = 'pomodoro';
    timeRemaining = durations[currentMode] * SECONDS_PER_MINUTE;
    updateDisplay();
    updateActiveModeButton();
  } else if (currentMode === 'longBreak') {
    showNotification('Long Break Complete!', 'Starting fresh cycle.');
    pomodoroCount = 0; // Reset counter after long break
    currentMode = 'pomodoro';
    timeRemaining = durations[currentMode] * SECONDS_PER_MINUTE;
    updateDisplay();
    updateActiveModeButton();
  }
  
  // Auto-start next timer if enabled
  if (autoStart) {
    setTimeout(() => {
      startTimer();
      updateButtonText('Pause');
    }, 1000); // Small delay before auto-starting
  }
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  updateDashboardWidget();
  if (window.api && window.api.closeWidget) {
    window.api.closeWidget();
  }
}

function resetTimer() {
  pauseTimer();
  timeRemaining = durations[currentMode] * SECONDS_PER_MINUTE;
  updateDisplay();
}

export function resetTimerFromDashboard() {
  resetTimer();
  updateDashboardWidget();
}

function switchMode(mode) {
  if (isRunning) {
    pauseTimer();
    updateButtonText('Start');
  }
  currentMode = mode;
  timeRemaining = durations[currentMode] * SECONDS_PER_MINUTE;
  updateDisplay();
}

function updateDisplay() {
  if (timerDisplay) {
    timerDisplay.textContent = formatTime(timeRemaining);
  }
  
  // Update document title with time remaining only when timer is active
  if (isRunning) {
    const modePrefix = currentMode === 'pomodoro' ? '🍅' : '☕';
    document.title = `${formatTime(timeRemaining)} ${modePrefix} - Podoro`;
  } else {
    document.title = 'Podoro';
  }
  
  updateDashboardWidget();
  updateWidgetWindow();
}

function updateDashboardWidget() {
  const dashboardTimer = document.getElementById('dashboardTimerDisplay');
  const dashboardBtn = document.getElementById('dashboardTimerBtn');
  const dashboardMode = document.getElementById('dashboardModeLabel');
  
  if (dashboardTimer) {
    dashboardTimer.textContent = formatTime(timeRemaining);
  }
  
  if (dashboardBtn) {
    dashboardBtn.textContent = isRunning ? 'Pause' : 'Start';
    // Add paused class when stopped
    if (isRunning) {
      dashboardBtn.classList.remove('paused');
    } else {
      dashboardBtn.classList.add('paused');
    }
  }
  
  if (dashboardMode) {
    dashboardMode.textContent = getModeLabel(currentMode);
  }
}

function updateActiveModeButton() {
  const modeBtns = document.querySelectorAll('.mode-btn');
  modeBtns.forEach(btn => {
    if (btn.dataset.mode === currentMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updateWidgetWindow() {
  if (window.api && window.api.updateWidget) {
    const timerData = {
      formattedTime: formatTime(timeRemaining),
      isRunning: isRunning,
      currentMode: currentMode
    };
    window.api.updateWidget(timerData);
  }
}

// Make updateWidgetWindow globally accessible for main process
if (typeof window !== 'undefined') {
  window.updateWidgetWindow = updateWidgetWindow;
  window.isTimerRunning = () => isRunning;
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

function handleSaveSettings(pomodoroInput, shortBreakInput, longBreakInput, longBreakIntervalInput) {
  const pomodoroMin = parseInt(pomodoroInput.value, 10);
  const shortBreakMin = parseInt(shortBreakInput.value, 10);
  const longBreakMin = parseInt(longBreakInput.value, 10);
  const intervalValue = parseInt(longBreakIntervalInput.value, 10);

  if (!isValidDuration(pomodoroMin) || !isValidDuration(shortBreakMin) || !isValidDuration(longBreakMin)) {
    alert(`Please enter duration values between ${MIN_DURATION} and ${MAX_DURATION} minutes.`);
    return;
  }

  if (!isValidInterval(intervalValue)) {
    alert('Please enter between 1 and 10 short breaks before a long break.');
    return;
  }

  durations.pomodoro = pomodoroMin;
  durations.shortBreak = shortBreakMin;
  durations.longBreak = longBreakMin;
  longBreakInterval = intervalValue;

  if (!isRunning) {
    timeRemaining = durations[currentMode] * SECONDS_PER_MINUTE;
    updateDisplay();
  }

  alert('Settings saved!');
}

// DOM initialization
function initializeEventListeners(elements) {
  const { startBtn, resetBtn, modeBtns, pomodoroInput, shortBreakInput, longBreakInput, longBreakIntervalInput, saveSettingsBtn, autoStartCheckbox } = elements;

  startBtn.addEventListener('click', handleStartClick);
  resetBtn.addEventListener('click', handleResetClick);
  
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => handleModeClick(btn, modeBtns));
  });

  saveSettingsBtn.addEventListener('click', () => {
    handleSaveSettings(pomodoroInput, shortBreakInput, longBreakInput, longBreakIntervalInput);
  });
  
  autoStartCheckbox.addEventListener('change', (e) => {
    autoStart = e.target.checked;
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
    longBreakIntervalInput: document.getElementById('longBreakIntervalInput'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    autoStartCheckbox: document.getElementById('autoStartCheckbox')
  };
}

function resetTimerState() {
  clearInterval(timerInterval);
  currentMode = 'pomodoro';
  timeRemaining = durations[currentMode] * SECONDS_PER_MINUTE;
  isRunning = false;
  pomodoroCount = 0;
}

export function getTimerState() {
  return {
    timeRemaining,
    isRunning,
    currentMode,
    formattedTime: formatTime(timeRemaining),
    modeLabel: getModeLabel(currentMode)
  };
}

export function toggleTimer() {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
  updateDashboardWidget();
}

export function showPomodoroPage() {
  const contentSection = document.querySelector('.content');

  if (!contentSection) {
    console.error('Content section not found');
    return;
  }

  contentSection.innerHTML = `
    <div class="pomodoro-page">
      <div class="pomodoro-timer-card">
        <div class="mode-selector">
          <button class="mode-btn active" id="pomodoroBtn" data-mode="pomodoro">Work</button>
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
            <label for="pomodoroInput">Work (minutes):</label>
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
          <div class="time-selector">
            <label for="longBreakIntervalInput">Short Breaks before Long Break:</label>
            <input type="number" id="longBreakIntervalInput" min="1" max="10" value="${longBreakInterval}" />
          </div>
          <div class="time-selector">
            <label for="autoStartCheckbox">
              <input type="checkbox" id="autoStartCheckbox" ${autoStart ? 'checked' : ''} />
              Auto-start next timer
            </label>
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
  
  // Request notification permission on page load (for web version)
  requestNotificationPermission();
  
  // Update display with current state
  updateDisplay();
  updateActiveModeButton();
  updateButtonText(isRunning ? 'Pause' : 'Start');
}
