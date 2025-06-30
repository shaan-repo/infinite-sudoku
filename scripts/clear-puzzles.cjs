// Script to clear hard, extreme, or all puzzles from src/data/puzzles.ts
// Usage: node scripts/clear-puzzles.cjs [hard|extreme|all]

const fs = require('fs');
const path = require('path');

const mode = process.argv[2] || 'all'; // default to all if not specified
const validModes = ['hard', 'extreme', 'all'];
if (!validModes.includes(mode)) {
  console.error('Usage: node scripts/clear-puzzles.cjs [hard|extreme|all]');
  process.exit(1);
}

const puzzlesPath = path.join(__dirname, '..', 'src', 'data', 'puzzles.ts');
if (!fs.existsSync(puzzlesPath)) {
  console.error('puzzles.ts not found!');
  process.exit(1);
}

const content = fs.readFileSync(puzzlesPath, 'utf8');

// Extract the preGeneratedPuzzles array
const puzzlesArrayMatch = content.match(/export const preGeneratedPuzzles = \[(.|\n|\r)*?\];/);
if (!puzzlesArrayMatch) {
  console.error('Could not find preGeneratedPuzzles array in puzzles.ts');
  process.exit(1);
}

const puzzlesArrayText = puzzlesArrayMatch[0];
const puzzleRegex = /\["(hard|extreme)", \[[^\]]+\], \[[^\]]+\]\],?/g;
const keptPuzzles = [];
let match;
while ((match = puzzleRegex.exec(puzzlesArrayText)) !== null) {
  const difficulty = match[1];
  if (
    (mode === 'hard' && difficulty === 'extreme') ||
    (mode === 'extreme' && difficulty === 'hard')
  ) {
    keptPuzzles.push(match[0]);
  }
  // If mode is 'all', don't keep any
}

// Rebuild the puzzles array
const newPuzzlesArray = `export const preGeneratedPuzzles = [
${keptPuzzles.join('\n')}
];`;

// Replace the old puzzles array in the file
const newContent = content.replace(
  /export const preGeneratedPuzzles = \[(.|\n|\r)*?\];/,
  newPuzzlesArray
);

fs.writeFileSync(puzzlesPath, newContent);
console.log(`✅ Cleared ${mode === 'all' ? 'all' : mode} puzzles from puzzles.ts!`); 