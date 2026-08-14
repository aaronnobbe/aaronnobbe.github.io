/* Cards render in array order, filling left-to-right then wrapping to the
   next row (CSS grid, 3 columns). Newest trip goes first. To add a new
   trip: drop the photo in assets/gallery/ and add an entry to the TOP
   of this array. */
const travelEntries = [
  { year: "2026", location: "Add a destination", caption: "Replace this card with a favorite travel photo.", image: "assets/gallery/travel-7.jpg" },
  { year: "2025", location: "Add a destination", caption: "A short memory, trip note, or story goes here.", image: "assets/gallery/travel-6.jpg" },
  { year: "2024", location: "Add a destination", caption: "Keep captions short and let the photography lead.", image: "assets/gallery/travel-5.jpg" },
  { year: "2023", location: "Add a destination", caption: "More locations can be added by copying an entry.", image: "assets/gallery/travel-4.jpg" },
  { year: "2022", location: "Add a destination", caption: "Optional: add a city, country, or tournament.", image: "assets/gallery/travel-3.jpg" },
  { year: "2021", location: "Add a destination", caption: "Build this into a visual travel timeline over time.", image: "assets/gallery/travel-2.jpg" },
  { year: "2020", location: "Add a destination", caption: "Add a city, country, or trip name here.", image: "assets/gallery/travel-1.jpg" }
];

const travelGrid = document.getElementById("travelGrid");
travelGrid.innerHTML = travelEntries.map(item => `
  <article class="travel-card" style="--travel-image: url('${item.image}')">
    <span class="travel-year">${item.year}</span>
    <h3>${item.location}</h3>
    <p>${item.caption}</p>
  </article>
`).join("");

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
});
document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

/* ---------------------------------------------------------
   HERO RUN — browser adaptation of the supplied C++ game.
   The original project targets a 16x2 character LCD. Here,
   the core idea is reimagined as a Jumpman-style stepped
   platform runner: rigid square blocks scroll in from the
   right at up to three stacked heights. Landing on a block
   lets you jump again to climb the next layer; running into
   a taller block you haven't climbed yet ends the run. Speed
   ramps up continuously the longer you survive.
--------------------------------------------------------- */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startGame");
const statusEl = document.getElementById("gameStatus");
const scoreEl = document.getElementById("score");

const BLOCK = 36;          // square block size (width == height)
const GROUND_Y = 238;      // baseline y for level 0
const MAX_LEVEL = 2;       // three total stand-on heights: 0, 1, 2
const GRAVITY = 1650;
const JUMP_VELOCITY = -430; // tuned so one jump clears exactly one block layer

let game = null;
let raf = null;
let lastTime = 0;

function levelTopY(level) {
  return GROUND_Y - level * BLOCK;
}

function pickNextLevel(prev) {
  const r = Math.random();
  if (prev < MAX_LEVEL && r < 0.35) return prev + 1;
  if (prev > 0 && r < 0.70) return Math.random() < 0.65 ? prev - 1 : 0;
  return prev;
}

function makeColumn(x, level) {
  return { x, level };
}

function resetGame() {
  game = {
    running: false,
    over: false,
    player: {
      x: 90, y: levelTopY(0) - 38, w: 28, h: 38,
      vy: 0, grounded: true, restingTopY: levelTopY(0)
    },
    columns: [],
    genLevel: 0,
    streakLeft: 5,
    distance: 0,
    score: 0,
    speed: 200,
    stars: Array.from({ length: 40 }, (_, i) => ({
      x: (i * 83) % 760, y: 25 + (i * 37) % 150, s: 1 + (i % 2)
    }))
  };

  // seed a flat run of ground so the player has room before the first climb
  let cx = 0;
  for (let i = 0; i < 10; i++) {
    game.columns.push(makeColumn(cx, 0));
    cx += BLOCK;
  }
  game.nextColumnX = cx;

  drawGame();
  scoreEl.textContent = "0000";
}
resetGame();

function startGame() {
  resetGame();
  game.running = true;
  game.over = false;
  statusEl.textContent = "Run. Climb the blocks — one layer at a time.";
  lastTime = performance.now();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(loop);
}

function jump() {
  if (!game) return;
  if (!game.running) {
    startGame();
    return;
  }
  if (game.player.grounded) {
    game.player.grounded = false;
    game.player.vy = JUMP_VELOCITY;
  }
}

function endRun() {
  game.running = false;
  game.over = true;
  statusEl.textContent = "Game over — hit Start / Restart to try again.";
}

function columnAt(x) {
  for (const c of game.columns) {
    if (x >= c.x && x < c.x + BLOCK) return c;
  }
  // fall back to the nearest column so the player never falls through the world
  return game.columns[game.columns.length - 1] || makeColumn(0, 0);
}

function generateColumns() {
  while (game.nextColumnX < canvas.width + BLOCK * 2) {
    if (game.streakLeft <= 0) {
      game.genLevel = pickNextLevel(game.genLevel);
      // difficulty ramps up: shorter streaks between height changes over time
      const minStreak = Math.max(2, 5 - Math.floor(game.distance / 2200));
      game.streakLeft = minStreak + Math.floor(Math.random() * 3);
    }
    game.columns.push(makeColumn(game.nextColumnX, game.genLevel));
    game.nextColumnX += BLOCK;
    game.streakLeft--;
  }
}

function update(dt) {
  game.distance += game.speed * dt;
  game.speed = Math.min(620, 200 + game.distance * 0.014);
  game.score = Math.floor(game.distance / 5);
  scoreEl.textContent = String(game.score).padStart(4, "0");

  for (const c of game.columns) c.x -= game.speed * dt;
  game.columns = game.columns.filter(c => c.x + BLOCK > -BLOCK);
  generateColumns();

  const p = game.player;
  const sampleX = p.x + p.w / 2;

  if (p.grounded) {
    const col = columnAt(sampleX);
    const topY = levelTopY(col.level);
    if (topY > p.restingTopY) {
      // the ground drops away ahead — step off the ledge
      p.grounded = false;
      p.vy = 0;
    } else if (topY < p.restingTopY) {
      // a taller block arrived and we never jumped for it
      endRun();
      return;
    }
    // else: same height, keep resting in place
  }

  if (!p.grounded) {
    p.vy += GRAVITY * dt;
    p.y += p.vy * dt;

    const col = columnAt(sampleX);
    const topY = levelTopY(col.level);
    if (p.y + p.h >= topY && p.vy >= 0) {
      p.y = topY - p.h;
      p.vy = 0;
      p.grounded = true;
      p.restingTopY = topY;
    }
    if (p.y > canvas.height + 60) {
      endRun();
      return;
    }
  }
}

function drawBlockColumn(c) {
  const topY = levelTopY(c.level);
  if (c.level === 0) {
    // flat ground strip only
    ctx.fillStyle = "rgba(85,215,232,.12)";
    ctx.fillRect(c.x, GROUND_Y, BLOCK, canvas.height - GROUND_Y);
    ctx.strokeStyle = "rgba(85,215,232,.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x, GROUND_Y + 1);
    ctx.lineTo(c.x + BLOCK, GROUND_Y + 1);
    ctx.stroke();
    return;
  }
  for (let i = 0; i < c.level; i++) {
    const by = GROUND_Y - (i + 1) * BLOCK;
    const grad = ctx.createLinearGradient(0, by, 0, by + BLOCK);
    grad.addColorStop(0, "#6aa7ff");
    grad.addColorStop(1, "#3d6fd6");
    ctx.fillStyle = grad;
    ctx.fillRect(c.x + 1, by + 1, BLOCK - 2, BLOCK - 2);
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(c.x + 1.5, by + 1.5, BLOCK - 3, BLOCK - 3);
    ctx.fillStyle = "rgba(255,255,255,.22)";
    ctx.fillRect(c.x + 3, by + 3, BLOCK - 6, 3);
  }
}

function drawGame() {
  if (!game) return;
  const w = canvas.width, h = canvas.height;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#091a2b");
  grad.addColorStop(1, "#07111f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(141,235,241,.42)";
  game.stars.forEach(s => ctx.fillRect(s.x, s.y, s.s, s.s));

  const glow = ctx.createLinearGradient(0, GROUND_Y - 100, 0, GROUND_Y + 20);
  glow.addColorStop(0, "rgba(85,215,232,0)");
  glow.addColorStop(1, "rgba(85,215,232,.07)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, GROUND_Y - 100, w, 120);

  game.columns.forEach(drawBlockColumn);

  const p = game.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = "#f3f7fb";
  ctx.shadowColor = "#8eeaf1";
  ctx.shadowBlur = 18;
  ctx.fillRect(7, 0, 15, 12);
  ctx.fillRect(4, 11, 20, 16);
  ctx.fillRect(0, 24, 10, 6);
  ctx.fillRect(18, 24, 10, 6);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#07111f";
  ctx.fillRect(17, 4, 3, 3);
  ctx.restore();

  if (!game.running) {
    ctx.fillStyle = "rgba(3,9,16,.58)";
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f3f7fb";
    ctx.font = "800 26px Manrope, sans-serif";
    ctx.fillText(game.over ? "RUN ENDED" : "HERO RUN", w / 2, 105);
    ctx.fillStyle = "#8fa3b8";
    ctx.font = "12px 'DM Mono', monospace";
    ctx.fillText(
      game.over ? `SCORE ${String(game.score).padStart(4, "0")}` : "PRESS START OR TAP THE GAME",
      w / 2, 132
    );
  }
}

function loop(now) {
  if (!game.running) {
    drawGame();
    return;
  }
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  drawGame();
  raf = requestAnimationFrame(loop);
}

startBtn.addEventListener("click", startGame);
canvas.addEventListener("pointerdown", jump);
window.addEventListener("keydown", e => {
  if (["Space", "ArrowUp"].includes(e.code)) {
    e.preventDefault();
    jump();
  }
});
