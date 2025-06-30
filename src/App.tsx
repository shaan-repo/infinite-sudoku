import { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import Modal from './components/Modal';
import VictoryModal from './components/VictoryModal';
import WelcomeModal from './components/WelcomeModal';
import { preGeneratedPuzzles, arrayToGrid } from './data/puzzles';

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
  const [mistakes, setMistakes] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);

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

  // Check if puzzle has exactly one unique solution
  const hasUniqueSolution = (grid: Grid): boolean => {
    let solutionCount = 0;
    
    const countSolutions = (currentGrid: Grid): void => {
      // Find first empty cell
      let emptyCell = null;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (currentGrid[row][col] === 0) {
            emptyCell = { row, col };
            break;
          }
        }
        if (emptyCell) break;
      }
      
      // If no empty cells, we found a solution
      if (!emptyCell) {
        solutionCount++;
        return;
      }
      
      // Try each number in the empty cell
      for (let num = 1; num <= 9; num++) {
        if (isValid(currentGrid, emptyCell.row, emptyCell.col, num)) {
          const newGrid = currentGrid.map(row => [...row]);
          newGrid[emptyCell.row][emptyCell.col] = num;
          countSolutions(newGrid);
          
          // Early termination if we found more than one solution
          if (solutionCount > 1) return;
        }
      }
    };
    
    countSolutions(grid);
    return solutionCount === 1;
  };

  // Get a random pre-generated puzzle for hard/extreme difficulties
  const getRandomPreGeneratedPuzzle = (difficulty: Difficulty): { puzzle: Grid; solution: Grid } | null => {
    const availablePuzzles = preGeneratedPuzzles.filter(p => p[0] === difficulty);
    if (availablePuzzles.length === 0) return null;
    
    const randomPuzzle = availablePuzzles[Math.floor(Math.random() * availablePuzzles.length)];
    return {
      puzzle: arrayToGrid(randomPuzzle[1] as number[]),
      solution: arrayToGrid(randomPuzzle[2] as number[])
    };
  };

  // Generate puzzle by removing numbers
  const generatePuzzle = (difficulty: Difficulty): { puzzle: Grid; solution: Grid } => {
    // Use pre-generated puzzles for hard and extreme difficulties
    if (difficulty === 'hard' || difficulty === 'extreme') {
      const preGenerated = getRandomPreGeneratedPuzzle(difficulty);
      if (preGenerated) {
        return preGenerated;
      }
      // Fallback to generation if no pre-generated puzzles available
    }
    
    // Generate puzzles for easy and medium difficulties
    const complete = generateComplete();
    const puzzle = complete.map(row => [...row]);
    
    const difficultyMap: Record<Difficulty, number> = {
      easy: 35,
      medium: 45,
      hard: 50,
      extreme: 58
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
        
        if (solved && hasUniqueSolution(testGrid)) {
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
    setIsGameOver(false);
    setSelectedCell(null);
    setConflicts(new Set());
    setMistakes(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsPaused(false);
    setPauseStartTime(null);
  }, [difficulty]);

  const startNewGame = () => {
    setIsComplete(false);
    setSelectedCell(null);
    setConflicts(new Set());
    setMistakes(0);
    setStartTime(null);
    setElapsedTime(0);
    setIsPaused(false);
    setIsGameOver(false);
    setPauseStartTime(null);
    // Clear the grid to prevent any interaction with old game state
    setGrid(Array(9).fill(null).map(() => Array(9).fill(0)));
    setInitialGrid(Array(9).fill(null).map(() => Array(9).fill(0)));
    setShowWelcome(false);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isPaused && !isGameOver) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num: number) => {
    if (selectedCell && !isComplete && !isPaused && !isGameOver) {
      const { row, col } = selectedCell;
      if (initialGrid[row][col] === 0) {
        const newGrid = [...grid];
        newGrid[row][col] = num;
        setGrid(newGrid);
        
        // Check if this creates a conflict (mistake)
        const newConflicts = findConflicts(newGrid);
        const hadConflict = conflicts.has(`${row}-${col}`);
        const hasConflict = newConflicts.has(`${row}-${col}`);
        
        // If this cell now has a conflict and didn't before, it's a new mistake
        if (hasConflict && !hadConflict) {
          const newMistakeCount = mistakes + 1;
          setMistakes(newMistakeCount);
          
          // Check if game over
          if (newMistakeCount >= 3) {
            setIsGameOver(true);
          }
        }
        
        setConflicts(newConflicts);
        
        // Check if puzzle is complete
        if (newConflicts.size === 0 && newGrid.every(row => row.every(cell => cell !== 0))) {
          setIsComplete(true);
        }
      }
    }
  };

  const clearCell = () => {
    if (selectedCell && !isComplete && !isPaused && !isGameOver) {
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
    if (!isComplete && !isGameOver) {
      if (isPaused) {
        // Resuming - adjust start time to account for paused duration
        if (pauseStartTime && startTime) {
          const pauseDuration = Date.now() - pauseStartTime;
          setStartTime(startTime + pauseDuration);
        }
        setPauseStartTime(null);
      } else {
        // Pausing - record when pause started
        setPauseStartTime(Date.now());
      }
      setIsPaused(!isPaused);
    }
  };

  // Check if all instances of a number are correctly placed
  const isNumberComplete = (num: number): boolean => {
    let count = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === num) {
          count++;
        }
      }
    }
    return count === 9;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPaused && !isGameOver) {
        if (e.key >= '1' && e.key <= '9') {
          handleNumberInput(parseInt(e.key));
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          clearCell();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, isComplete, isPaused, isGameOver]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-clip-text text-transparent drop-shadow-sm">
            Infinite Sudoku
          </h1>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-2xl font-mono font-medium text-slate-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-100">
              {formatTime(elapsedTime)}
            </div>
            <button
              onClick={togglePause}
              disabled={isComplete || isGameOver}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center text-xl ${
                isComplete || isGameOver
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isPaused
                  ? 'bg-blue-400 text-white hover:bg-blue-500 shadow-md hover:shadow-lg'
                  : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300/80 hover:shadow-md'
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
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                  difficulty === level
                    ? 'bg-blue-400 text-white shadow-md hover:shadow-lg'
                    : 'bg-white/60 text-slate-600 hover:bg-white/80 hover:shadow-sm border border-blue-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex justify-center items-center gap-4 mb-4">
            <button
              onClick={newGame}
              className="bg-slate-600 text-white px-6 py-2 rounded-full font-medium hover:bg-slate-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              New Game
            </button>
            <div className="text-sm font-medium text-rose-700 bg-rose-50/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-rose-200">
              Mistakes: {mistakes}/3
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <Board
            grid={grid}
            initialGrid={initialGrid}
            conflicts={conflicts}
            selectedCell={selectedCell}
            handleCellClick={handleCellClick}
          />
          <VictoryModal
            open={isComplete}
            onClose={startNewGame}
            difficulty={difficulty}
            time={formatTime(elapsedTime)}
          />
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
              <div className="text-lg font-medium text-slate-700 mb-1">Game Paused</div>
              <div className="text-sm text-slate-600">No Cheating!</div>
            </div>
          </Modal>
          <Modal
            open={isGameOver}
            onClose={startNewGame}
            buttonText="New Game"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🫵🏽😹</div>
              <div className="text-lg font-medium text-slate-700 mb-1">Are you even trying!?</div>
              <div className="text-sm text-slate-600">
                if isNiki == "I know your phone glitched or something. This would never happen to you."
                <br />
                <br />
                if notNiki == "YOU'RE STUPID! GIVE UP!"
              </div>
            </div>
          </Modal>
          <WelcomeModal
            open={showWelcome}
            onClose={() => setShowWelcome(false)}
          />
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
            const isComplete = isNumberComplete(num);
            return (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                disabled={isPaused || isComplete || isGameOver}
                className={`aspect-square font-medium rounded-lg transition-all duration-300 ${
                  isPaused || isComplete || isGameOver
                    ? 'bg-slate-200/60 text-slate-400 cursor-not-allowed'
                    : isComplete
                    ? 'bg-gradient-to-br from-blue-200/80 to-blue-300/60 text-blue-700/70 backdrop-blur-sm border border-blue-200/60 cursor-not-allowed'
                    : 'bg-white/60 hover:bg-white/80 text-slate-700 hover:shadow-md border border-blue-100'
                }`}
              >
                {num}
              </button>
            );
          })}
          <button
            onClick={clearCell}
            disabled={isPaused || isComplete || isGameOver}
            className={`aspect-square font-medium rounded-lg transition-all duration-300 ${
              isPaused || isComplete || isGameOver
                ? 'bg-blue-50/60 text-blue-300 cursor-not-allowed'
                : 'bg-blue-100/80 hover:bg-blue-200/80 text-blue-600 hover:shadow-md border border-blue-200'
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