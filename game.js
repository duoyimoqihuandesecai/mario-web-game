const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const coinCountEl = document.getElementById("coinCount");
const livesCountEl = document.getElementById("livesCount");
const gameStateEl = document.getElementById("gameState");
const restartButton = document.getElementById("restartButton");

const world = {
  width: 3200,
  height: canvas.height,
  gravity: 0.44,
  maxFallSpeed: 10.5
};

const keys = {
  left: false,
  right: false,
  jumpPressed: false,
  shootPressed: false
};

const timing = {
  coyoteFrames: 7,
  jumpBufferFrames: 9
};

const level = {
  grounds: [
    { x: 0, y: 468, w: 900, h: 72 },
    { x: 950, y: 468, w: 610, h: 72 },
    { x: 1660, y: 468, w: 330, h: 72 },
    { x: 2070, y: 468, w: 610, h: 72 },
    { x: 2770, y: 468, w: 430, h: 72 }
  ],
  platforms: [],
  pipes: [
    { x: 620, y: 396, w: 72, h: 72 },
    { x: 1460, y: 372, w: 88, h: 96 },
    { x: 2280, y: 404, w: 72, h: 64 }
  ],
  hazards: [
    { x: 920, y: 432, w: 70, h: 36 },
    { x: 1560, y: 432, w: 100, h: 36 },
    { x: 1990, y: 432, w: 80, h: 36 },
    { x: 2690, y: 432, w: 80, h: 36 }
  ],
  blocks: [
    { x: 360, y: 320, w: 36, h: 36, type: "question", contains: "coin" },
    { x: 432, y: 320, w: 36, h: 36, type: "brick", contains: null },
    { x: 504, y: 320, w: 36, h: 36, type: "question", contains: "mushroom" },
    { x: 576, y: 320, w: 36, h: 36, type: "brick", contains: null },
    { x: 432, y: 212, w: 36, h: 36, type: "brick", contains: null },
    { x: 504, y: 212, w: 36, h: 36, type: "brick", contains: null },
    { x: 1150, y: 284, w: 36, h: 36, type: "question", contains: "coin" },
    { x: 1222, y: 248, w: 36, h: 36, type: "question", contains: "flower" },
    { x: 1294, y: 284, w: 36, h: 36, type: "brick", contains: null },
    { x: 1850, y: 260, w: 36, h: 36, type: "question", contains: "coin" },
    { x: 1922, y: 188, w: 36, h: 36, type: "question", contains: "coin" },
    { x: 1994, y: 260, w: 36, h: 36, type: "brick", contains: null },
    { x: 2500, y: 248, w: 36, h: 36, type: "question", contains: "flower" },
    { x: 2572, y: 152, w: 36, h: 36, type: "brick", contains: null },
    { x: 2644, y: 224, w: 36, h: 36, type: "question", contains: "coin" },
    { x: 900, y: 320, w: 36, h: 36, type: "brick", contains: null },
    { x: 972, y: 320, w: 36, h: 36, type: "brick", contains: null },
    { x: 1044, y: 320, w: 36, h: 36, type: "brick", contains: null },
    { x: 1900, y: 332, w: 36, h: 36, type: "brick", contains: null },
    { x: 1972, y: 332, w: 36, h: 36, type: "brick", contains: null },
    { x: 2044, y: 332, w: 36, h: 36, type: "brick", contains: null },
    { x: 2420, y: 296, w: 36, h: 36, type: "brick", contains: null },
    { x: 2492, y: 296, w: 36, h: 36, type: "brick", contains: null },
    { x: 2564, y: 296, w: 36, h: 36, type: "brick", contains: null }
  ],
  coins: [
    { x: 648, y: 286, r: 12 },
    { x: 640, y: 350, r: 12 },
    { x: 676, y: 346, r: 12 },
    { x: 1020, y: 280, r: 12 },
    { x: 1604, y: 334, r: 12 },
    { x: 2060, y: 296, r: 12 },
    { x: 2468, y: 188, r: 12 },
    { x: 2920, y: 420, r: 12 }
  ],
  enemies: [
    { x: 264, y: 432, w: 40, h: 36, minX: 220, maxX: 340, dir: 1, speed: 0.82, kind: "goomba" },
    { x: 760, y: 432, w: 40, h: 36, minX: 700, maxX: 900, dir: 1, speed: 0.9, kind: "goomba" },
    { x: 920, y: 432, w: 40, h: 36, minX: 900, maxX: 1100, dir: 1, speed: 0.92, kind: "goomba" },
    { x: 1080, y: 432, w: 40, h: 36, minX: 1020, maxX: 1400, dir: 1, speed: 0.96, kind: "goomba" },
    { x: 1320, y: 432, w: 40, h: 36, minX: 1180, maxX: 1540, dir: -1, speed: 1.05, kind: "beetle" },
    { x: 1580, y: 432, w: 40, h: 36, minX: 1560, maxX: 1660, dir: -1, speed: 0.88, kind: "goomba" },
    { x: 1760, y: 432, w: 44, h: 40, minX: 1680, maxX: 1980, dir: -1, speed: 0.92, kind: "koopa" },
    { x: 2160, y: 432, w: 44, h: 40, minX: 2110, maxX: 2520, dir: 1, speed: 0.95, kind: "koopa" },
    { x: 2380, y: 432, w: 40, h: 36, minX: 2320, maxX: 2520, dir: -1, speed: 0.96, kind: "beetle" },
    { x: 2680, y: 432, w: 40, h: 36, minX: 2620, maxX: 2780, dir: 1, speed: 0.9, kind: "goomba" },
    { x: 2860, y: 432, w: 40, h: 36, minX: 2800, maxX: 3120, dir: 1, speed: 1.02, kind: "goomba" }
  ],
  bushes: [
    { x: 40, y: 410, w: 120, h: 48 },
    { x: 120, y: 410, w: 120, h: 48 },
    { x: 1080, y: 408, w: 140, h: 52 },
    { x: 1720, y: 410, w: 120, h: 48 },
    { x: 2860, y: 408, w: 140, h: 52 }
  ],
  hills: [
    { x: -20, y: 300, w: 220, h: 146, color: "#73cf57" },
    { x: 80, y: 286, w: 230, h: 160, color: "#64c64f" },
    { x: 760, y: 266, w: 290, h: 180, color: "#73cf57" },
    { x: 1600, y: 280, w: 240, h: 165, color: "#64c64f" },
    { x: 2400, y: 258, w: 300, h: 190, color: "#73cf57" }
  ],
  clouds: [
    { x: 100, y: 92, scale: 1 },
    { x: 420, y: 112, scale: 1.15 },
    { x: 860, y: 86, scale: 0.95 },
    { x: 1360, y: 122, scale: 1.1 },
    { x: 1880, y: 78, scale: 1 },
    { x: 2420, y: 108, scale: 1.2 }
  ],
  flag: { x: 3070, y: 150, poleH: 318 }
};

const initialCoins = level.coins.map((coin) => ({ ...coin, collected: false }));
const initialEnemies = level.enemies.map((enemy) => ({ ...enemy }));
const initialBlocks = level.blocks.map((block) => ({
  ...block,
  used: false,
  bumpOffset: 0,
  bumpVelocity: 0
}));

const playerTemplate = {
  x: 80,
  y: 360,
  w: 32,
  h: 58,
  vx: 0,
  vy: 0,
  speed: 3.85,
  jump: -11.8,
  onGround: false,
  facing: 1,
  form: "small"
};

let player;
let cameraX;
let coins;
let enemies;
let blocks;
let powerups;
let floatingCoins;
let debrisParticles;
let projectiles;
let coinsCollected;
let lives;
let status;
let invulnerableFrames;
let respawnPoint;
let lastFrameTime = 0;
let frameAccumulator = 0;
let coyoteTimer = 0;
let jumpBufferTimer = 0;
let shootCooldown = 0;

function resetGame() {
  player = { ...playerTemplate };
  cameraX = 0;
  coins = initialCoins.map((coin) => ({ ...coin }));
  enemies = initialEnemies.map((enemy) => ({ ...enemy }));
  blocks = initialBlocks.map((block) => ({ ...block, broken: false }));
  powerups = [];
  floatingCoins = [];
  debrisParticles = [];
  projectiles = [];
  coinsCollected = 0;
  lives = 3;
  status = "Running";
  invulnerableFrames = 0;
  respawnPoint = { x: playerTemplate.x, y: playerTemplate.y };
  lastFrameTime = 0;
  frameAccumulator = 0;
  coyoteTimer = timing.coyoteFrames;
  jumpBufferTimer = 0;
  keys.left = false;
  keys.right = false;
  keys.jumpPressed = false;
  keys.shootPressed = false;
  shootCooldown = 0;
  syncHud();
}

function syncHud() {
  coinCountEl.textContent = String(coinsCollected);
  livesCountEl.textContent = String(lives);
  if (player.form === "chef") {
    gameStateEl.textContent = `${status} / Chef`;
  } else if (player.form === "super") {
    gameStateEl.textContent = `${status} / Super`;
  } else {
    gameStateEl.textContent = status;
  }
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function getSolidRects() {
  return [
    ...level.grounds,
    ...level.platforms,
    ...level.pipes,
    ...blocks.filter((block) => !block.broken).map((block) => ({
      x: block.x,
      y: block.y + block.bumpOffset,
      w: block.w,
      h: block.h,
      solidType: "block",
      block
    }))
  ];
}

function setPlayerForm(form) {
  if (player.form === form) {
    return;
  }

  const prevBottom = player.y + player.h;
  player.form = form;
  player.h = form === "small" ? 58 : 68;
  player.y = prevBottom - player.h;
  syncHud();
}

function spawnFloatingCoin(x, y) {
  floatingCoins.push({
    x,
    y,
    vy: -3.2,
    life: 28
  });
}

function spawnBrickDebris(block) {
  const velocities = [
    { vx: -2.2, vy: -4.8 },
    { vx: 2.2, vy: -4.8 },
    { vx: -1.6, vy: -3.2 },
    { vx: 1.6, vy: -3.2 }
  ];

  velocities.forEach((velocity, index) => {
    debrisParticles.push({
      x: block.x + (index % 2 === 0 ? 8 : 22),
      y: block.y + (index < 2 ? 8 : 22),
      w: 10,
      h: 10,
      vx: velocity.vx,
      vy: velocity.vy,
      life: 28
    });
  });
}

function spawnPowerup(block) {
  powerups.push({
    kind: block.contains,
    x: block.x + 2,
    y: block.y - 6,
    w: 32,
    h: 32,
    vx: block.contains === "flower" ? 0 : 1.2,
    vy: 0,
    emerging: 18
  });
}

function spawnProjectile() {
  if (player.form !== "chef" || shootCooldown > 0) {
    return;
  }

  projectiles.push({
    x: player.x + (player.facing > 0 ? player.w : -10),
    y: player.y + 34,
    w: 14,
    h: 14,
    vx: 5.4 * player.facing,
    vy: -1.8,
    life: 96
  });
  shootCooldown = 18;
}

function activateBlock(block) {
  if (block.broken) {
    return;
  }
  block.bumpVelocity = -2.8;
  if (block.used || block.broken) {
    return;
  }

  block.used = true;
  if (block.contains === "coin") {
    coinsCollected += 1;
    spawnFloatingCoin(block.x + block.w / 2, block.y);
  }
  if (block.contains === "mushroom" || block.contains === "flower") {
    spawnPowerup(block);
  }
  block.broken = true;
  spawnBrickDebris(block);
  syncHud();
}

function movePlayerHorizontal(delta) {
  player.x += player.vx * delta;

  getSolidRects().forEach((rect) => {
    if (!rectsOverlap(player, rect)) {
      return;
    }

    if (player.vx > 0) {
      player.x = rect.x - player.w;
    } else if (player.vx < 0) {
      player.x = rect.x + rect.w;
    }
  });

  player.x = Math.max(0, Math.min(world.width - player.w, player.x));
}

function movePlayerVertical(delta) {
  const prevTop = player.y;
  const prevBottom = player.y + player.h;

  player.vy = Math.min(world.maxFallSpeed, player.vy + world.gravity * delta);
  player.y += player.vy * delta;
  player.onGround = false;

  getSolidRects().forEach((rect) => {
    if (!rectsOverlap(player, rect)) {
      return;
    }

    const rectTop = rect.y;
    const rectBottom = rect.y + rect.h;

    if (player.vy >= 0 && prevBottom <= rectTop + 2) {
      player.y = rectTop - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (player.vy < 0 && prevTop >= rectBottom - 2) {
      player.y = rectBottom;
      player.vy = 0;
      if (rect.solidType === "block") {
        activateBlock(rect.block);
      }
    }
  });
}

function updateRespawnPoint() {
  if (!player.onGround) {
    return;
  }

  respawnPoint = { x: player.x, y: player.y };
}

function hurtPlayer() {
  if (invulnerableFrames > 0 || status !== "Running") {
    return;
  }

  if (player.form === "chef") {
    setPlayerForm("super");
    invulnerableFrames = 120;
    player.vy = -4.6;
    return;
  }

  if (player.form === "super") {
    setPlayerForm("small");
    invulnerableFrames = 120;
    player.vy = -4.6;
    return;
  }

  lives -= 1;
  invulnerableFrames = 120;
  if (lives <= 0) {
    status = "Defeat";
  }

  player.x = respawnPoint.x;
  player.y = Math.max(120, respawnPoint.y - 14);
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  coyoteTimer = timing.coyoteFrames;
  jumpBufferTimer = 0;
  syncHud();
}

function updateBlocks(delta) {
  blocks.forEach((block) => {
    if (block.bumpOffset < 0 || block.bumpVelocity < 0) {
      block.bumpOffset += block.bumpVelocity * delta;
      block.bumpVelocity += 0.35 * delta;

      if (block.bumpOffset >= 0) {
        block.bumpOffset = 0;
        block.bumpVelocity = 0;
      }
    }
  });
}

function updateFloatingCoins(delta) {
  floatingCoins.forEach((coin) => {
    coin.y += coin.vy * delta;
    coin.vy += 0.18 * delta;
    coin.life -= delta;
  });
  floatingCoins = floatingCoins.filter((coin) => coin.life > 0);
}

function updateDebris(delta) {
  debrisParticles.forEach((piece) => {
    piece.x += piece.vx * delta;
    piece.y += piece.vy * delta;
    piece.vy += 0.24 * delta;
    piece.life -= delta;
  });
  debrisParticles = debrisParticles.filter((piece) => piece.life > 0);
}

function updatePowerups(delta) {
  powerups.forEach((item) => {
    if (item.emerging > 0) {
      item.y -= 1.2 * delta;
      item.emerging -= delta;
      return;
    }

    if (item.kind !== "flower") {
      item.vy = Math.min(world.maxFallSpeed, item.vy + world.gravity * delta);
      item.x += item.vx * delta;
    }

    getSolidRects().forEach((rect) => {
      if (!rectsOverlap(item, rect)) {
        return;
      }

      if (item.kind !== "flower" && item.vx > 0 && item.x + item.w > rect.x && item.x < rect.x) {
        item.x = rect.x - item.w;
        item.vx *= -1;
      } else if (item.kind !== "flower" && item.vx < 0 && item.x < rect.x + rect.w && item.x + item.w > rect.x + rect.w) {
        item.x = rect.x + rect.w;
        item.vx *= -1;
      }
    });

    if (item.kind !== "flower") {
      item.y += item.vy * delta;
      getSolidRects().forEach((rect) => {
        if (!rectsOverlap(item, rect)) {
          return;
        }

        if (item.vy >= 0 && item.y + item.h <= rect.y + rect.h) {
          item.y = rect.y - item.h;
          item.vy = 0;
        }
      });
    }
  });

  powerups = powerups.filter((item) => {
    if (rectsOverlap(player, item)) {
      if (item.kind === "mushroom") {
        setPlayerForm("super");
      } else if (item.kind === "flower") {
        setPlayerForm("chef");
      }
      syncHud();
      return false;
    }
    return true;
  });
}

function updateProjectiles(delta) {
  projectiles.forEach((shot) => {
    shot.x += shot.vx * delta;
    shot.y += shot.vy * delta;
    shot.vy = Math.min(4.5, shot.vy + 0.16 * delta);
    shot.life -= delta;

    getSolidRects().forEach((rect) => {
      if (!rectsOverlap(shot, rect)) {
        return;
      }
      if (shot.vy > 0 && shot.y + shot.h <= rect.y + rect.h) {
        shot.y = rect.y - shot.h;
        shot.vy = -3.1;
      } else {
        shot.life = 0;
      }
    });
  });

  enemies.forEach((enemy) => {
    projectiles.forEach((shot) => {
      if (shot.life > 0 && rectsOverlap(shot, enemy)) {
        shot.life = 0;
        enemy.defeated = true;
      }
    });
  });

  projectiles = projectiles.filter((shot) => shot.life > 0 && shot.x > -40 && shot.x < world.width + 40);
}

function updateEnemies(delta) {
  enemies.forEach((enemy) => {
    enemy.vy = Math.min(world.maxFallSpeed, (enemy.vy || 0) + world.gravity * delta);
    enemy.x += enemy.speed * enemy.dir * delta;

    getSolidRects().forEach((rect) => {
      if (!rectsOverlap(enemy, rect)) {
        return;
      }
      if (enemy.dir > 0) {
        enemy.x = rect.x - enemy.w;
      } else {
        enemy.x = rect.x + rect.w;
      }
      enemy.dir *= -1;
    });

    if (enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) {
      enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX - enemy.w, enemy.x));
      enemy.dir *= -1;
    }

    enemy.y += enemy.vy * delta;
    getSolidRects().forEach((rect) => {
      if (!rectsOverlap(enemy, rect)) {
        return;
      }
      if (enemy.vy >= 0 && enemy.y + enemy.h <= rect.y + rect.h) {
        enemy.y = rect.y - enemy.h;
        enemy.vy = 0;
      }
    });

    if (!rectsOverlap(player, enemy)) {
      return;
    }

    const stomp = player.vy > 2 && player.y + player.h - enemy.y < 18;
    if (stomp) {
      enemy.defeated = true;
      player.vy = -8;
      syncHud();
    } else {
      hurtPlayer();
    }
  });

  enemies = enemies.filter((enemy) => !enemy.defeated);
}

function updateCoins() {
  coins.forEach((coin) => {
    if (coin.collected) {
      return;
    }

    const nearX = player.x + player.w > coin.x - coin.r && player.x < coin.x + coin.r;
    const nearY = player.y + player.h > coin.y - coin.r && player.y < coin.y + coin.r;
    if (nearX && nearY) {
      coin.collected = true;
      coinsCollected += 1;
      syncHud();
    }
  });
}

function update(delta) {
  if (status !== "Running") {
    updateBlocks(delta);
    updateFloatingCoins(delta);
    updateDebris(delta);
    updateProjectiles(delta);
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

  movePlayerHorizontal(delta);
  movePlayerVertical(delta);
  updateRespawnPoint();
  updateBlocks(delta);
  updateFloatingCoins(delta);
  updateDebris(delta);
  updatePowerups(delta);
  updateProjectiles(delta);

  if (player.onGround) {
    coyoteTimer = timing.coyoteFrames;
  } else {
    coyoteTimer = Math.max(0, coyoteTimer - delta);
  }

  if (jumpBufferTimer > 0) {
    jumpBufferTimer = Math.max(0, jumpBufferTimer - delta);
  }

  if (jumpBufferTimer > 0 && coyoteTimer > 0) {
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

  updateEnemies(delta);
  updateCoins();

  if (
    player.x + player.w > level.flag.x - 10 &&
    player.y + player.h > level.flag.y &&
    coinsCollected >= 8
  ) {
    status = "Victory";
    syncHud();
  }

  if (invulnerableFrames > 0) {
    invulnerableFrames = Math.max(0, invulnerableFrames - delta);
  }
  if (shootCooldown > 0) {
    shootCooldown = Math.max(0, shootCooldown - delta);
  }

  const targetCamera = player.x - canvas.width * 0.35;
  const clampedTarget = Math.max(0, Math.min(world.width - canvas.width, targetCamera));
  cameraX += (clampedTarget - cameraX) * 0.12 * delta;
}

function drawCloud(x, y, scale = 1) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 22 * scale, y - 8 * scale, 22 * scale, 0, Math.PI * 2);
  ctx.arc(x + 52 * scale, y, 18 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawBush(bush) {
  const x = bush.x - cameraX * 0.9;
  ctx.fillStyle = "#2dbd51";
  ctx.beginPath();
  ctx.arc(x + bush.w * 0.2, bush.y + bush.h * 0.7, bush.h * 0.35, Math.PI, 0);
  ctx.arc(x + bush.w * 0.5, bush.y + bush.h * 0.55, bush.h * 0.45, Math.PI, 0);
  ctx.arc(x + bush.w * 0.8, bush.y + bush.h * 0.7, bush.h * 0.35, Math.PI, 0);
  ctx.fill();
}

function drawHill(hill) {
  const x = hill.x - cameraX * 0.45;
  ctx.fillStyle = hill.color;
  ctx.beginPath();
  ctx.moveTo(x, 446);
  ctx.quadraticCurveTo(x + hill.w * 0.5, hill.y, x + hill.w, 446);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#173c1e";
  ctx.fillRect(x + hill.w * 0.36, 362, 10, 10);
  ctx.fillRect(x + hill.w * 0.62, 350, 10, 10);
}

function drawBackground() {
  ctx.fillStyle = "#5c94fc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  level.clouds.forEach((cloud) => {
    drawCloud(cloud.x - cameraX * 0.25, cloud.y, cloud.scale);
  });

  level.hills.forEach(drawHill);
  level.bushes.forEach(drawBush);

  ctx.fillStyle = "#8edc65";
  ctx.fillRect(0, 430, canvas.width, 110);
}

function drawGround(rect) {
  const x = rect.x - cameraX;
  ctx.fillStyle = "#c87137";
  ctx.fillRect(x, rect.y, rect.w, rect.h);
  ctx.fillStyle = "#8b4b1d";
  for (let row = 0; row < rect.h; row += 18) {
    for (let col = 0; col < rect.w; col += 28) {
      ctx.fillRect(x + col + (row % 36 === 0 ? 2 : 10), rect.y + row + 6, 10, 4);
    }
  }
}

function drawPlatform(rect) {
  const x = rect.x - cameraX;
  for (let offset = 0; offset < rect.w; offset += 36) {
    ctx.fillStyle = "#bf6a28";
    ctx.fillRect(x + offset, rect.y, 36, 36);
    ctx.strokeStyle = "#7f3c12";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + offset + 1, rect.y + 1, 34, 34);
    ctx.fillStyle = "#8f4317";
    ctx.fillRect(x + offset, rect.y + 11, 36, 3);
    ctx.fillRect(x + offset, rect.y + 23, 36, 3);
    ctx.fillRect(x + offset + 11, rect.y, 3, 14);
    ctx.fillRect(x + offset + 24, rect.y + 12, 3, 14);
  }
}

function drawPipe(pipe) {
  const x = pipe.x - cameraX;
  ctx.fillStyle = "#25a544";
  ctx.fillRect(x, pipe.y, pipe.w, pipe.h);
  ctx.fillStyle = "#39c85d";
  ctx.fillRect(x + 6, pipe.y + 6, pipe.w - 12, pipe.h - 6);
  ctx.fillStyle = "#2cb74d";
  ctx.fillRect(x - 4, pipe.y, pipe.w + 8, 18);
}

function drawBlock(block) {
  if (block.broken) {
    return;
  }

  const x = block.x - cameraX;
  const y = block.y + block.bumpOffset;

  if (block.type === "question" && !block.used) {
    ctx.fillStyle = "#f0b236";
    ctx.fillRect(x, y, block.w, block.h);
    ctx.fillStyle = "#ffe27a";
    ctx.fillRect(x + 3, y + 3, block.w - 6, block.h - 6);
    ctx.fillStyle = "#a86200";
    ctx.fillRect(x + 12, y + 7, 12, 5);
    ctx.fillRect(x + 18, y + 12, 5, 5);
    ctx.fillRect(x + 12, y + 17, 5, 5);
    ctx.fillRect(x + 14, y + 25, 8, 4);
  } else if (block.type === "brick") {
    ctx.fillStyle = "#bf6a28";
    ctx.fillRect(x, y, block.w, block.h);
    ctx.strokeStyle = "#7f3c12";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, block.w - 2, block.h - 2);
    ctx.fillStyle = "#8f4317";
    ctx.fillRect(x, y + 11, block.w, 3);
    ctx.fillRect(x, y + 23, block.w, 3);
    ctx.fillRect(x + 11, y, 3, 14);
    ctx.fillRect(x + 24, y + 12, 3, 14);
  } else {
    ctx.fillStyle = "#b79b6a";
    ctx.fillRect(x, y, block.w, block.h);
  }
}

function drawPlayer() {
  const blinking = invulnerableFrames > 0 && Math.floor(invulnerableFrames / 10) % 2 === 0;
  if (blinking) {
    return;
  }

  const x = player.x - cameraX;
  const tall = player.form !== "small";
  const hatColor = player.form === "chef" ? "#ffffff" : "#db3128";
  const suitColor = player.form === "chef" ? "#fff6d6" : "#1c4fb9";
  const shirtColor = player.form === "chef" ? "#d84f2a" : "#c5322a";
  const bodyTop = player.y + 18;
  const bodyHeight = tall ? 34 : 24;
  const legY = tall ? player.y + 54 : player.y + 42;

  ctx.fillStyle = hatColor;
  ctx.fillRect(x + 6, player.y + 4, 20, 8);
  ctx.fillRect(x + 3, player.y + 10, 26, 8);
  if (player.form === "chef") {
    ctx.fillRect(x + 8, player.y, 16, 6);
  }
  ctx.fillStyle = "#ffd0ad";
  ctx.fillRect(x + 9, player.y + 14, 14, 12);
  ctx.fillStyle = shirtColor;
  ctx.fillRect(x + 5, bodyTop, 22, bodyHeight);
  ctx.fillStyle = suitColor;
  ctx.fillRect(x + 6, player.y + 30, 8, bodyHeight + 6);
  ctx.fillRect(x + 18, player.y + 30, 8, bodyHeight + 6);
  if (player.form === "chef") {
    ctx.fillStyle = "#f5d26a";
    ctx.fillRect(x + 12, player.y + 36, 8, 8);
  }
  ctx.fillStyle = "#47260f";
  ctx.fillRect(x + 6, legY, 8, tall ? 18 : 14);
  ctx.fillRect(x + 18, legY, 8, tall ? 18 : 14);
  ctx.fillStyle = "#2a1a12";
  ctx.fillRect(x + (player.facing > 0 ? 18 : 10), player.y + 18, 4, 4);
}

function drawEnemy(enemy) {
  const x = enemy.x - cameraX;

  if (enemy.kind === "koopa") {
    ctx.fillStyle = "#33b04a";
    ctx.fillRect(x + 6, enemy.y + 4, enemy.w - 12, 18);
    ctx.fillStyle = "#f8e1b1";
    ctx.fillRect(x + 8, enemy.y + 18, enemy.w - 16, 12);
    ctx.fillStyle = "#2f251e";
    ctx.fillRect(x + 4, enemy.y + 28, 10, 12);
    ctx.fillRect(x + 30, enemy.y + 28, 10, 12);
  } else if (enemy.kind === "beetle") {
    ctx.fillStyle = "#2a3158";
    ctx.fillRect(x + 4, enemy.y + 8, enemy.w - 8, enemy.h - 8);
    ctx.fillStyle = "#7380ba";
    ctx.fillRect(x + 10, enemy.y + 4, enemy.w - 20, 10);
    ctx.fillStyle = "#131829";
    ctx.fillRect(x + 5, enemy.y + 26, 8, 10);
    ctx.fillRect(x + 27, enemy.y + 26, 8, 10);
  } else {
    ctx.fillStyle = "#98623a";
    ctx.fillRect(x + 2, enemy.y + 10, enemy.w - 4, enemy.h - 10);
    ctx.fillStyle = "#d8a36d";
    ctx.fillRect(x + 6, enemy.y, enemy.w - 12, 16);
    ctx.fillStyle = "#241d19";
    ctx.fillRect(x + 8, enemy.y + 12, 8, 6);
    ctx.fillRect(x + 24, enemy.y + 12, 8, 6);
  }
}

function drawCoin(coin) {
  const x = coin.x - cameraX;
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath();
  ctx.ellipse(x, coin.y, coin.r * 0.72, coin.r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#bf7f00";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = "#fff0a5";
  ctx.beginPath();
  ctx.moveTo(x, coin.y - 7);
  ctx.lineTo(x, coin.y + 7);
  ctx.stroke();
}

function drawFloatingCoin(coin) {
  drawCoin({ x: coin.x, y: coin.y, r: 11 });
}

function drawPowerup(item) {
  const x = item.x - cameraX;
  if (item.kind === "flower") {
    ctx.fillStyle = "#2ab34f";
    ctx.fillRect(x + 13, item.y + 16, 6, 16);
    ctx.fillStyle = "#f4d93f";
    ctx.beginPath();
    ctx.arc(x + 16, item.y + 14, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff5a40";
    ctx.beginPath();
    ctx.arc(x + 16, item.y + 6, 7, 0, Math.PI * 2);
    ctx.arc(x + 8, item.y + 14, 7, 0, Math.PI * 2);
    ctx.arc(x + 24, item.y + 14, 7, 0, Math.PI * 2);
    ctx.arc(x + 16, item.y + 22, 7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#f44436";
    ctx.fillRect(x + 6, item.y + 3, 20, 10);
    ctx.fillRect(x + 2, item.y + 11, 28, 8);
    ctx.fillStyle = "#fff2d2";
    ctx.fillRect(x + 7, item.y + 14, 18, 10);
    ctx.fillStyle = "#f2efe5";
    ctx.fillRect(x + 10, item.y + 21, 4, 5);
    ctx.fillRect(x + 18, item.y + 21, 4, 5);
  }
}

function drawProjectile(shot) {
  const x = shot.x - cameraX;
  ctx.fillStyle = "#fff4a3";
  ctx.beginPath();
  ctx.arc(x + 7, shot.y + 7, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffbf2f";
  ctx.beginPath();
  ctx.arc(x + 7, shot.y + 7, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawDebris(piece) {
  const x = piece.x - cameraX;
  ctx.fillStyle = "#bf6a28";
  ctx.fillRect(x, piece.y, piece.w, piece.h);
  ctx.fillStyle = "#7f3c12";
  ctx.fillRect(x + 2, piece.y + 2, piece.w - 4, 3);
}

function drawFlag() {
  const poleX = level.flag.x - cameraX;
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(poleX, level.flag.y, 8, level.flag.poleH);
  ctx.fillStyle = "#34c759";
  ctx.beginPath();
  ctx.moveTo(poleX + 8, level.flag.y + 16);
  ctx.lineTo(poleX + 72, level.flag.y + 38);
  ctx.lineTo(poleX + 8, level.flag.y + 60);
  ctx.closePath();
  ctx.fill();
}

function drawCastle() {
  const x = 3130 - cameraX;
  ctx.fillStyle = "#b98a57";
  ctx.fillRect(x, 310, 100, 158);
  ctx.fillRect(x + 26, 270, 48, 40);
  ctx.fillStyle = "#8e6133";
  ctx.fillRect(x + 18, 414, 24, 54);
  ctx.fillRect(x + 58, 414, 24, 54);
}

function drawHazard(hazard) {
  const x = hazard.x - cameraX;
  ctx.fillStyle = "#e84937";
  for (let i = 0; i < hazard.w; i += 20) {
    ctx.beginPath();
    ctx.moveTo(x + i, hazard.y + hazard.h);
    ctx.lineTo(x + i + 10, hazard.y);
    ctx.lineTo(x + i + 20, hazard.y + hazard.h);
    ctx.closePath();
    ctx.fill();
  }
}

function drawStatusBanner() {
  if (status === "Running") {
    return;
  }

  ctx.fillStyle = "rgba(17, 29, 63, 0.78)";
  ctx.fillRect(190, 150, 580, 180);
  ctx.fillStyle = "#fff7e1";
  ctx.textAlign = "center";
  ctx.font = "bold 40px 'Trebuchet MS', sans-serif";
  ctx.fillText(status === "Victory" ? "Course Clear!" : "Game Over", canvas.width / 2, 220);
  ctx.font = "22px 'Trebuchet MS', sans-serif";
  ctx.fillText(
    status === "Victory" ? "You grabbed enough coins and reached the flag." : "Restart and try another rescue run.",
    canvas.width / 2,
    268
  );
  ctx.font = "18px 'Trebuchet MS', sans-serif";
  ctx.fillText("Hit question blocks, grab mushrooms, and collect 8 coins to win.", canvas.width / 2, 305);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  level.grounds.forEach(drawGround);
  level.platforms.forEach(drawPlatform);
  level.pipes.forEach(drawPipe);
  blocks.forEach(drawBlock);
  level.hazards.forEach(drawHazard);
  coins.filter((coin) => !coin.collected).forEach(drawCoin);
  floatingCoins.forEach(drawFloatingCoin);
  debrisParticles.forEach(drawDebris);
  powerups.forEach(drawPowerup);
  projectiles.forEach(drawProjectile);
  enemies.forEach(drawEnemy);
  drawFlag();
  drawCastle();
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
  if (event.code === "ArrowDown" && !keys.shootPressed && status === "Running") {
    keys.shootPressed = true;
    spawnProjectile();
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
  if (event.code === "ArrowDown") {
    keys.shootPressed = false;
  }
  if (event.code === "ArrowUp") {
    keys.jumpPressed = false;
    if (player.vy < -4.5) {
      player.vy *= 0.58;
    }
  }
});

restartButton.addEventListener("click", resetGame);

resetGame();
requestAnimationFrame(loop);
