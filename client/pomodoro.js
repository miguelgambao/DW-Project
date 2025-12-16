let timerInterval = null;
let timeRemaining = 25 * 60; // 25 minutes in seconds
let isRunning = false;

export function showPomodoroPage() {
  const contentSection = document.querySelector(".content");

  if (!contentSection) {
    console.error("Content section not found");
    return;
  }

  // Reset timer state when showing page
  clearInterval(timerInterval);
  timeRemaining = 25 * 60;
  isRunning = false;

  contentSection.innerHTML = `
    <div class="pomodoro-page">
      <div class="pomodoro-timer-card">
        <h2 class="timer-display" id="timerDisplay">25:00</h2>
        <div class="pomodoro-controls">
          <button class="button-primary M" id="startBtn">Start</button>
          <button class="button-secondary M" id="resetBtn">Reset</button>
        </div>
      </div>
    </div>
  `;

  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  const timerDisplay = document.getElementById("timerDisplay");

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

  function startTimer() {
    isRunning = true;
    timerInterval = setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining--;
        updateDisplay();
      } else {
        pauseTimer();
        startBtn.textContent = "Start";
        alert("Pomodoro session complete! Time for a break.");
      }
    }, 1000);
  }

  function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
  }

  function resetTimer() {
    pauseTimer();
    timeRemaining = 25 * 60;
    updateDisplay();
  }

  function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
