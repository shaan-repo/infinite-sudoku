import React from 'react';
import Cell from './Cell';

type Grid = number[][];

type CellPosition = { row: number; col: number } | null;

interface BoardProps {
  grid: Grid;
  initialGrid: Grid;
  conflicts: Set<string>;
  selectedCell: CellPosition;
  handleCellClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ grid, initialGrid, conflicts, selectedCell, handleCellClick }) => {
  // Calculate which cells should be highlighted
  const getHighlightedCells = (): Set<string> => {
    const highlightedCells = new Set<string>();
    
    // Don't show blue highlighting if there are any conflicts
    if (conflicts.size > 0) return highlightedCells;
    
    if (!selectedCell) return highlightedCells;
    
    const { row, col } = selectedCell;
    const selectedValue = grid[row][col];
    
    // Only highlight if the selected cell has a number (is filled)
    if (selectedValue === 0) return highlightedCells;
    
    // Highlight the entire row and column
    for (let i = 0; i < 9; i++) {
      highlightedCells.add(`${row}-${i}`); // Row
      highlightedCells.add(`${i}-${col}`); // Column
    }
    
    return highlightedCells;
  };

  // Calculate which cells have the same number as selected cell
  const getSameNumberCells = (): Set<string> => {
    const sameNumberCells = new Set<string>();
    
    if (!selectedCell) return sameNumberCells;
    
    const { row, col } = selectedCell;
    const selectedValue = grid[row][col];
    
    // Only highlight same numbers if the selected cell has a number (is filled)
    if (selectedValue === 0) return sameNumberCells;
    
    // Highlight all cells with the same number
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === selectedValue) {
          sameNumberCells.add(`${r}-${c}`);
        }
      }
    }
    
    return sameNumberCells;
  };

  const highlightedCells = getHighlightedCells();
  const sameNumberCells = getSameNumberCells();

  return (
    <div className="grid grid-cols-9 gap-0 border-4 border-slate-500 rounded-lg overflow-hidden bg-white shadow-inner">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          // Calculate border classes for 3x3 grid and cell separation
          const borderClass = `
            ${(rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? 'border-b-2 border-slate-500' : 'border-b border-slate-400'}
            ${(colIndex + 1) % 3 === 0 && colIndex !== 8 ? 'border-r-2 border-slate-500' : 'border-r border-slate-400'}
          `;
          
          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isInitial = initialGrid[rowIndex][colIndex] !== 0;
          
          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              isSelected={isSelected && !isInitial}
              isInitialSelected={isSelected && isInitial}
              isConflicted={conflicts.has(`${rowIndex}-${colIndex}`)}
              isHighlighted={highlightedCells.has(`${rowIndex}-${colIndex}`)}
              isSameNumber={sameNumberCells.has(`${rowIndex}-${colIndex}`)}
              isInitial={isInitial}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              borderClass={borderClass}
            />
          );
        })
      )}
    </div>
  );
};

export default Board; 