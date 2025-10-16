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
    ctx.fillStyle = "rgba(7, 18, 31, 0.15)";
    ctx.fillRect(0, 0, w, h);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#00ffcc33";
    ctx.stroke();

    for (let i  = 1; i <= 3; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (radius / 4) * i, 0, Math.PI * 2);
        ctx.strokeStyle = "#00ffcc22";
        ctx.stroke()
    }
}

let angle = 0;

function drawLine() {
    const x = cx +  Math.cos(angle) * radius;
    const y = cy +  Math.sin(angle) * radius;

    const gradient = ctx.createLinearGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, "rgba(0, 255, 204, 0.2)");
    gradient.addColorStop(1, "rgba(0, 255, 204, 1)");

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#00ffcc88";
    ctx.stroke();
}

const dots = [];

for (let i = 0; i < 8; i++) {
    const dist = Math.random() * radius * 0.9;
    const dir  = Math.random() * Math.PI * 2;
    dots.push({ 
        x: cx + Math.cos(dir) * dist,
        y: cy + Math.sin(dir) * dist,
        visible : false,
        pulse: 0,
    })
}

function drawDots() {
    dots.forEach((dot) => {
        const dx = dot.x - cx;
        const dy = dot.y - cy;
        const dotAngle = Math.atan2(dy, dx);

        let diff = Math.abs(dotAngle - angle);
        if (diff > Math.PI) diff = (Math.PI * 2) - diff;

        const detectionRange = 0.15;
        if (diff < detectionRange) {
            dot.visible = true;
            dot.pulse = 1.0;
        } else {
            dot.visible = false;
        }

        if (Math.random() < 0.02) {
            const moveAngle = Math.random() * Math.PI * 2;
            const moveDist = Math.random() * 4 - 2;
            dot.x += Math.cos(moveAngle) * moveDist;
            dot.y += Math.sin(moveAngle) * moveDist;
        }

        if (dot.pulse > 0) {
            const pulseSize = 4 + dot.pulse * 4;
            const alpha = dot.pulse;

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, pulseSize * 2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 204, ${alpha * 0.3})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, pulseSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 204, ${alpha})`;
            ctx.fill()

            dot.pulse -= 0.05;

        } else {
            ctx.beginPath()
            ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2)
            ctx.fillStyle = "#00ffcc33";
            ctx.fill();
        }
    })
}

function animate() {
    drawRadar();
    drawLine();
    drawDots();
    angle += 0.03;
    if (angle > Math.PI * 2) {
        angle = 0;
    }

    requestAnimationFrame(animate);
}

animate()