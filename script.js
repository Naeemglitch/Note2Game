const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let bird = { x: 50, y: 300, width: 30, height: 30, velocity: 0 };
let gravity = 0.6;
let jump = -10;
let obstacles = [];
let frame = 0;
let gameOver = false;

let notes = []; // your raw notes
let questions = []; // AI-generated questions
let currentQuestion = { question: "Vad är 2 + 2?", answer: "4" };

let currentGame = null;

// -------------------- Notes & AI-like question generator --------------------
function submitNotes() {
  const input = document.getElementById("notesInput").value;
  const lines = input.split("\n");
  notes = lines.filter(line => line.trim() !== "");
  questions = lines.map(line => generateQuestion(line));
  alert("Anteckningar sparade och frågor skapade!");
}

function generateQuestion(note) {
  // Simple AI-like logic: split at "=" or "is" or ":" to create a question/answer pair
  let q = note;
  let a = note;
  if(note.includes(":")) {
    const parts = note.split(":");
    q = `Vad är ${parts[0].trim()}?`;
    a = parts[1].trim();
  } else if(note.toLowerCase().includes("is")) {
    const parts = note.split(/is/i);
    q = `Vad är ${parts[0].trim()}?`;
    a = parts[1].trim();
  } else if(note.includes("=")) {
    const parts = note.split("=");
    q = `Vad är ${parts[0].trim()}?`;
    a = parts[1].trim();
  }
  return { question: q, answer: a };
}

function getRandomQuestion() {
  if(questions.length > 0) {
    const index = Math.floor(Math.random() * questions.length);
    return questions[index];
  }
  return { question: "Vad är 2 + 2?", answer: "4" };
}

// -------------------- Game selection --------------------
function startGame(game) {
  currentGame = game;
  bird.y = 300;
  bird.velocity = 0;
  obstacles = [];
  frame = 0;
  gameOver = false;
  document.getElementById("quiz").classList.add("hidden");
  canvas.style.display = "block";
}

// -------------------- Flappy / Geometry Dash logic --------------------
function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawObstacles() {
  ctx.fillStyle = "green";
  obstacles.forEach(ob => {
    ctx.fillRect(ob.x, 0, ob.width, ob.top);
    ctx.fillRect(ob.x, ob.bottomY, ob.width, canvas.height - ob.bottomY);
  });
}

function updateObstacles() {
  if(frame % 100 === 0) {
    let top = Math.random() * 200 + 50;
    let gap = currentGame === "flappy" ? 150 : 100;
    obstacles.push({x: canvas.width, width: 50, top: top, bottomY: top + gap});
  }

  obstacles.forEach(ob => { ob.x -= 2; });
  obstacles = obstacles.filter(ob => ob.x + ob.width > 0);
}

function checkCollision() {
  for(let ob of obstacles) {
    if(
      bird.x < ob.x + ob.width &&
      bird.x + bird.width > ob.x &&
      (bird.y < ob.top || bird.y + bird.height > ob.bottomY)
    ) {
      triggerQuiz();
    }
  }
  if(bird.y + bird.height > canvas.height || bird.y < 0) {
    triggerQuiz();
  }
}

function triggerQuiz() {
  if(!gameOver) {
    gameOver = true;
    currentQuestion = getRandomQuestion();
    document.getElementById("question").textContent = currentQuestion.question;
    document.getElementById("quiz").classList.remove("hidden");
  }
}

function checkAnswer() {
  const answer = document.getElementById("answer").value;
  const result = document.getElementById("result");
  if(answer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()) {
    result.textContent = "Rätt! 🎉 Spela igen!";
    result.style.color = "green";
    resetGame();
  } else {
    result.textContent = "Fel! ❌ Försök igen";
    result.style.color = "red";
  }
}

function resetGame() {
  bird.y = 300;
  bird.velocity = 0;
  obstacles = [];
  frame = 0;
  gameOver = false;
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("answer").value = "";
}

function gameLoop() {
  ctx.clearRect(0,0,canvas.width, canvas.height);

  if(!gameOver && currentGame) {
    if(currentGame === "flappy") {
      bird.velocity += gravity;
      bird.y += bird.velocity;
    } else if(currentGame === "geometry") {
      bird.y = 500; // fixed height for Geometry Dash style
    }

    updateObstacles();
    drawBird();
    drawObstacles();
    checkCollision();
    frame++;
  }

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if(e.code === "Space" && currentGame === "flappy") bird.velocity = jump;
  if(e.code === "Space" && currentGame === "geometry") bird.y -= 150; // jump for Geometry Dash
});

gameLoop();
