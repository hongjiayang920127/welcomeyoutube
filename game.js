const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = {
  left: false,
  right: false,
  jump: false,
};

const world = {
  gravity: 0.8,
  friction: 0.82,
  groundY: 430,
};

function createLevel() {
  return {
    score: 0,
    gameState: "playing",
    cameraX: 0,
    player: {
      x: 80,
      y: 320,
      w: 32,
      h: 40,
      vx: 0,
      vy: 0,
      speed: 0.9,
      jumpPower: -15,
      onGround: false,
    },
    platforms: [
      { x: 0, y: world.groundY, w: 1900, h: 120, kind: "ground" },
      { x: 250, y: 340, w: 140, h: 20, kind: "brick" },
      { x: 470, y: 300, w: 180, h: 20, kind: "brick" },
      { x: 760, y: 260, w: 110, h: 20, kind: "brick" },
      { x: 980, y: 310, w: 160, h: 20, kind: "brick" },
      { x: 1240, y: 270, w: 120, h: 20, kind: "brick" },
      { x: 1500, y: 220, w: 130, h: 20, kind: "brick" },
    ],
    coins: [
      { x: 280, y: 300, r: 12, taken: false },
      { x: 515, y: 255, r: 12, taken: false },
      { x: 600, y: 255, r: 12, taken: false },
      { x: 800, y: 215, r: 12, taken: false },
      { x: 1020, y: 265, r: 12, taken: false },
      { x: 1300, y: 225, r: 12, taken: false },
      { x: 1540, y: 175, r: 12, taken: false },
    ],
    enemies: [
      { x: 540, y: 272, w: 30, h: 28, minX: 500, maxX: 640, vx: 1.2, alive: true },
      { x: 1080, y: 282, w: 30, h: 28, minX: 1010, maxX: 1130, vx: -1.1, alive: true },
    ],
    flag: { x: 1760, y: 250, w: 16, h: 180 },
  };
}

let level = createLevel();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function intersects(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function update() {
  if (level.gameState !== "playing") return;

  const p = level.player;

  if (keys.left) p.vx -= p.speed;
  if (keys.right) p.vx += p.speed;
  p.vx *= world.friction;
  p.vx = clamp(p.vx, -7, 7);

  if (keys.jump && p.onGround) {
    p.vy = p.jumpPower;
    p.onGround = false;
  }

  p.vy += world.gravity;
  p.x += p.vx;
  p.y += p.vy;

  p.onGround = false;
  for (const plat of level.platforms) {
    if (!intersects(p, plat)) continue;

    const prevBottom = p.y + p.h - p.vy;
    const prevTop = p.y - p.vy;

    if (prevBottom <= plat.y + 6 && p.vy >= 0) {
      p.y = plat.y - p.h;
      p.vy = 0;
      p.onGround = true;
    } else if (prevTop >= plat.y + plat.h - 4 && p.vy < 0) {
      p.y = plat.y + plat.h;
      p.vy = 0;
    } else if (p.vx > 0) {
      p.x = plat.x - p.w;
      p.vx = 0;
    } else if (p.vx < 0) {
      p.x = plat.x + plat.w;
      p.vx = 0;
    }
  }

  for (const coin of level.coins) {
    if (coin.taken) continue;
    const near =
      p.x + p.w > coin.x - coin.r &&
      p.x < coin.x + coin.r &&
      p.y + p.h > coin.y - coin.r &&
      p.y < coin.y + coin.r;
    if (near) {
      coin.taken = true;
      level.score += 100;
    }
  }

  for (const enemy of level.enemies) {
    if (!enemy.alive) continue;
    enemy.x += enemy.vx;
    if (enemy.x < enemy.minX || enemy.x + enemy.w > enemy.maxX) {
      enemy.vx *= -1;
    }

    if (intersects(p, enemy)) {
      const playerBottom = p.y + p.h;
      const enemyTop = enemy.y;
      const stomp = p.vy > 1 && playerBottom - enemyTop < 20;
      if (stomp) {
        enemy.alive = false;
        p.vy = -10;
        level.score += 200;
      } else {
        level.gameState = "lost";
      }
    }
  }

  if (intersects(p, level.flag)) {
    level.gameState = "won";
    level.score += 500;
  }

  if (p.y > canvas.height + 120) {
    level.gameState = "lost";
  }

  const cameraTarget = p.x - 220;
  level.cameraX = clamp(cameraTarget, 0, 1000);
}

function drawBackground() {
  ctx.fillStyle = "#87d8ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffffcc";
  for (let i = 0; i < 6; i++) {
    const x = ((i * 220 - level.cameraX * 0.2) % 1300) - 100;
    ctx.beginPath();
    ctx.ellipse(x + 90, 90 + (i % 2) * 35, 60, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 135, 85 + (i % 2) * 35, 45, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 55, 84 + (i % 2) * 35, 40, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWorld() {
  const offset = level.cameraX;

  for (const plat of level.platforms) {
    ctx.fillStyle = plat.kind === "ground" ? "#ca8f4f" : "#ad4f24";
    ctx.fillRect(plat.x - offset, plat.y, plat.w, plat.h);

    if (plat.kind === "brick") {
      ctx.strokeStyle = "#7d2f14";
      for (let x = plat.x - offset; x < plat.x - offset + plat.w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, plat.y);
        ctx.lineTo(x, plat.y + plat.h);
        ctx.stroke();
      }
    }
  }

  for (const coin of level.coins) {
    if (coin.taken) continue;
    ctx.fillStyle = "#ffd447";
    ctx.beginPath();
    ctx.arc(coin.x - offset, coin.y, coin.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d19e00";
    ctx.stroke();
  }

  for (const enemy of level.enemies) {
    if (!enemy.alive) continue;
    ctx.fillStyle = "#4b7d2a";
    ctx.fillRect(enemy.x - offset, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(enemy.x + 4 - offset, enemy.y + 6, 6, 6);
    ctx.fillRect(enemy.x + 18 - offset, enemy.y + 6, 6, 6);
  }

  const flag = level.flag;
  ctx.fillStyle = "#444";
  ctx.fillRect(flag.x - offset, flag.y, flag.w, flag.h);
  ctx.fillStyle = "#00d46a";
  ctx.fillRect(flag.x + flag.w - offset, flag.y + 8, 44, 28);

  const p = level.player;
  ctx.fillStyle = "#ff3b3b";
  ctx.fillRect(p.x - offset, p.y, p.w, p.h);
  ctx.fillStyle = "#1f2a44";
  ctx.fillRect(p.x + 5 - offset, p.y + 8, 6, 6);
  ctx.fillRect(p.x + 20 - offset, p.y + 8, 6, 6);
}

function drawHUD() {
  ctx.fillStyle = "#1f2a44";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText(`Score: ${level.score}`, 24, 34);

  if (level.gameState === "won" || level.gameState === "lost") {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 56px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(level.gameState === "won" ? "YOU WIN!" : "GAME OVER", canvas.width / 2, 220);
    ctx.font = "24px sans-serif";
    ctx.fillText("按 R 重新开始", canvas.width / 2, 270);
    ctx.textAlign = "left";
  }
}

function loop() {
  update();
  drawBackground();
  drawWorld();
  drawHUD();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === "ArrowUp" || e.key === " ") keys.jump = true;
  if (e.key.toLowerCase() === "r") level = createLevel();
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === "ArrowUp" || e.key === " ") keys.jump = false;
});

loop();
