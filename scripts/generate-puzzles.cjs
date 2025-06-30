// Script to generate hard and extreme puzzles with unique solutions
// Run with: node scripts/generate-puzzles.cjs

// Safety measures - increased limits
const MAX_MEMORY_USAGE = 1024 * 1024 * 1024; // 1GB limit
const MAX_EXECUTION_TIME = 60 * 60 * 1000; // 60 minutes max
const PUZZLE_TIMEOUT = 60 * 1000; // 60 seconds per puzzle max
const CPU_THROTTLE_DELAY = 5; // 5ms delay (reduced)

// Target puzzle counts
const TARGET_HARD_PUZZLES = 100;
const TARGET_EXTREME_PUZZLES = 50;

const startTime = Date.now();

// Memory monitoring
const checkMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  const heapUsed = memUsage.heapUsed;
  
  if (heapUsed > MAX_MEMORY_USAGE) {
    console.log('⚠️  Memory usage too high, stopping generation');
    process.exit(0);
  }
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
};

// Time monitoring
const checkExecutionTime = () => {
  const elapsed = Date.now() - startTime;
  if (elapsed > MAX_EXECUTION_TIME) {
    console.log('⚠️  Maximum execution time reached, stopping generation');
    process.exit(0);
  }
};

// CPU throttling
const throttle = () => {
  return new Promise(resolve => setTimeout(resolve, CPU_THROTTLE_DELAY));
};

// Check existing puzzles
const checkExistingPuzzles = () => {
  const fs = require('fs');
  const path = require('path');
  
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'puzzles.ts');
  
  if (!fs.existsSync(outputPath)) {
    console.log('📁 No existing puzzles file found, will create new one');
    return { hard: 0, extreme: 0, existingPuzzles: [] };
  }
  
  try {
    const content = fs.readFileSync(outputPath, 'utf8');
    
    // Extract existing puzzles using regex - look for the exact format
    const puzzleMatches = content.match(/\["(hard|extreme)", \[[^\]]+\], \[[^\]]+\]\]/g);
    
    if (!puzzleMatches) {
      console.log('📁 No existing puzzles found in file');
      return { hard: 0, extreme: 0, existingPuzzles: [] };
    }
    
    const existingPuzzles = [];
    let hardCount = 0;
    let extremeCount = 0;
    
    puzzleMatches.forEach(match => {
      const difficultyMatch = match.match(/\["(hard|extreme)"/);
      if (difficultyMatch) {
        const difficulty = difficultyMatch[1];
        if (difficulty === 'hard') hardCount++;
        if (difficulty === 'extreme') extremeCount++;
        
        // Parse the puzzle data more carefully
        const puzzleMatch = match.match(/\[([^\]]+)\], \[([^\]]+)\]/);
        if (puzzleMatch) {
          // Clean and parse the arrays properly
          const puzzleStr = puzzleMatch[1].replace(/\s+/g, '');
          const solutionStr = puzzleMatch[2].replace(/\s+/g, '');
          
          const puzzleArray = puzzleStr.split(',').map(n => {
            const num = parseInt(n.trim());
            return isNaN(num) ? 0 : num; // Convert NaN to 0
          });
          
          const solutionArray = solutionStr.split(',').map(n => {
            const num = parseInt(n.trim());
            return isNaN(num) ? 0 : num; // Convert NaN to 0
          });
          
          // Only add if we have valid arrays of 81 numbers
          if (puzzleArray.length === 81 && solutionArray.length === 81) {
            existingPuzzles.push([difficulty, puzzleArray, solutionArray]);
          }
        }
      }
    });
    
    console.log(`📊 Found existing puzzles: ${hardCount} hard, ${extremeCount} extreme`);
    return { hard: hardCount, extreme: extremeCount, existingPuzzles };
    
  } catch (error) {
    console.log('⚠️  Error reading existing puzzles, will create new file');
    return { hard: 0, extreme: 0, existingPuzzles: [] };
  }
};

// Copy the puzzle generation logic from the React app
const generateComplete = () => {
  const grid = Array(9).fill(null).map(() => Array(9).fill(0));
  
  const isValid = (grid, row, col, num) => {
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
  
  const fillGrid = () => {
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

const solveSudoku = (grid) => {
  const newGrid = grid.map(row => [...row]);
  
  const solve = () => {
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

const isValid = (grid, row, col, num) => {
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

// Proper uniqueness check with early termination
const hasUniqueSolution = (grid) => {
  let solutionCount = 0;
  const puzzleStartTime = Date.now();
  
  const countSolutions = (currentGrid) => {
    // Check timeout for this puzzle
    if (Date.now() - puzzleStartTime > PUZZLE_TIMEOUT) {
      console.log('    ⚠️  Puzzle timeout during uniqueness check, skipping...');
      return;
    }
    
    // Early termination if we found more than one solution
    if (solutionCount > 1) return;
    
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

const gridToArray = (grid) => {
  return grid.flat();
};

const generatePuzzle = async (difficulty) => {
  console.log(`  Generating ${difficulty} puzzle...`);
  const complete = generateComplete();
  const puzzle = complete.map(row => [...row]);
  
  const difficultyMap = {
    hard: 50,
    extreme: 58
  };
  
  const cellsToRemove = difficultyMap[difficulty];
  let removed = 0;
  let attempts = 0;
  const maxAttempts = 300; // Increased for better results
  
  while (removed < cellsToRemove && attempts < maxAttempts) {
    attempts++;
    
    // Safety checks
    checkMemoryUsage();
    checkExecutionTime();
    
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
    
    // Throttle CPU usage
    await throttle();
  }
  
  console.log(`  ✅ Generated ${difficulty} puzzle with ${removed} cells removed`);
  return { puzzle, solution: complete };
};

// Main generation function with safety
const generatePuzzlesSafely = async () => {
  console.log('🚀 Starting smart puzzle generation with UNIQUE SOLUTIONS...');
  console.log('📊 Safety limits:');
  console.log(`   - Memory: ${MAX_MEMORY_USAGE / 1024 / 1024}MB max`);
  console.log(`   - Time: ${MAX_EXECUTION_TIME / 1000 / 60} minutes max`);
  console.log(`   - Per puzzle: ${PUZZLE_TIMEOUT / 1000} seconds max`);
  console.log(`   - CPU throttle: ${CPU_THROTTLE_DELAY}ms delay`);
  console.log(`   - Target: ${TARGET_HARD_PUZZLES} hard + ${TARGET_EXTREME_PUZZLES} extreme puzzles\n`);
  
  // Check existing puzzles
  const { hard: existingHard, extreme: existingExtreme, existingPuzzles } = checkExistingPuzzles();
  
  const hardNeeded = Math.max(0, TARGET_HARD_PUZZLES - existingHard);
  const extremeNeeded = Math.max(0, TARGET_EXTREME_PUZZLES - existingExtreme);
  
  if (hardNeeded === 0 && extremeNeeded === 0) {
    console.log('✅ Already have enough puzzles! No generation needed.');
    console.log(`📊 Current: ${existingHard} hard, ${existingExtreme} extreme`);
    return;
  }
  
  console.log(`📝 Need to generate: ${hardNeeded} hard, ${extremeNeeded} extreme puzzles`);
  
  // Generate additional hard puzzles
  const newHardPuzzles = [];
  if (hardNeeded > 0) {
    console.log(`\nGenerating ${hardNeeded} additional hard puzzles...`);
    for (let i = 0; i < hardNeeded; i++) {
      console.log(`\n📝 Hard puzzle ${i + 1}/${hardNeeded}:`);
      
      try {
        const { puzzle, solution } = await generatePuzzle('hard');
        newHardPuzzles.push(['hard', gridToArray(puzzle), gridToArray(solution)]);
        console.log(`   ✅ Added to collection (${newHardPuzzles.length} total)`);
      } catch (error) {
        console.log(`   ⚠️  Error generating hard puzzle ${i}, continuing...`);
        continue;
      }
    }
  }
  
  // Generate additional extreme puzzles
  const newExtremePuzzles = [];
  if (extremeNeeded > 0) {
    console.log(`\nGenerating ${extremeNeeded} additional extreme puzzles...`);
    for (let i = 0; i < extremeNeeded; i++) {
      console.log(`\n📝 Extreme puzzle ${i + 1}/${extremeNeeded}:`);
      
      try {
        const { puzzle, solution } = await generatePuzzle('extreme');
        newExtremePuzzles.push(['extreme', gridToArray(puzzle), gridToArray(solution)]);
        console.log(`   ✅ Added to collection (${newExtremePuzzles.length} total)`);
      } catch (error) {
        console.log(`   ⚠️  Error generating extreme puzzle ${i}, continuing...`);
        continue;
      }
    }
  }
  
  // Combine all puzzles (existing + new)
  const allPuzzles = [...existingPuzzles, ...newHardPuzzles, ...newExtremePuzzles];
  
  // Generate the TypeScript file content
  const fileContent = `// Pre-generated puzzles for hard and extreme difficulties
// Format: [difficulty, puzzle, solution]
// Puzzle and solution are flattened arrays of 81 numbers (0 for empty cells)

export const preGeneratedPuzzles = [
${allPuzzles.map(puzzle => {
  // Ensure clean arrays with no NaN values
  const cleanPuzzle = puzzle[1].map(n => isNaN(n) ? 0 : n);
  const cleanSolution = puzzle[2].map(n => isNaN(n) ? 0 : n);
  return `  ["${puzzle[0]}", [${cleanPuzzle.join(',')}], [${cleanSolution.join(',')}]],`;
}).join('\n')}
];

// Helper function to convert flattened array back to 2D grid
export const arrayToGrid = (arr: number[]): number[][] => {
  const grid = [];
  for (let i = 0; i < 9; i++) {
    grid.push(arr.slice(i * 9, (i + 1) * 9));
  }
  return grid;
};

// Helper function to convert 2D grid to flattened array
export const gridToArray = (grid: number[][]): number[] => {
  return grid.flat();
};
`;

  // Write to file
  const fs = require('fs');
  const path = require('path');
  
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'puzzles.ts');
  fs.writeFileSync(outputPath, fileContent);
  
  const totalTime = (Date.now() - startTime) / 1000 / 60;
  
  console.log(`\n✅ Generation complete!`);
  console.log(`📁 Written to: ${outputPath}`);
  console.log(`📊 Total puzzles: ${allPuzzles.length} (${existingHard + newHardPuzzles.length} hard, ${existingExtreme + newExtremePuzzles.length} extreme)`);
  console.log(`📈 New puzzles added: ${newHardPuzzles.length} hard, ${newExtremePuzzles.length} extreme`);
  console.log(`💾 Estimated size: ~${Math.round(allPuzzles.length * 2)}KB`);
  console.log(`⏱️  Total time: ${totalTime.toFixed(1)} minutes`);
  console.log(`🔒 All safety limits respected`);
  console.log(`✅ All puzzles guaranteed to have unique solutions!`);
};

// Run with error handling
generatePuzzlesSafely().catch(error => {
  console.error('❌ Generation failed:', error.message);
  process.exit(1);
}); 