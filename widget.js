const widgetContainer = document.getElementById('widgetContainer');
const widgetMode = document.getElementById('widgetMode');
const widgetTimer = document.getElementById('widgetTimer');
const expandBtn = document.getElementById('expandBtn');
const closeBtn = document.getElementById('closeBtn');

expandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.api && window.api.showMainWindow) {
        window.api.showMainWindow();
    }
});

closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.api && window.api.closeWidget) {
        window.api.closeWidget();
    }
});

widgetContainer.addEventListener('dblclick', () => {
    if (window.api && window.api.showMainWindow) {
        window.api.showMainWindow();
    }
});

if (window.api && window.api.onTimerUpdate) {
    window.api.onTimerUpdate((data) => {
        widgetTimer.textContent = data.formattedTime;
        
        if (data.currentMode === 'pomodoro') {
            widgetMode.textContent = 'WORK';
            widgetContainer.classList.remove('break-mode');
        } else if (data.currentMode === 'shortBreak') {
            widgetMode.textContent = 'SHORT BREAK';
            widgetContainer.classList.add('break-mode');
        } else if (data.currentMode === 'longBreak') {
            widgetMode.textContent = 'LONG BREAK';
            widgetContainer.classList.add('break-mode');
        }
    });
}
