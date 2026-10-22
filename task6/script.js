// Model: хранит и изменяет состояние игры.
  class SnakeModel {
    constructor(gridSize) {
      this.gridSize = gridSize;
      this.reset();
    }

    reset() {
      this.snake = [
        { x: 3, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 0 }
      ];
      this.direction = { x: 1, y: 0 };
      this.nextDirection = { x: 1, y: 0 };
      this.score = 0;
      this.gameOver = false;
      this.apple = this.spawnApple();
    }

    spawnApple() {
      const freeCells = [];

      for (let y = 0; y < this.gridSize; y += 1) {
        for (let x = 0; x < this.gridSize; x += 1) {
          const isSnakeCell = this.snake.some((part) => part.x === x && part.y === y);

          if (!isSnakeCell) {
            freeCells.push({ x, y });
          }
        }
      }

      if (freeCells.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * freeCells.length);
      return freeCells[randomIndex];
    }

    changeDirection(newDirection) {
      const isOpposite =
        newDirection.x === -this.direction.x &&
        newDirection.y === -this.direction.y;

      if (!isOpposite) {
        this.nextDirection = newDirection;
      }
    }



    checkCollision(head, ateApple) {
      const hitWall =
        head.x < 0 ||
        head.x >= this.gridSize ||
        head.y < 0 ||
        head.y >= this.gridSize;

      const body = ateApple ? this.snake : this.snake.slice(0, -1);
      const hitSnake = body.some((part) => part.x === head.x && part.y === head.y);

      return hitSnake;
    }

    moveSnake() {
      this.direction = this.nextDirection;

      const head = {
        x: (this.snake[0].x + this.direction.x + this.gridSize) % this.gridSize,
        y: (this.snake[0].y + this.direction.y + this.gridSize) % this.gridSize
      };
      const ateApple = head.x === this.apple.x && head.y === this.apple.y;

      if (this.checkCollision(head, ateApple)) {
        this.gameOver = true;
        return;
      }

      this.snake.unshift(head);

      if (ateApple) {
        this.score += 1;
        this.apple = this.spawnApple();

        if (this.apple === null) {
          this.gameOver = true;
        }
      } else {
        this.snake.pop();
      }
    }

    update() {
      if (!this.gameOver) {
        this.moveSnake();
      }
    }
  }

  // View: только отображает состояние модели.
  class SnakeView {
    constructor(canvas, scoreElement, messageElement, startButton) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.scoreElement = scoreElement;
      this.messageElement = messageElement;
      this.startButton = startButton;
      this.cellSize = 20;
    }

    drawGrid() {
      this.context.strokeStyle = "#dce2d2";
      this.context.lineWidth = 1;

      for (let position = 0; position <= this.canvas.width; position += this.cellSize) {
        this.context.beginPath();
        this.context.moveTo(position, 0);
        this.context.lineTo(position, this.canvas.height);
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(0, position);
        this.context.lineTo(this.canvas.width, position);
        this.context.stroke();
      }
    }

    drawSnake(snake) {
      snake.forEach((part, index) => {
        this.context.fillStyle = index === 0 ? "#526b4b" : "#76956f";
        this.context.fillRect(
          part.x * this.cellSize + 2,
          part.y * this.cellSize + 2,
          this.cellSize - 4,
          this.cellSize - 4
        );
      });
    }

    drawApple(apple) {
      if (apple === null) return;

      const centerX = apple.x * this.cellSize + this.cellSize / 2;
      const centerY = apple.y * this.cellSize + this.cellSize / 2;

      this.context.fillStyle = "#c13f3f";
      this.context.beginPath();
      this.context.arc(centerX, centerY, this.cellSize / 2 - 3, 0, Math.PI * 2);
      this.context.fill();
    }

    draw(model) {
      this.context.fillStyle = "#eef1e7";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawGrid();
      this.drawApple(model.apple);
      this.drawSnake(model.snake);
      this.scoreElement.textContent = model.score;
    }

    showGameStarted() {
      this.messageElement.textContent = "Игра идёт.";
      this.startButton.textContent = "Начать заново";
    }

    showGameOver(score) {
      this.messageElement.textContent = `Игра окончена. Итоговый счёт: ${score}.`;
      this.startButton.textContent = "Начать заново";
    }
  }

  // Controller: обрабатывает ввод и управляет игровым циклом.
  class SnakeController {
    constructor(model, view) {
      this.model = model;
      this.view = view;
      this.moveInterval = 150;
      this.lastMoveTime = 0;
      this.animationId = null;
      this.isRunning = false;

      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.gameLoop = this.gameLoop.bind(this);
      this.startGame = this.startGame.bind(this);

      document.addEventListener("keydown", this.handleKeyDown);
      this.view.startButton.addEventListener("click", this.startGame);
      this.view.draw(this.model);
    }

    startGame() {
      cancelAnimationFrame(this.animationId);
      this.model.reset();
      this.lastMoveTime = 0;
      this.isRunning = true;
      this.view.showGameStarted();
      this.view.draw(this.model);
      this.animationId = requestAnimationFrame(this.gameLoop);
    }

    handleKeyDown(event) {
      const directions = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };
      const newDirection = directions[event.key];

      if (!newDirection || !this.isRunning) return;

      event.preventDefault();
      this.model.changeDirection(newDirection);
    }

    gameLoop(currentTime) {
      if (!this.isRunning) return;

      if (this.lastMoveTime === 0) {
        this.lastMoveTime = currentTime;
      }

      if (currentTime - this.lastMoveTime >= this.moveInterval) {
        this.model.update();
        this.lastMoveTime = currentTime;
        this.view.draw(this.model);

        if (this.model.gameOver) {
          this.isRunning = false;
          this.view.showGameOver(this.model.score);
          return;
        }
      }

      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  }

  const model = new SnakeModel(10);
  const view = new SnakeView(
    document.querySelector("#game-canvas"),
    document.querySelector("#score"),
    document.querySelector("#message"),
    document.querySelector("#start-button")
  );

  new SnakeController(model, view);
