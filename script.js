const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn")
const pauseBtn = document.getElementById("pauseBtn")
const resumeBtn = document.getElementById("resumeBtn")
const detectedNames = new Set();

canvas.width = canvas.clientWidth* devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;

const w = canvas.width / devicePixelRatio;
const h = canvas.height / devicePixelRatio;
const cx = w / 2;
const cy = h / 2;
const radius = w / 2 * 0.9;

function drawRadar() { 
    ctx.fillStyle = "#082209ff";
    ctx.fillRect(0, 0, w, h);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0a530f";
    ctx.stroke();

    for (let i  = 1; i <= 3; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (radius / 4) * i, 0, Math.PI * 2);
        ctx.strokeStyle = "#0a530f";
        ctx.stroke()
    }
}

let angle = 0;
let paused = false;
let scanning = false;

function drawLine() {
    const x = cx +  Math.cos(angle) * radius;
    const y = cy +  Math.sin(angle) * radius;

    const sweepWidth = Math.PI / 25;
    const startAngle = angle - sweepWidth / 2;
    const endAngle = angle + sweepWidth / 2;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, "#0a7a12ff");
    gradient.addColorStop(0.7, "#0a530f");
    gradient.addColorStop(1, "#fff");

    ctx.beginPath()
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath()
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#0a530f";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#fff";
    ctx.stroke();


    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16);
    centerGlow.addColorStop(0, "#0c9115ff");
    centerGlow.addColorStop(0.4, "#0a530f");
    centerGlow.addColorStop(1, "#0a530f");
    ctx.fillStyle = centerGlow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.strokeStyle = "#a59898ff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#849c86ff";
    ctx.stroke();
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
            ctx.strokeStyle = `rgba(0, 255, 0, ${alpha * 0.6})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur=20
            ctx.shadowColor ="#27b814ff";
            ctx.stroke();
        
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, pulseSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 0, ${alpha * 0.9})`;
            ctx.fill()

            dot.pulse -= 0.05;

            if (dot.user) {
              ctx.font = "14px Arial";
              ctx.fillStyle = "#fff";
              ctx.fillText(dot.user.name, dot.x + 10, dot.y - 10)
              ctx.fillText(dot.user.country, dot.x + 10, dot.y + 10)

              if (dot.user.imgObj && dot.user.imgLoaded) {
                   ctx.drawImage(dot.user.imgObj, dot.x - 20, dot.y - 60, 30, 30)
                  }
              } 

        } else {
            ctx.beginPath()
            ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${0.33 * dot.opacity})`;
            ctx.fill();

            if (dot.user && dot.user.name !== "Scanning...") {
                ctx.font = "14px Arial";
                ctx.fillStyle = "#fff";
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

    if (scanning && !paused) {
        drawDots();
        angle += 0.02;
        if (angle > Math.PI * 2) {
            angle = 0;
        }
    }
    requestAnimationFrame(animate);
}

animate()



startBtn.addEventListener("click", () => {
    if (!scanning) {
        scanning = true;
        paused = false
        startBtn.disabled = true
        pauseBtn.disabled = false
        resumeBtn.disabled = false;
        startBtn.textContent = "Scanning...";
    }
})

pauseBtn.addEventListener("click", () =>{
   if (scanning) paused = true;
})

resumeBtn.addEventListener("click", () =>{
   if (scanning) paused = false;
})