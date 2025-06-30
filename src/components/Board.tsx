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
  return (
    <div className="grid grid-cols-9 gap-0 border-2 border-slate-300 rounded-lg overflow-hidden bg-white shadow-inner">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          // Calculate border classes for 3x3 grid and cell separation
          const borderClass = `
            ${(rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? 'border-b-2 border-slate-300' : 'border-b border-slate-200'}
            ${(colIndex + 1) % 3 === 0 && colIndex !== 8 ? 'border-r-2 border-slate-300' : 'border-r border-slate-200'}
          `;
          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
              isConflicted={conflicts.has(`${rowIndex}-${colIndex}`)}
              isInitial={initialGrid[rowIndex][colIndex] !== 0}
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