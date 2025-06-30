import { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import Modal from './components/Modal';

type Grid = number[][];
type CellPosition = { row: number; col: number } | null;
type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

function App() {
  const [grid, setGrid] = useState<Grid>(Array(9).fill(null).map(() => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState<CellPosition>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [initialGrid, setInitialGrid] = useState<Grid>(Array(9).fill(null).map(() => Array(9).fill(0)));
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Check for conflicts in current grid state
  const findConflicts = (grid: Grid): Set<string> => {
    const conflictSet = new Set<string>();
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const num = grid[row][col];
        if (num !== 0) {
          // Check row conflicts
          for (let c = 0; c < 9; c++) {
            if (c !== col && grid[row][c] === num) {
              conflictSet.add(`${row}-${col}`);
              conflictSet.add(`${row}-${c}`);
            }
          }
          
          // Check column conflicts
          for (let r = 0; r < 9; r++) {
            if (r !== row && grid[r][col] === num) {
              conflictSet.add(`${row}-${col}`);
              conflictSet.add(`${r}-${col}`);
            }
          }
          
          // Check 3x3 box conflicts
          const boxStartRow = Math.floor(row / 3) * 3;
          const boxStartCol = Math.floor(col / 3) * 3;
          for (let r = boxStartRow; r < boxStartRow + 3; r++) {
            for (let c = boxStartCol; c < boxStartCol + 3; c++) {
              if ((r !== row || c !== col) && grid[r][c] === num) {
                conflictSet.add(`${row}-${col}`);
                conflictSet.add(`${r}-${c}`);
              }
            }
          }
        }
      }
    }
    
    return conflictSet;
  };

  const isValid = (grid: Grid, row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }
    
    return true;
  };

  const solveSudoku = (grid: Grid): Grid | null => {
    const newGrid = grid.map(row => [...row]);
    
    const solve = (): boolean => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (newGrid[row][col] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValid(newGrid, row, col, num)) {
                newGrid[row][col] = num;
                if (solve()) return true;
                newGrid[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    
    return solve() ? newGrid : null;
  };

  // Generate a complete sudoku grid
  const generateComplete = (): Grid => {
    const grid: Grid = Array(9).fill(null).map(() => Array(9).fill(0));
    
    const fillGrid = (): boolean => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (let num of numbers) {
              if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (fillGrid()) return true;
                grid[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    
    fillGrid();
    return grid;
  };

  // Generate puzzle by removing numbers
  const generatePuzzle = (difficulty: Difficulty): { puzzle: Grid; solution: Grid } => {
    const complete = generateComplete();
    const puzzle = complete.map(row => [...row]);
    
    const difficultyMap: Record<Difficulty, number> = {
      easy: 35,
      medium: 45,
      hard: 55,
      extreme: 65
    };
    
    const cellsToRemove = difficultyMap[difficulty];
    let removed = 0;
    
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (puzzle[row][col] !== 0) {
        const backup = puzzle[row][col];
        puzzle[row][col] = 0;
        
        // Check if puzzle still has unique solution
        const testGrid = puzzle.map(row => [...row]);
        const solved = solveSudoku(testGrid);
        
        if (solved) {
          removed++;
        } else {
          puzzle[row][col] = backup;
        }
      }
    }
    
    return { puzzle, solution: complete };
  };

  const newGame = useCallback(() => {
    const { puzzle } = generatePuzzle(difficulty);
    setGrid(puzzle);
    setInitialGrid(puzzle.map(row => [...row]));
    setIsComplete(false);
    setSelectedCell(null);
    setConflicts(new Set());
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsPaused(false);
  }, [difficulty]);

  const handleCellClick = (row: number, col: number) => {
    if (!isPaused) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num: number) => {
    if (selectedCell && !isComplete && !isPaused) {
      const { row, col } = selectedCell;
      if (initialGrid[row][col] === 0) {
        const newGrid = [...grid];
        newGrid[row][col] = num;
        setGrid(newGrid);
        
        // Update conflicts
        const newConflicts = findConflicts(newGrid);
        setConflicts(newConflicts);
        
        // Check if puzzle is complete (no conflicts and no empty cells)
        const isGridComplete = newGrid.every(row => row.every(cell => cell !== 0));
        if (isGridComplete && newConflicts.size === 0) {
          setIsComplete(true);
          setSelectedCell(null);
        }
      }
    }
  };

  const clearCell = () => {
    if (selectedCell && !isComplete && !isPaused) {
      const { row, col } = selectedCell;
      if (initialGrid[row][col] === 0) {
        const newGrid = [...grid];
        newGrid[row][col] = 0;
        setGrid(newGrid);
        
        // Update conflicts
        const newConflicts = findConflicts(newGrid);
        setConflicts(newConflicts);
      }
    }
  };

  const togglePause = () => {
    setIsPaused((prev) => {
      if (prev) {
        // Resuming - adjust start time to account for paused duration
        setStartTime(Date.now() - elapsedTime * 1000);
      }
      return !prev;
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPaused) {
        if (e.key >= '1' && e.key <= '9') {
          handleNumberInput(parseInt(e.key));
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          clearCell();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, isComplete, isPaused]);

  // Timer effect
  useEffect(() => {
    let interval: number;
    
    if (startTime && !isPaused && !isComplete) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [startTime, isPaused, isComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-slate-800 mb-2">Infinite Sudoku</h1>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-2xl font-mono text-slate-700 bg-slate-100 px-4 py-2 rounded-lg">
              {formatTime(elapsedTime)}
            </div>
            <button
              onClick={togglePause}
              disabled={isComplete}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center text-xl ${
                isComplete 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isPaused
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {isPaused ? (
                // Play SVG
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <polygon points="6,4 20,12 6,20" />
                </svg>
              ) : (
                // Pause SVG
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="flex justify-center gap-2 mb-4">
            {['easy', 'medium', 'hard', 'extreme'].map(level => (
              <button
                key={level}
                onClick={() => setDifficulty(level as Difficulty)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  difficulty === level
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <button
            onClick={newGame}
            className="bg-slate-800 text-white px-6 py-2 rounded-full font-medium hover:bg-slate-700 transition-colors"
          >
            New Game
          </button>
        </div>

        <div className="relative mb-8">
          <Board
            grid={grid}
            initialGrid={initialGrid}
            conflicts={conflicts}
            selectedCell={selectedCell}
            handleCellClick={handleCellClick}
          />
          <Modal open={isComplete} onClose={() => {}}>
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-xl font-medium text-slate-800 mb-2">Congratulations!</div>
              <div className="text-slate-600 mb-2">Puzzle completed!</div>
              <div className="text-lg font-mono text-blue-600">Final time: {formatTime(elapsedTime)}</div>
            </div>
          </Modal>
          <Modal
            open={isPaused && !isComplete}
            onClose={togglePause}
            buttonText="Resume"
            buttonIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            }
          >
            <div className="text-center">
              <div className="text-lg font-medium text-slate-800 mb-1">Game Paused</div>
              <div className="text-sm text-slate-600">No Cheating!</div>
            </div>
          </Modal>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              disabled={isPaused || isComplete}
              className={`aspect-square font-medium rounded-lg transition-colors ${
                isPaused || isComplete
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={clearCell}
            disabled={isPaused || isComplete}
            className={`aspect-square font-medium rounded-lg transition-colors ${
              isPaused || isComplete
                ? 'bg-red-50 text-red-300 cursor-not-allowed'
                : 'bg-red-100 hover:bg-red-200 text-red-600'
            }`}
          >
            ×
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          Click a cell and use keyboard or buttons to play
        </div>
      </div>
    </div>
  );
};

export default App;