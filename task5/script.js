let sequence = [];
let playerIndex = 0;
let isShowing = false;
let gameActive = false;
let timerId = null;

const sectors = document.querySelectorAll(".sector");
const startButton = document.querySelector("#start-button");
const level = document.querySelector("#level");
const message = document.querySelector("#message");
const sounds = [
  new Audio("sounds/green.mp3"),
  new Audio("sounds/red.mp3"),
  new Audio("sounds/yellow.mp3"),
  new Audio("sounds/blue.mp3")
];

sounds.forEach((sound) => {
  sound.preload = "auto";
  sound.volume = 0.4;
});

function setSectorsDisabled(disabled) {
  sectors.forEach((sector) => {
    sector.disabled = disabled;
  });
}

function clearActiveSectors() {
  sectors.forEach((sector) => {
    sector.classList.remove("active");
  });
}

function stopTimer() {
  clearTimeout(timerId);
  timerId = null;
}

function playSound(index) {
  const sound = sounds[index];
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function showSequence(index) {
  if (!gameActive) return;

  if (index === sequence.length) {
    timerId = setTimeout(() => {
      if (!gameActive) return;
      isShowing = false;
      setSectorsDisabled(false);
      message.textContent = "Повторите последовательность.";
    }, 300);
    return;
  }

  const sector = sectors[sequence[index]];
  sector.classList.add("active");
  playSound(sequence[index]);

  timerId = setTimeout(() => {
    sector.classList.remove("active");

    timerId = setTimeout(() => {
      showSequence(index + 1);
    }, 250);
  }, 500);
}

function startRound() {
  if (!gameActive) return;

  sequence.push(Math.floor(Math.random() * 4));
  playerIndex = 0;
  isShowing = true;
  level.textContent = sequence.length;
  message.textContent = "Запоминайте...";
  setSectorsDisabled(true);
  showSequence(0);
}

function endGame() {
  gameActive = false;
  isShowing = false;
  stopTimer();
  clearActiveSectors();
  setSectorsDisabled(true);
  message.textContent = `Ошибка. Вы дошли до уровня ${sequence.length}.`;
}

function startGame() {
  stopTimer();
  clearActiveSectors();
  sequence = [];
  playerIndex = 0;
  isShowing = false;
  gameActive = true;
  level.textContent = "0";
  startRound();
}

function handleSectorClick(event) {
  if (!gameActive || isShowing) return;

  const selectedColor = Number(event.currentTarget.dataset.color);
  playSound(selectedColor);

  if (selectedColor !== sequence[playerIndex]) {
    endGame();
    return;
  }

  playerIndex += 1;

  if (playerIndex === sequence.length) {
    isShowing = true;
    setSectorsDisabled(true);
    message.textContent = "Верно! Следующий уровень...";
    timerId = setTimeout(startRound, 700);
  }
}

sectors.forEach((sector) => {
  sector.addEventListener("click", handleSectorClick);
});

startButton.addEventListener("click", startGame);
