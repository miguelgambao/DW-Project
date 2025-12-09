export function PieChart(canvasId, completedCount, totalCount) {
    const completionPercent = totalCount ? (completedCount / totalCount) : 0;

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const lineWidth = 15;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#EEF2E4';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -0.5 * Math.PI, (-0.5 + 2 * completionPercent) * Math.PI);
    ctx.strokeStyle = '#3B623F';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.fillStyle = '#3B623F';
    ctx.font = 'bold 2rem Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(completionPercent * 100)}%`, centerX, centerY);
}
