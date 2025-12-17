let timerInterval = null;
let timeRemaining = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let currentMode = 'pomodoro'; // Current mode: 'pomodoro', 'shortBreak', 'longBreak'
let durations = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15
};
let startBtn = null;
let timerDisplay = null;

function startTimer() {
  isRunning = true;
  timerInterval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateDisplay();
    } else {
      pauseTimer();
      startBtn.textContent = "Start";
      alert("Timer complete!");
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
}

function resetTimer() {
  pauseTimer();
  timeRemaining = durations[currentMode] * 60;
  updateDisplay();
}

function switchMode(mode) {
  if (isRunning) {
    alert("Please stop the timer before switching modes.");
    return;
  }
  currentMode = mode;
  timeRemaining = durations[currentMode] * 60;
  updateDisplay();
}

function updateDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function showPomodoroPage() {
  const contentSection = document.querySelector(".content");

  if (!contentSection) {
    console.error("Content section not found");
    return;
  }

  // Reset timer state when showing page
  clearInterval(timerInterval);
  currentMode = 'pomodoro';
  timeRemaining = durations[currentMode] * 60;
  isRunning = false;

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
            <input type="number" id="pomodoroInput" min="1" max="120" value="25" />
          </div>
          <div class="time-selector">
            <label for="shortBreakInput">Short Break (minutes):</label>
            <input type="number" id="shortBreakInput" min="1" max="120" value="5" />
          </div>
          <div class="time-selector">
            <label for="longBreakInput">Long Break (minutes):</label>
            <input type="number" id="longBreakInput" min="1" max="120" value="15" />
          </div>
        </div>
        <button class="button-secondary M" id="saveSettingsBtn">Save Settings</button>
      </div>
    </div>
  `;

  startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  timerDisplay = document.getElementById("timerDisplay");
  const modeBtns = document.querySelectorAll(".mode-btn");
  const pomodoroInput = document.getElementById("pomodoroInput");
  const shortBreakInput = document.getElementById("shortBreakInput");
  const longBreakInput = document.getElementById("longBreakInput");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");

  startBtn.addEventListener("click", () => {
    if (isRunning) {
      pauseTimer();
      startBtn.textContent = "Resume";
    } else {
      startTimer();
      startBtn.textContent = "Pause";
    }
  });

  resetBtn.addEventListener("click", () => {
    resetTimer();
    startBtn.textContent = "Start";
  });

  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      switchMode(mode);
      
      modeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      startBtn.textContent = "Start";
    });
  });

  saveSettingsBtn.addEventListener("click", () => {
    const pomodoroMin = parseInt(pomodoroInput.value);
    const shortBreakMin = parseInt(shortBreakInput.value);
    const longBreakMin = parseInt(longBreakInput.value);

    if (pomodoroMin < 1 || pomodoroMin > 120 || 
        shortBreakMin < 1 || shortBreakMin > 120 || 
        longBreakMin < 1 || longBreakMin > 120) {
      alert("Please enter values between 1 and 120 minutes.");
      return;
    }

    durations.pomodoro = pomodoroMin;
    durations.shortBreak = shortBreakMin;
    durations.longBreak = longBreakMin;

    if (!isRunning) {
      timeRemaining = durations[currentMode] * 60;
      updateDisplay();
    }

    alert("Settings saved!");
  });
}
