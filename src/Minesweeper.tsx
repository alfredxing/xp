import React, { useState, useEffect } from 'react';

import { useWindows } from './WindowsContext';

export const Minesweeper = () => {
  const { windows, createWindow, closeWindow } = useWindows();

  // Game configuration
  const [difficulty, setDifficulty] = useState('beginner');
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [gameStarted, setGameStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [mineCount, setMineCount] = useState(0);
  const [board, setBoard] = useState([]);
  const [faceState, setFaceState] = useState('smile'); // smile, wow, dead, cool
  const [mouseDown, setMouseDown] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // Configuration for different difficulty levels
  const difficultySettings = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 },
  };

  // Initialize new game
  const initializeGame = () => {
    const { rows, cols, mines } = difficultySettings[difficulty];
    setMineCount(mines);
    setTime(0);
    setGameStarted(false);
    setGameState('playing');
    setFaceState('smile');
    setShowMessage(false);

    // Create empty board
    const newBoard = Array(rows)
      .fill()
      .map(() =>
        Array(cols)
          .fill()
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0,
          })),
      );

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newBoard[row][col].isMine) {
          let neighbors = 0;

          // Check all 8 adjacent cells
          for (let r = Math.max(0, row - 1); r <= Math.min(row + 1, rows - 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(col + 1, cols - 1); c++) {
              if (r !== row || c !== col) {
                if (newBoard[r][c].isMine) {
                  neighbors++;
                }
              }
            }
          }

          newBoard[row][col].neighborMines = neighbors;
        }
      }
    }

    setBoard(newBoard);
  };

  // Start the game timer
  useEffect(() => {
    let timerInterval;

    if (gameStarted && gameState === 'playing') {
      timerInterval = setInterval(() => {
        setTime((prevTime) => Math.min(prevTime + 1, 999));
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [gameStarted, gameState]);

  // Initialize game on difficulty change
  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  // Check if game is won
  useEffect(() => {
    if (!board || board.length === 0 || gameState !== 'playing') return;

    const { rows, cols, mines } = difficultySettings[difficulty];
    let revealedCount = 0;

    // Count revealed cells safely
    for (let row = 0; row < board.length; row++) {
      if (board[row]) {
        for (let col = 0; col < board[row].length; col++) {
          if (board[row][col] && board[row][col].isRevealed) {
            revealedCount++;
          }
        }
      }
    }

    if (revealedCount === rows * cols - mines) {
      setGameState('won');
      setFaceState('cool');
    }
  }, [board, difficulty, gameState]);

  // Handle cell click to reveal
  const handleCellClick = (row, col) => {
    // Make sure board is initialized and the cell exists
    if (!board || !board[row] || !board[row][col]) {
      return;
    }

    if (gameState !== 'playing' || board[row][col].isFlagged || board[row][col].isRevealed) {
      return;
    }

    // Start the game if it's the first click
    if (!gameStarted) {
      setGameStarted(true);
    }

    const newBoard = [...board];

    // Game over if clicked on a mine
    if (newBoard[row][col].isMine) {
      newBoard[row][col].isRevealed = true;
      setGameState('lost');
      setFaceState('dead');

      createWindow({
        title: 'Message',
        content: (() => {
          const onClick = (e: React.MouseEvent) => {
            const windowElement = e.currentTarget.closest('.window');
            const windowId = windowElement?.getAttribute('data-id');
            if (windowId) closeWindow(windowId);
          };

          return (
            <div style={{ padding: '8px 0 16px' }}>
              <p style={{ textAlign: 'center' }}>
                Happy two years at Notion Felix!
                <br />
                Thanks for being a 💣 manager. ~ Alice
              </p>
              <section className="field-row" style={{ justifyContent: 'center' }}>
                <button onClick={onClick}>OK</button>
              </section>
            </div>
          );
        })(),
        position: { x: (window.innerWidth / 2 - 150) | 0, y: (window.innerHeight / 2 - 62) | 0 },
        size: { width: 300, height: 134 },
      });

      // Reveal all mines
      for (let r = 0; r < newBoard.length; r++) {
        for (let c = 0; c < newBoard[r].length; c++) {
          if (newBoard[r][c].isMine) {
            newBoard[r][c].isRevealed = true;
          }
        }
      }

      setBoard(newBoard);
      return;
    }

    // Recursive reveal of empty cells
    revealCell(newBoard, row, col);
    setBoard(newBoard);
  };

  // Recursively reveal connected empty cells
  const revealCell = (board, row, col) => {
    // Check if board exists and has rows
    if (!board || !board.length) {
      return;
    }

    // Ensure we're within bounds
    if (row < 0 || row >= board.length || col < 0 || !board[row] || col >= board[row].length) {
      return; // Out of bounds
    }

    // Ensure the cell exists
    if (!board[row][col]) {
      return;
    }

    if (board[row][col].isRevealed || board[row][col].isFlagged) {
      return; // Already revealed or flagged
    }

    board[row][col].isRevealed = true;

    // If this is an empty cell, reveal neighbors
    if (board[row][col].neighborMines === 0) {
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r !== row || c !== col) {
            revealCell(board, r, c);
          }
        }
      }
    }
  };

  // Handle right-click to flag/unflag
  const handleCellRightClick = (e, row, col) => {
    e.preventDefault();

    // Make sure board is initialized and the cell exists
    if (!board || !board[row] || !board[row][col]) {
      return;
    }

    if (gameState !== 'playing' || board[row][col].isRevealed) {
      return;
    }

    // Start the game if it's the first interaction
    if (!gameStarted) {
      setGameStarted(true);
    }

    const newBoard = [...board];

    if (newBoard[row][col].isFlagged) {
      newBoard[row][col].isFlagged = false;
      setMineCount((prevCount) => prevCount + 1);
    } else {
      if (mineCount > 0) {
        newBoard[row][col].isFlagged = true;
        setMineCount((prevCount) => prevCount - 1);
      }
    }

    setBoard(newBoard);
  };

  // Reset the game
  const resetGame = () => {
    initializeGame();
  };

  // Change difficulty
  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  // Render a single cell
  const renderCell = (cell, row, col) => {
    let cellContent = '';
    let cellClass = 'cell';

    if (cell.isRevealed) {
      cellClass += ' revealed';

      if (cell.isMine) {
        cellContent = '💣';
        cellClass += ' mine';
      } else if (cell.neighborMines > 0) {
        cellContent = cell.neighborMines;
        cellClass += ` neighbors-${cell.neighborMines}`;
      }
    } else {
      cellClass += ' unrevealed';

      if (cell.isFlagged) {
        cellContent = '🚩';
      }
    }

    return (
      <div
        key={`${row}-${col}`}
        className={cellClass}
        onClick={() => handleCellClick(row, col)}
        onContextMenu={(e) => handleCellRightClick(e, row, col)}
        onMouseDown={() => setFaceState('wow')}
        onMouseUp={() => gameState === 'playing' && setFaceState('smile')}
        onMouseLeave={() => gameState === 'playing' && setFaceState('smile')}
      >
        {cellContent}
      </div>
    );
  };

  // Render the smiley face
  const renderFace = () => {
    let faceContent = '';

    switch (faceState) {
      case 'smile':
        faceContent = '😊';
        break;
      case 'wow':
        faceContent = '😮';
        break;
      case 'dead':
        faceContent = '😵';
        break;
      case 'cool':
        faceContent = '😎';
        break;
      default:
        faceContent = '😊';
    }

    return (
      <div className="face" onClick={resetGame}>
        {faceContent}
      </div>
    );
  };

  // Format number for display (with leading zeros)
  const formatNumber = (num) => {
    return num.toString().padStart(3, '0');
  };

  return (
    <div className="xp-minesweeper">
      <div className="game-container">
        <div className="game-info">
          <div className="mine-counter">{formatNumber(mineCount)}</div>
          {renderFace()}
          <div className="timer">{formatNumber(time)}</div>
        </div>

        <div className={`game-board ${difficulty}`}>
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
            </div>
          ))}
        </div>

        {showMessage && (
          <div className="custom-message-container">
            <div className="custom-message">
              <div className="message-title">
                <div className="message-title-text">Message</div>
                <div className="message-close" onClick={() => setShowMessage(false)}>
                  ✕
                </div>
              </div>
              <div className="message-content">
                Happy two years at Notion Felix! Thanks for being a 💣 manager. ~ Alice
              </div>
              <div className="message-footer">
                <button onClick={() => setShowMessage(false)}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .xp-minesweeper {
          font-family: 'Tahoma', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          background-color: #ece9d8;
          _padding: 20px;
        }

        .xp-minesweeper .button {
          width: 22px;
          height: 22px;
          margin-left: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .xp-minesweeper .difficulty-controls {
          padding: 8px;
          display: flex;
          justify-content: center;
          gap: 8px;
          border-bottom: 1px solid #aca899;
        }

        .xp-minesweeper .game-container {
          padding: 12px;
          background-color: #c0c0c0;
          _border: 3px solid #808080;
          border-top-color: #ffffff;
          border-left-color: #ffffff;
        }

        .xp-minesweeper .game-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          background-color: black;
          padding: 6px;
          border: 2px solid #808080;
          border-top-color: #404040;
          border-left-color: #404040;
        }

        .xp-minesweeper .mine-counter,
        .xp-minesweeper .timer {
          font-family: 'Digital', monospace;
          background-color: black;
          color: red;
          font-size: 24px;
          padding: 0 4px;
          min-width: 60px;
          text-align: center;
          font-weight: bold;
        }

        .xp-minesweeper .face {
          width: 34px;
          height: 34px;
          background-color: #c0c0c0;
          border: 2px solid #808080;
          border-top-color: #ffffff;
          border-left-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 24px;
          user-select: none;
        }

        .xp-minesweeper .face:hover {
          background-color: #d0d0d0;
        }

        .xp-minesweeper .face:active {
          border: 2px solid #808080;
          border-bottom-color: #ffffff;
          border-right-color: #ffffff;
        }

        .xp-minesweeper .game-board {
          display: flex;
          flex-direction: column;
          border: 3px solid #808080;
          border-top-color: #404040;
          border-left-color: #404040;
        }

        .xp-minesweeper .row {
          display: flex;
        }

        .xp-minesweeper .cell {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          cursor: pointer;
          user-select: none;
          font-size: 16px;
        }

        .xp-minesweeper .unrevealed {
          background-color: #c0c0c0;
          border: 2px solid #808080;
          border-top-color: #ffffff;
          border-left-color: #ffffff;
        }

        .xp-minesweeper .revealed {
          background-color: #d8d8d8;
          border: 1px solid #808080;
        }

        .xp-minesweeper .mine {
          background-color: #ff0000;
        }

        .xp-minesweeper .neighbors-1 {
          color: blue;
        }
        .xp-minesweeper .neighbors-2 {
          color: green;
        }
        .xp-minesweeper .neighbors-3 {
          color: red;
        }
        .xp-minesweeper .neighbors-4 {
          color: darkblue;
        }
        .xp-minesweeper .neighbors-5 {
          color: brown;
        }
        .xp-minesweeper .neighbors-6 {
          color: teal;
        }
        .xp-minesweeper .neighbors-7 {
          color: black;
        }
        .xp-minesweeper .neighbors-8 {
          color: gray;
        }

        .xp-minesweeper .beginner {
          width: ${difficultySettings.beginner.cols * 24}px;
        }

        .xp-minesweeper .intermediate {
          width: ${difficultySettings.intermediate.cols * 24}px;
        }

        .xp-minesweeper .expert {
          width: ${difficultySettings.expert.cols * 24}px;
        }
      `}</style>
    </div>
  );
};
