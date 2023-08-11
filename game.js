
class Game {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.emptyCells = rows * cols;
    this.isGameOver = false;
    this.board = new Board(rows, cols);
    this.board.board.addEventListener("click", this.handleMove.bind(this));
    this.players = [new Player("Красный", "red"), new Player("Жёлтый", "yellow")];
    this.currentPlayer = this.players[0];
    this.chip = new Chip()
    this.chip.chip.classList.add(this.currentPlayer.color)
    this.chip.chip.classList.add("hover-chip")
    this.board.board.appendChild(this.chip.chip)
    this.moves = document.getElementById("moves");
    this.moves.classList.add(this.currentPlayer.color)
    this.newGameBtn = document.getElementById("newGameBtn");
    this.newGameBtn.addEventListener("click", this.startNewGame.bind(this));
    this.startNewGame();
  }

  startNewGame() {
    this.currentPlayer = this.players[0];
    this.emptyCells = this.rows * this.cols;
    this.isGameOver = false;
    this.board.clearBoard();
    this.board.board.classList.remove("boom");
    document.getElementById("result").textContent = "";
  }

  handleMove(event) {
    if (this.isGameOver) {
      return;
    }

    let col = event.target.dataset.col;
    if (col) {
      let success = this.board.placeChip(this.currentPlayer.color, col);
      if (success) {
        this.emptyCells--;
        let winCheckResult = this.checkForWin()
        if (winCheckResult.win) {
          this.isGameOver = true;
          this.board.highlightWinningCombination(winCheckResult.combinations);
          document.getElementById("result").textContent = `${this.currentPlayer.name} игрок победил!`;
          this.board.board.classList.add("boom")
          return;
        }

        if (this.emptyCells === 0) {
          this.isGameOver = true;
          document.getElementById("result").textContent = "Ничья!";
          return;
        }

        this.togglePlayer();
      }
    }
  }

  togglePlayer() {
    if (this.currentPlayer.color === this.players[0].color) {
      this.currentPlayer = this.players[1]
      this.moves.classList.replace(this.players[0].color, this.players[1].color)
      this.chip.chip.classList.replace(this.players[0].color, this.players[1].color)
    } else {
      this.currentPlayer = this.players[0]
      this.moves.classList.replace(this.players[1].color, this.players[0].color)
      this.chip.chip.classList.replace(this.players[1].color, this.players[0].color)
    }
  }

  checkForWin() {
    let combinations = this.board.getWinningCombinations();
    let winCombinations = []
    for (let combination of combinations) {
      let [row1, col1] = combination[0];
      let [row2, col2] = combination[1];
      let [row3, col3] = combination[2];
      let [row4, col4] = combination[3];

      if (
        this.board.getCellValue(row1, col1) === this.currentPlayer.color &&
        this.board.getCellValue(row2, col2) === this.currentPlayer.color &&
        this.board.getCellValue(row3, col3) === this.currentPlayer.color &&
        this.board.getCellValue(row4, col4) === this.currentPlayer.color
      ) {
        winCombinations.push(combination)
      }
    }

    if (winCombinations.length > 0) {
      return {
        win: true,
        combinations: winCombinations
      }
    }

    return {
      win: false,
      combinations: winCombinations
    }
  }
}
class Board {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.board = document.getElementById("board");
    this.board.classList.add("board");
    this.cells = [];
    this.createCells();
  }

  createCells() {
    for (let i = 0; i < this.rows; i++) {
      let row = document.createElement("div");
      row.className = "row";
      let rowCells = [];
      for (let j = 0; j < this.cols; j++) {
        let cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = String(i);
        cell.dataset.col = String(j);
        cell.classList.add("empty")
        row.appendChild(cell);
        rowCells.push(cell);
        cell.onmouseover = function () {
          document.querySelector(".hover-chip").style.left = `${j * 100}px`
        }
      }

      this.cells.push(rowCells);
      this.board.appendChild(row);
    }
  }

  clearBoard() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let cell = this.cells[i][j];
        let move = document.getElementById("moves")
        cell.classList.remove("red", "yellow", "win");
        move.classList.replace("yellow", "red")
        if (!cell.classList.contains("empty")) {
          cell.classList.add("empty")
        }
      }
    }
  }

  placeChip(color, col) {
    for (let i = this.rows - 1; i >= 0; i--) {
      let cell = this.cells[i][col];
      if (!cell.classList.contains("red") && !cell.classList.contains("yellow")) {
        cell.classList.replace("empty", color);

        return true;
      }
    }

    return false;
  }

  getCellValue(row, col) {
    if (this.cells[row][col].classList.contains("red")) {
      return "red"
    }
    if (this.cells[row][col].classList.contains("yellow")) {
      return "yellow"
    }
    return ""
  }

  getWinningCombinations() {
    let combinations = [];

    // Горизонтальные комбинации
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.cols - 3; j++) {
            combinations.push([
              [i, j],
              [i, j + 1],
              [i, j + 2],
              [i, j + 3],
            ]);
          }
        }

        // Вертикальные комбинации
        for (let i = 0; i < this.rows - 3; i++) {
          for (let j = 0; j < this.cols; j++) {
            combinations.push([
              [i, j],
              [i + 1, j],
              [i + 2, j],
              [i + 3, j],
            ]);
          }
        }

        // Диагональные комбинации (слева-направо)
        for (let i = 0; i < this.rows - 3; i++) {
          for (let j = 0; j < this.cols - 3; j++) {
            combinations.push([
              [i, j],
              [i + 1, j + 1],
              [i + 2, j + 2],
              [i + 3, j + 3],
            ]);
          }
        }
      // Диагональные комбинации (справа-налево)
      for (let i = 0; i < this.rows - 3; i++) {
          for (let j = this.cols - 1; j >= 3; j--) {
              combinations.push([
                  [i, j],
                  [i + 1, j - 1],
                  [i + 2, j - 2],
                  [i + 3, j - 3],
              ]);
          }
      }

      return combinations;
  }

    highlightWinningCombination(combinations) {
        for (let combination of combinations) {
            let [row1, col1] = combination[0];
            let [row2, col2] = combination[1];
            let [row3, col3] = combination[2];
            let [row4, col4] = combination[3];
            this.cells[row1][col1].classList.add("win");
            this.cells[row2][col2].classList.add("win");
            this.cells[row3][col3].classList.add("win");
            this.cells[row4][col4].classList.add("win");
        }
    }
}

class Chip {
    constructor(color) {
      this.color = color;
      this.chip = document.createElement("div")
      this.chip.classList.add("chip")
    }
}

class Player {
    constructor(name, color) {
        this.name = name
        this.color = color;
    }
    
}
let game = new Game(6, 7);