const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");
const detectedNames = new Set();

canvas.width = canvas.clientWidth* devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;
ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

const w = canvas.width / devicePixelRatio;
const h = canvas.height / devicePixelRatio;
const cx = w / 2;
const cy = h / 2;
const radius = w / 2 * 0.9;

function drawRadar() { 
    ctx.fillStyle = "#07121f";
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
let paused = false;

function drawLine() {
    const x = cx +  Math.cos(angle) * radius;
    const y = cy +  Math.sin(angle) * radius;

    const sweepWidth = Math.PI / 25;
    const startAngle = angle - sweepWidth / 2;
    const endAngle = angle + sweepWidth / 2;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, "rgba(0, 255, 204, 0.0)");
    gradient.addColorStop(0.7, "rgba(0, 255, 204, 0.05)");
    gradient.addColorStop(1, "rgba(0, 255, 204, 0.25)");

    ctx.beginPath()
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath()
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#00ffcc88";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ffcc";
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16);
    centerGlow.addColorStop(0, "rgba(0,255,204,0.9)");
    centerGlow.addColorStop(0.4, "rgba(0,255,204,0.6)");
    centerGlow.addColorStop(1, "rgba(0,255,204,0)");
    ctx.fillStyle = centerGlow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 255, 204, 0.4)";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00ffccff";
    ctx.stroke();
    ctx.shadowBlur = 0;
}

const dots = [];

function generateDots() {
  dots.length = 0;
for (let i = 0; i < 8; i++) {
    const dist = Math.random() * radius * 0.9;
    const dir  = Math.random() * Math.PI * 2;
    dots.push({ 
        x: cx + Math.cos(dir) * dist,
        y: cy + Math.sin(dir) * dist,
        visible : false,
        pulse: 0,
        user: null,
        opacity: 0,
    })
  }
}

generateDots();
setInterval(generateDots, 8000);

async function fetchRandomUser(dot) {
  try {
      dot.user = {
      name: "Scanning...",
      country: "",
      imgObj: null,
      imgLoaded: false,
    };

    const res = await fetch("https://randomuser.me/api/");
    const data = await res.json();
    const user = data.results[0];

    const img = new Image();
    img.src = user.picture.thumbnail;

    dot.user.name = `${user.name.first} ${user.name.last}`;
    dot.user.country = user.location.country
    dot.user.imgObj = img;

    img.onload = () => {
        dot.user.imgLoaded = true
    }

        const detectedItems = document.getElementById("detectedItems")
        const li = document.createElement("li")
        li.innerHTML = `
        <img src="${user.picture.thumbnail}" alt="User">
        <div>
            <div>${dot.user.name}</div>
            <small>${dot.user.country}</small>
        </div>
        `;

        if (!detectedNames.has(dot.user.name)) {
            detectedNames.add(dot.user.name);
            detectedItems.prepend(li)
        }    

  } catch (err) {
    console.error("User fetch error:", err)
  }
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
          if (!dot.visible) {
            dot.visible = true;
            dot.pulse = 1.0;
            if (!dot.user) fetchRandomUser(dot);
          }
        } else {
            dot.visible = false;
        }

        if (dot.opacity < 1) dot.opacity += 0.02;

        if (Math.random() < 0.02) {
            const moveAngle = Math.random() * Math.PI * 2;
            const moveDist = Math.random() * 4 - 2;
            dot.x += Math.cos(moveAngle) * moveDist;
            dot.y += Math.sin(moveAngle) * moveDist;
        }

        if (dot.pulse > 0) {
            const pulseSize = 4 + dot.pulse * 4;
            const alpha = dot.pulse * dot.opacity;

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

            if (dot.user) {
              ctx.font = "14px Arial";
              ctx.fillStyle = "#00ffcc";
              ctx.fillText(dot.user.name, dot.x + 10, dot.y - 10)
              ctx.fillText(dot.user.country, dot.x + 10, dot.y + 10)

              if (dot.user.imgObj && dot.user.imgLoaded) {
                   ctx.drawImage(dot.user.imgObj, dot.x - 20, dot.y - 60, 30, 30)
                  }
              } 

        } else {
            ctx.beginPath()
            ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(0, 255, 204, ${0.33 * dot.opacity})`;
            ctx.fill();

            if (dot.user && dot.user.name !== "Scanning...") {
                ctx.font = "14px Arial";
                ctx.fillStyle = "#00ffcc";
                ctx.fillText(dot.user.name, dot.x + 10, dot.y - 10)
                ctx.fillText(dot.user.country, dot.x + 10, dot.y + 10)

                if (dot.user.imgObj && dot.user.imgLoaded) {
                    ctx.drawImage(dot.user.imgObj, dot.x - 20, dot.y - 60, 30, 30)
                }
            }
        }
    })
}

function animate() {
    drawRadar();
    drawLine();

    if (!paused) {
        drawDots();
        angle += 0.02;
        if (angle > Math.PI * 2) {
            angle = 0;
        }
    }
    requestAnimationFrame(animate);
}

animate()

document.getElementById("pauseBtn").addEventListener("click", () =>{
    paused = true;
})

document.getElementById("resumeBtn").addEventListener("click", () =>{
    paused = false;
})