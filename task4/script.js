let secretNumber = "";
let attempts = [];
let nextId = 1;
let gameFinished = false;

const form = document.querySelector("#guess-form");
const input = document.querySelector("#guess-input");
const checkButton = form.querySelector("button");
const message = document.querySelector("#message");
const attemptCount = document.querySelector("#attempt-count");
const historyList = document.querySelector("#history");
const emptyHistory = document.querySelector("#empty-history");
const newGameButton = document.querySelector("#new-game-button");

function generateNumber() {
  const digits = [];

  while (digits.length < 4) {
    const digit = Math.floor(Math.random() * 10);

    if (!digits.includes(digit)) digits.push(digit);
  }

  return digits.join("");
}

function validateGuess(guess) {
  if (!/^\d{4}$/.test(guess)) {
    return "Введите ровно 4 цифры.";
  }

  if (new Set(guess).size !== 4) {
    return "Все цифры должны быть разными.";
  }

  return "";
}

function countBullsAndCows(secret, guess) {
  let bulls = 0;
  let cows = 0;

  for (let i = 0; i < guess.length; i += 1) {
    if (guess[i] === secret[i]) {
      bulls += 1;
    } else if (secret.includes(guess[i])) {
      cows += 1;
    }
  }

  return { bulls, cows };
}

function getWord(number, one, few, many) {
  if (number === 1) return one;
  if (number >= 2 && number <= 4) return few;
  return many;
}

function showMessage(text, isSuccess = false) {
  message.textContent = text;
  message.classList.toggle("success", isSuccess);
}

function clearInput() {
  input.value = "";
  input.focus();
}

function setControlsDisabled(disabled) {
  input.disabled = disabled;
  checkButton.disabled = disabled;
}

function renderHistory() {
  historyList.replaceChildren();

  attempts.forEach((attempt) => {
    const item = document.createElement("li");
    item.value = attempt.id;
    const bullsWord = getWord(attempt.bulls, "бык", "быка", "быков");
    const cowsWord = getWord(attempt.cows, "корова", "коровы", "коров");
    item.textContent = `${attempt.guess} → ${attempt.bulls} ${bullsWord}, ${attempt.cows} ${cowsWord}`;
    historyList.append(item);
  });

  attemptCount.textContent = attempts.length;
  emptyHistory.hidden = attempts.length > 0;
}

function startNewGame() {
  secretNumber = generateNumber();
  attempts = [];
  nextId = 1;
  gameFinished = false;
  setControlsDisabled(false);
  showMessage("");
  renderHistory();
  clearInput();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (gameFinished) return;

  const guess = input.value;
  const error = validateGuess(guess);

  if (error) {
    showMessage(error);
    return;
  }

  const result = countBullsAndCows(secretNumber, guess);
  attempts.unshift({
    id: nextId++,
    guess,
    bulls: result.bulls,
    cows: result.cows
  });
  renderHistory();

  if (result.bulls === 4) {
    gameFinished = true;
    setControlsDisabled(true);
    showMessage(`Победа! Угадано за ${attempts.length} попыток.`, true);
    return;
  }

  showMessage("Попробуйте ещё раз.");
  clearInput();
});

newGameButton.addEventListener("click", startNewGame);

startNewGame();
