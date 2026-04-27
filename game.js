const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const coinCountEl = document.getElementById("coinCount");
const livesCountEl = document.getElementById("livesCount");
const gameStateEl = document.getElementById("gameState");
const restartButton = document.getElementById("restartButton");

const world = {
  width: 3000,
  height: canvas.height,
  gravity: 0.46,
  maxFallSpeed: 10.5
};

const keys = {
  left: false,
  right: false,
  jumpPressed: false
};

const timing = {
  coyoteFrames: 7,
  jumpBufferFrames: 9
};

const level = {
  grounds: [
    { x: 0, y: 468, w: 460, h: 72 },
    { x: 520, y: 468, w: 280, h: 72 },
    { x: 880, y: 468, w: 510, h: 72 },
    { x: 1480, y: 468, w: 320, h: 72 },
    { x: 1890, y: 468, w: 540, h: 72 },
    { x: 2510, y: 468, w: 490, h: 72 }
  ],
  platforms: [
    { x: 230, y: 370, w: 110, h: 18 },
    { x: 640, y: 340, w: 120, h: 18 },
    { x: 980, y: 310, w: 120, h: 18 },
    { x: 1250, y: 250, w: 120, h: 18 },
    { x: 1680, y: 340, w: 150, h: 18 },
    { x: 2140, y: 300, w: 130, h: 18 },
    { x: 2620, y: 260, w: 140, h: 18 }
  ],
  hazards: [
    { x: 460, y: 500, w: 60, h: 40 },
    { x: 800, y: 500, w: 80, h: 40 },
    { x: 1390, y: 500, w: 90, h: 40 },
    { x: 1800, y: 500, w: 90, h: 40 },
    { x: 2430, y: 500, w: 80, h: 40 }
  ],
  coins: [
    { x: 260, y: 328, r: 12 }, { x: 690, y: 300, r: 12 }, { x: 1030, y: 270, r: 12 },
    { x: 1300, y: 210, r: 12 }, { x: 1750, y: 300, r: 12 }, { x: 2200, y: 260, r: 12 },
    { x: 2690, y: 220, r: 12 }, { x: 1560, y: 426, r: 12 }, { x: 2030, y: 426, r: 12 }
  ],
  enemies: [
    { x: 610, y: 432, w: 40, h: 36, minX: 540, maxX: 740, dir: 1, speed: 1.05 },
    { x: 1110, y: 432, w: 40, h: 36, minX: 920, maxX: 1330, dir: -1, speed: 1.2 },
    { x: 1970, y: 432, w: 40, h: 36, minX: 1920, maxX: 2330, dir: 1, speed: 1.35 }
  ],
  flag: { x: 2890, y: 160, poleH: 308 }
};

const initialCoins = level.coins.map((coin) => ({ ...coin, collected: false }));
const initialEnemies = level.enemies.map((enemy) => ({ ...enemy }));

const playerTemplate = {
  x: 80,
  y: 360,
  w: 42,
  h: 58,
  vx: 0,
  vy: 0,
  speed: 3.15,
  jump: -10.8,
  onGround: false,
  facing: 1
};

let player;
let cameraX;
let coins;
let enemies;
let score;
let lives;
let status;
let invulnerableFrames;
let respawnPoint;
let lastFrameTime = 0;
let frameAccumulator = 0;
let coyoteTimer = 0;
let jumpBufferTimer = 0;

function resetGame() {
  player = { ...playerTemplate };
  cameraX = 0;
  coins = initialCoins.map((coin) => ({ ...coin }));
  enemies = initialEnemies.map((enemy) => ({ ...enemy }));
  score = 0;
  lives = 3;
  status = "Running";
  invulnerableFrames = 0;
  respawnPoint = {
    x: playerTemplate.x,
    y: playerTemplate.y
  };
  lastFrameTime = 0;
  frameAccumulator = 0;
  coyoteTimer = timing.coyoteFrames;
  jumpBufferTimer = 0;
  keys.left = false;
  keys.right = false;
  keys.jumpPressed = false;
  syncHud();
}

function syncHud() {
  coinCountEl.textContent = String(score);
  livesCountEl.textContent = String(lives);
  gameStateEl.textContent = status;
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function handlePlatformCollision(rect, delta) {
  const prevBottom = player.y + player.h - player.vy * delta;
  const nextBottom = player.y + player.h;
  const withinX = player.x + player.w > rect.x && player.x < rect.x + rect.w;

  if (withinX && prevBottom <= rect.y && nextBottom >= rect.y) {
    player.y = rect.y - player.h;
    player.vy = 0;
    player.onGround = true;
  }
}

function updateRespawnPoint() {
  if (!player.onGround) {
    return;
  }

  respawnPoint = {
    x: player.x,
    y: player.y
  };
}

function hurtPlayer() {
  if (invulnerableFrames > 0 || status !== "Running") {
    return;
  }

  lives -= 1;
  invulnerableFrames = 120;

  if (lives <= 0) {
    status = "Defeat";
  }

  player.x = respawnPoint.x;
  player.y = Math.max(120, respawnPoint.y - 12);
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  coyoteTimer = timing.coyoteFrames;
  jumpBufferTimer = 0;
  syncHud();
}

function update(delta) {
  if (status !== "Running") {
    return;
  }

  player.vx = 0;
  if (keys.left) {
    player.vx = -player.speed;
    player.facing = -1;
  }
  if (keys.right) {
    player.vx = player.speed;
    player.facing = 1;
  }

  player.x += player.vx * delta;
  player.x = Math.max(0, Math.min(world.width - player.w, player.x));

  player.vy = Math.min(world.maxFallSpeed, player.vy + world.gravity * delta);
  player.y += player.vy * delta;
  player.onGround = false;

  [...level.grounds, ...level.platforms].forEach((rect) => handlePlatformCollision(rect, delta));
  updateRespawnPoint();

  if (player.onGround) {
    coyoteTimer = timing.coyoteFrames;
  } else {
    coyoteTimer = Math.max(0, coyoteTimer - delta);
  }

  if (jumpBufferTimer > 0) {
    jumpBufferTimer = Math.max(0, jumpBufferTimer - delta);
  }

  if (jumpBufferTimer > 0 && coyoteTimer > 0 && status === "Running") {
    player.vy = player.jump;
    player.onGround = false;
    coyoteTimer = 0;
    jumpBufferTimer = 0;
  }

  if (player.y > canvas.height + 120) {
    hurtPlayer();
  }

  level.hazards.forEach((hazard) => {
    if (rectsOverlap(player, hazard)) {
      hurtPlayer();
    }
  });

  enemies.forEach((enemy) => {
    enemy.x += enemy.speed * enemy.dir * delta;
    if (enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) {
      enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX - enemy.w, enemy.x));
      enemy.dir *= -1;
    }
    if (rectsOverlap(player, enemy)) {
      const stomp = player.vy > 2 && player.y + player.h - enemy.y < 20;
      if (stomp) {
        enemy.defeated = true;
        player.vy = -8;
      } else {
        hurtPlayer();
      }
    }
  });
  enemies = enemies.filter((enemy) => !enemy.defeated);

  coins.forEach((coin) => {
    if (coin.collected) {
      return;
    }
    const nearX = player.x + player.w > coin.x - coin.r && player.x < coin.x + coin.r;
    const nearY = player.y + player.h > coin.y - coin.r && player.y < coin.y + coin.r;
    if (nearX && nearY) {
      coin.collected = true;
      score += 1;
      syncHud();
    }
  });

  if (
    player.x + player.w > level.flag.x - 10 &&
    player.y + player.h > level.flag.y &&
    score >= 6
  ) {
    status = "Victory";
    syncHud();
  }

  if (invulnerableFrames > 0) {
    invulnerableFrames = Math.max(0, invulnerableFrames - delta);
  }

  const targetCamera = player.x - canvas.width * 0.35;
  const clampedTarget = Math.max(0, Math.min(world.width - canvas.width, targetCamera));
  cameraX += (clampedTarget - cameraX) * 0.14 * delta;
}

function drawCloud(x, y, scale = 1) {
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
  ctx.arc(x + 24 * scale, y - 10 * scale, 24 * scale, 0, Math.PI * 2);
  ctx.arc(x + 54 * scale, y, 20 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawBackground() {
  ctx.fillStyle = "#96e37f";
  ctx.fillRect(0, 430, canvas.width, 110);

  drawCloud(120, 90, 1);
  drawCloud(360, 120, 1.2);
  drawCloud(680, 80, 0.9);
  drawCloud(860, 135, 1.1);

  for (let i = -1; i < 8; i += 1) {
    const hillX = i * 240 - (cameraX * 0.35) % 240;
    ctx.fillStyle = i % 2 === 0 ? "#5cb85c" : "#4aa84a";
    ctx.beginPath();
    ctx.moveTo(hillX, 430);
    ctx.quadraticCurveTo(hillX + 120, 270, hillX + 240, 430);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBlock(rect, color) {
  ctx.fillStyle = color;
  ctx.fillRect(rect.x - cameraX, rect.y, rect.w, rect.h);
  ctx.strokeStyle = "#6f3b0a";
  ctx.lineWidth = 3;
  ctx.strokeRect(rect.x - cameraX, rect.y, rect.w, rect.h);
}

function drawPlayer() {
  const blinking = invulnerableFrames > 0 && Math.floor(invulnerableFrames / 10) % 2 === 0;
  if (blinking) {
    return;
  }

  const x = player.x - cameraX;
  ctx.fillStyle = "#d64532";
  ctx.fillRect(x + 8, player.y + 8, player.w - 16, 18);
  ctx.fillStyle = "#c9302c";
  ctx.fillRect(x + 2, player.y + 18, player.w - 4, 24);
  ctx.fillStyle = "#ffdfc5";
  ctx.fillRect(x + 10, player.y + 14, player.w - 20, 12);
  ctx.fillStyle = "#20324d";
  ctx.fillRect(x + 6, player.y + 42, 12, 16);
  ctx.fillRect(x + 24, player.y + 42, 12, 16);

  ctx.fillStyle = "#7b3f00";
  ctx.fillRect(x + (player.facing > 0 ? 28 : 6), player.y + 18, 6, 6);
}

function drawEnemy(enemy) {
  const x = enemy.x - cameraX;
  ctx.fillStyle = "#7a4c29";
  ctx.fillRect(x, enemy.y + 10, enemy.w, enemy.h - 10);
  ctx.fillStyle = "#c49663";
  ctx.fillRect(x + 4, enemy.y, enemy.w - 8, 16);
  ctx.fillStyle = "#2b211d";
  ctx.fillRect(x + 7, enemy.y + 12, 8, 6);
  ctx.fillRect(x + 25, enemy.y + 12, 8, 6);
}

function drawCoin(coin) {
  const x = coin.x - cameraX;
  ctx.fillStyle = "#ffd84d";
  ctx.beginPath();
  ctx.arc(x, coin.y, coin.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c78c00";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = "#fff3a3";
  ctx.beginPath();
  ctx.moveTo(x, coin.y - 7);
  ctx.lineTo(x, coin.y + 7);
  ctx.stroke();
}

function drawFlag() {
  const poleX = level.flag.x - cameraX;
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(poleX, level.flag.y, 8, level.flag.poleH);
  ctx.fillStyle = "#2ec55c";
  ctx.beginPath();
  ctx.moveTo(poleX + 8, level.flag.y + 12);
  ctx.lineTo(poleX + 74, level.flag.y + 34);
  ctx.lineTo(poleX + 8, level.flag.y + 56);
  ctx.closePath();
  ctx.fill();
}

function drawStatusBanner() {
  if (status === "Running") {
    return;
  }

  ctx.fillStyle = "rgba(8, 24, 49, 0.72)";
  ctx.fillRect(240, 160, 480, 160);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 42px Segoe UI";
  ctx.fillText(status === "Victory" ? "Level Clear!" : "Game Over", canvas.width / 2, 225);
  ctx.font = "24px Segoe UI";
  ctx.fillText(
    status === "Victory" ? "You reached the castle in style." : "Press Restart for another run.",
    canvas.width / 2,
    270
  );
  ctx.font = "18px Segoe UI";
  ctx.fillText("Collect at least 6 coins before touching the flag.", canvas.width / 2, 305);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  level.grounds.forEach((ground) => drawBlock(ground, "#b87333"));
  level.platforms.forEach((platform) => drawBlock(platform, "#d28d45"));

  level.hazards.forEach((hazard) => {
    const x = hazard.x - cameraX;
    ctx.fillStyle = "#df3d3d";
    for (let i = 0; i < hazard.w; i += 20) {
      ctx.beginPath();
      ctx.moveTo(x + i, hazard.y + hazard.h);
      ctx.lineTo(x + i + 10, hazard.y);
      ctx.lineTo(x + i + 20, hazard.y + hazard.h);
      ctx.closePath();
      ctx.fill();
    }
  });

  coins.filter((coin) => !coin.collected).forEach(drawCoin);
  enemies.forEach(drawEnemy);
  drawFlag();
  drawPlayer();
  drawStatusBanner();
}

function loop(timestamp) {
  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const frameTime = Math.min(timestamp - lastFrameTime, 32);
  lastFrameTime = timestamp;
  frameAccumulator += frameTime;

  while (frameAccumulator >= 1000 / 60) {
    update(1);
    frameAccumulator -= 1000 / 60;
  }

  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.code)) {
    event.preventDefault();
  }

  if (event.code === "ArrowLeft") {
    keys.left = true;
  }
  if (event.code === "ArrowRight") {
    keys.right = true;
  }
  if (event.code === "ArrowUp" && !keys.jumpPressed && status === "Running") {
    keys.jumpPressed = true;
    jumpBufferTimer = timing.jumpBufferFrames;
  }
});

window.addEventListener("keyup", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.code)) {
    event.preventDefault();
  }

  if (event.code === "ArrowLeft") {
    keys.left = false;
  }
  if (event.code === "ArrowRight") {
    keys.right = false;
  }
  if (event.code === "ArrowUp") {
    keys.jumpPressed = false;
    if (player.vy < -4.5) {
      player.vy *= 0.55;
    }
  }
});

restartButton.addEventListener("click", resetGame);

resetGame();
requestAnimationFrame(loop);
