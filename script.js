const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth* devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;
ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

const w = canvas.width / devicePixelRatio;
const h = canvas.height / devicePixelRatio;
const cx = w / 2;
const cy = h / 2;
const radius = w / 2 * 0.9;

function drawRadar() {
    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#0f3d3e";
    ctx.fill();

    ctx.linetWidth = 2;
    ctx.strokeStyle = "#00ffcc33"
    ctx.stroke();
}

let angle = 0;

function drawline() {
    const endX = cx + radius * Math.cos(angle);
    const endY = cy + radius * Math.sin(angle);

    const gradient = ctx.createLinearGradient(cx, cy, endX, endY);
    gradient.addColorStop(0, "rgba(0, 255, 204, 0.2)");
    gradient.addColorStop(1, "rgba(0, 255, 204, 1)");

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = gradient;
    ctx.linetWidth = 3;
    ctx.stroke();
}

function animate() {
    drawRadar();
    drawline();

    angle += 0.03;
    if (angle > Math.PI * 2) {
        angle = 0;
    }
    requestAnimationFrame(animate);
}

animate()