let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

let ballRadius = 9;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

let paddleHeight = 12;
let paddleWidth = 72;
let paddleX = (canvas.width - paddleWidth) / 2;

let rowCount = 5;
let columnCount = 9;
let brickWidth = 54;
let brickHeight = 18;
let brickPadding = 12;
let topOffset = 40;
let leftOffset = 33;
let score = 0;

let player = "Player";
let bestScore = localStorage.getItem("bestScore") || 0;

const hitSound = document.getElementById("hitSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");

function setupAudio(audio) {
  try {
    audio.volume = 0.6;
    audio.load();
  } catch (e) {
    console.warn("Audio yuklanmadi:", e);
  }
}
setupAudio(hitSound);
setupAudio(winSound);
setupAudio(loseSound);

let bricks = [];
function initBricks() {
  bricks = [];
  for (let c = 0; c < columnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}
initBricks();

document.addEventListener("mousemove", (e) => {
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
});

canvas.addEventListener("touchmove", (e) => {
  let touchX = e.touches[0].clientX - canvas.offsetLeft;
  if (touchX > 0 && touchX < canvas.width) {
    paddleX = touchX - paddleWidth / 2;
  }
});

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#333";
  ctx.fill();
  ctx.closePath();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#333";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < columnCount; c++) {
    for (let r = 0; r < rowCount; r++) {
      if (bricks[c][r].status === 1) {
        let brickX = c * (brickWidth + brickPadding) + leftOffset;
        let brickY = r * (brickHeight + brickPadding) + topOffset;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#444";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function trackScore() {
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#333";
  ctx.fillText(`${player} — Score: ${score} | Best: ${bestScore}`, 10, 24);
}

function hitDetection() {
  for (let c = 0; c < columnCount; c++) {
    for (let r = 0; r < rowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          try {
            hitSound.currentTime = 0;
            hitSound.play();
          } catch {}
          if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestScore", bestScore);
          }
          if (score === rowCount * columnCount) {
            try {
              winSound.currentTime = 0;
              winSound.play();
            } catch {}
            setTimeout(() => {
              alert(`${player}, Siz yutdingiz!`);
              resetGame();
            }, 100);
          }
        }
      }
    }
  }
}

function resetGame() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;
  paddleX = (canvas.width - paddleWidth) / 2;
  score = 0;
  initBricks();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  trackScore();
  drawBricks();
  drawBall();
  drawPaddle();
  hitDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      try {
        loseSound.currentTime = 0;
        loseSound.play();
      } catch {}
      setTimeout(() => {
        alert(`${player}, O'yin tugadi!`);
        resetGame();
        draw();
      }, 100);
      return;
    }
  }

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

draw();
