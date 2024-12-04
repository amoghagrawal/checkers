class CheckersGame {
    constructor() {
      this.board = [];
      this.selectedPiece = null;
      this.currentPlayer = 'red';
      this.possibleMoves = [];
      this.initializeBoard();
      this.renderBoard();
      this.gameOver = false;
    }
  
    initializeBoard() {
      for (let row = 0; row < 8; row++) {
        this.board[row] = [];
        for (let col = 0; col < 8; col++) {
          this.board[row][col] = null;
        }
      }
  
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
          if ((row + col) % 2 === 1) {
            this.board[row][col] = { color: 'black', isKing: false };
          }
        }
      }
      for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if ((row + col) % 2 === 1) {
            this.board[row][col] = { color: 'red', isKing: false };
          }
        }
      }
    }
  
    renderBoard() {
      const boardElement = document.getElementById('board');
      boardElement.innerHTML = '';
  
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const cell = document.createElement('div');
          cell.className = `cell ${(row + col) % 2 === 1 ? 'black' : ''}`;
          
          if (this.board[row][col]) {
            const piece = document.createElement('div');
            piece.className = `piece ${this.board[row][col].color === 'red' ? 'red' : 'black-piece'}`;
            if (this.board[row][col].isKing) {
              piece.classList.add('king');
            }
            cell.appendChild(piece);
          }
  
          cell.setAttribute('data-row', row);
          cell.setAttribute('data-col', col);
          cell.addEventListener('click', (e) => this.handleClick(row, col));
  
          if (this.possibleMoves.some(move => move.toRow === row && move.toCol === col)) {
            cell.classList.add('possible-move');
          }
  
          boardElement.appendChild(cell);
        }
      }
  
      document.getElementById('current-turn').textContent = 
        this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
    }
  
    async handleClick(row, col) {
      if (this.gameOver || (this.currentPlayer === 'black')) return;
  
      const piece = this.board[row][col];
  
      if (piece && piece.color === this.currentPlayer) {
        this.selectedPiece = { row, col };
        this.possibleMoves = this.getValidMoves(row, col);
        this.renderBoard();
        document.querySelector(`[data-row="${row}"][data-col="${col}"] .piece`).classList.add('selected');
      } else if (this.selectedPiece && this.possibleMoves.some(move => move.toRow === row && move.toCol === col)) {
        this.movePiece(this.selectedPiece, { row, col });
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.currentPlayer = 'black';
        this.renderBoard();
        
        if (!this.checkWinner()) {
          document.getElementById('thinking').textContent = 'AI is thinking...';
          await new Promise(resolve => setTimeout(resolve, 1000));
          this.makeAIMove();
          document.getElementById('thinking').textContent = '';
        }
      } else {
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.renderBoard();
      }
    }
  
    makeAIMove() {
      const aiMove = this.findBestMove(this.board, 4);
      if (aiMove) {
        this.movePiece(
          { row: aiMove.fromRow, col: aiMove.fromCol },
          { row: aiMove.toRow, col: aiMove.toCol }
        );
        this.currentPlayer = 'red';
        this.renderBoard();
        this.checkWinner();
      }
    }
  
    evaluateBoard() {
      let score = 0;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = this.board[row][col];
          if (piece) {
            const value = piece.isKing ? 3 : 1;
            if (piece.color === 'black') {
              score += value;
              score += (row / 8);
            } else {
              score -= value;
              score -= ((7 - row) / 8);
            }
          }
        }
      }
      return score;
    }
  
    findBestMove(board, depth) {
      let bestValue = -Infinity;
      let bestMove = null;
  
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = this.board[row][col];
          if (piece && piece.color === 'black') {
            const moves = this.getValidMoves(row, col);
            for (const move of moves) {
              const oldBoard = JSON.parse(JSON.stringify(this.board));
              this.movePiece({ row, col }, { row: move.toRow, col: move.toCol });
              
              const moveValue = this.minimax(depth - 1, false, -Infinity, Infinity);
              
              this.board = JSON.parse(JSON.stringify(oldBoard));
  
              if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = {
                  fromRow: row,
                  fromCol: col,
                  toRow: move.toRow,
                  toCol: move.toCol
                };
              }
            }
          }
        }
      }
      return bestMove;
    }
  
    minimax(depth, isMaximizing, alpha, beta) {
      if (depth === 0) return this.evaluateBoard();
  
      if (isMaximizing) {
        let maxEval = -Infinity;
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const piece = this.board[row][col];
            if (piece && piece.color === 'black') {
              const moves = this.getValidMoves(row, col);
              for (const move of moves) {
                const oldBoard = JSON.parse(JSON.stringify(this.board));
                this.movePiece({ row, col }, { row: move.toRow, col: move.toCol });
                const moveValue = this.minimax(depth - 1, false, alpha, beta);
                this.board = JSON.parse(JSON.stringify(oldBoard));
                maxEval = Math.max(maxEval, moveValue);
                alpha = Math.max(alpha, moveValue);
                if (beta <= alpha) break;
              }
            }
          }
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const piece = this.board[row][col];
            if (piece && piece.color === 'red') {
              const moves = this.getValidMoves(row, col);
              for (const move of moves) {
                const oldBoard = JSON.parse(JSON.stringify(this.board));
                this.movePiece({ row, col }, { row: move.toRow, col: move.toCol });
                const moveValue = this.minimax(depth - 1, true, alpha, beta);
                this.board = JSON.parse(JSON.stringify(oldBoard));
                minEval = Math.min(minEval, moveValue);
                beta = Math.min(beta, moveValue);
                if (beta <= alpha) break;
              }
            }
          }
        }
        return minEval;
      }
    }
  
    getValidMoves(row, col) {
      const moves = [];
      const piece = this.board[row][col];
      const directions = piece.isKing ? [-1, 1] : piece.color === 'red' ? [-1] : [1];
  
      for (let rowDir of directions) {
        for (let colDir of [-1, 1]) {
          const newRow = row + rowDir;
          const newCol = col + colDir;
          if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
            moves.push({ toRow: newRow, toCol: newCol, isJump: false });
          }
  
          const jumpRow = row + (rowDir * 2);
          const jumpCol = col + (colDir * 2);
          if (this.isValidPosition(jumpRow, jumpCol) && 
              !this.board[jumpRow][jumpCol] && 
              this.board[newRow][newCol] && 
              this.board[newRow][newCol].color !== piece.color) {
            moves.push({ toRow: jumpRow, toCol: jumpCol, isJump: true });
          }
        }
      }
  
      return moves;
    }
  
    isValidPosition(row, col) {
      return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
  
    movePiece(from, to) {
      const piece = this.board[from.row][from.col];
      this.board[to.row][to.col] = piece;
      this.board[from.row][from.col] = null;
  
      if (Math.abs(from.row - to.row) === 2) {
        const jumpedRow = (from.row + to.row) / 2;
        const jumpedCol = (from.col + to.col) / 2;
        this.board[jumpedRow][jumpedCol] = null;
      }
  
      if ((piece.color === 'red' && to.row === 0) || 
          (piece.color === 'black' && to.row === 7)) {
        piece.isKing = true;
      }
    }
  
    checkWinner() {
      let redPieces = 0;
      let blackPieces = 0;
  
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (this.board[row][col]) {
            if (this.board[row][col].color === 'red') redPieces++;
            else blackPieces++;
          }
        }
      }
  
      const status = document.getElementById('status');
      if (redPieces === 0) {
        status.textContent = 'Black (AI) Wins!';
        this.gameOver = true;
        showVictoryModal('Black (AI)');
        return true;
      } else if (blackPieces === 0) {
        status.textContent = 'Red (You) Win!';
        this.gameOver = true;
        showVictoryModal('Red (You)');
        return true;
      }
      return false;
    }
  }
  
  function showVictoryModal(winner) {
    const modal = document.getElementById('victoryModal');
    const victoryText = document.getElementById('victoryText');
    victoryText.textContent = `${winner} Wins!`;
    modal.classList.add('show');
  }
  
  function hideVictoryModal() {
    const modal = document.getElementById('victoryModal');
    modal.classList.remove('show');
  }
  
  document.getElementById('resetBtn').addEventListener('click', () => {
    game.initializeBoard();
    game.currentPlayer = 'red';
    game.gameOver = false;
    game.selectedPiece = null;
    game.possibleMoves = [];
    document.getElementById('status').textContent = '';
    game.renderBoard();
    hideVictoryModal();
  });
  
  document.getElementById('instructionsBtn').addEventListener('click', () => {
    document.getElementById('instructionsModal').classList.add('show');
  });
  
  document.getElementById('closeInstructionsBtn').addEventListener('click', () => {
    document.getElementById('instructionsModal').classList.remove('show');
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && game.gameOver) {
      game.initializeBoard();
      game.currentPlayer = 'red';
      game.gameOver = false;
      game.selectedPiece = null;
      game.possibleMoves = [];
      document.getElementById('status').textContent = '';
      game.renderBoard();
      hideVictoryModal();
    }
  });
  const game = new CheckersGame();