const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const welcomeScreen = document.getElementById('welcome-screen');
const gameSection = document.getElementById('game-section');
const modeInfo = document.getElementById('mode-info');
const backBtn = document.getElementById('back-home');

let currentPlayer = 'X';
let gameActive = true;
let board = ["", "", "", "", "", "", "", "", ""];
let vsAI = false;

const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Mode selector
function startGame(mode) {
  vsAI = (mode === 'ai');
  welcomeScreen.style.display = 'none';
  gameSection.style.display = 'block';
  modeInfo.textContent = vsAI ? "You are playing against AI. Good luck!" : "You are playing against another player!";
  restartGame();
}

// Click handler
function handleClick(e) {
  const index = e.target.getAttribute('data-index');

  if (!gameActive || board[index] !== "") return;

  makeMove(index, currentPlayer);
  updateGameStatus();

  // AI turn after human move
  if (vsAI && gameActive && currentPlayer === 'O') {
    setTimeout(aiMove, 500); // Delay for user experience
  }
}

// Make a move
function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
}

// Check winner
function checkWinner(player) {
  return winConditions.some(condition =>
    condition.every(index => board[index] === player)
  );
}

// ✅ Early draw logic: No possible win for anyone
function isEarlyDraw() {
  return winConditions.every(condition => {
    const line = condition.map(index => board[index]);
    return line.includes('X') && line.includes('O');
  });
}

// Game status updates
function updateGameStatus() {
  if (checkWinner(currentPlayer)) {
    statusText.textContent = `Player ${currentPlayer} wins!`;
    gameActive = false;
    return;
  }

  // ✅ Check for early draw (no win line left)
  if (isEarlyDraw()) {
    statusText.textContent = "It's a draw!";
    gameActive = false;
    return;
  }

  // Traditional draw (all filled)
  if (board.every(cell => cell !== "")) {
    statusText.textContent = "It's a draw!";
    gameActive = false;
    return;
  }

  // Switch turn
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

// SMART AI LOGIC
function aiMove() {
  if (!gameActive) return;

  // Avoid extra AI move if game ended
  if (checkWinner('X') || checkWinner('O') || isEarlyDraw() || board.every(c => c !== "")) return;

  // 1. Try to win
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = currentPlayer;
      if (checkWinner(currentPlayer)) {
        makeMove(i, currentPlayer);
        updateGameStatus();
        return;
      }
      board[i] = "";
    }
  }

  // 2. Try to block the opponent
  const opponent = currentPlayer === 'X' ? 'O' : 'X';
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = opponent;
      if (checkWinner(opponent)) {
        board[i] = currentPlayer;
        makeMove(i, currentPlayer);
        updateGameStatus();
        return;
      }
      board[i] = "";
    }
  }

  // 3. Take center if possible
  if (board[4] === "") {
    makeMove(4, currentPlayer);
    updateGameStatus();
    return;
  }

  // 4. Pick random
  const emptyIndexes = board.map((val, idx) => val === "" ? idx : null).filter(idx => idx !== null);
  const aiIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  makeMove(aiIndex, currentPlayer);
  updateGameStatus();
}

// Reset everything
function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  cells.forEach(cell => cell.textContent = "");
  currentPlayer = 'X';
  gameActive = true;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

// Setup event listeners
cells.forEach(cell => cell.addEventListener('click', handleClick));
restartBtn.addEventListener('click', restartGame);
backBtn.addEventListener('click', () => {
  gameSection.style.display = 'none';
  welcomeScreen.style.display = 'flex';
  restartGame();
});
