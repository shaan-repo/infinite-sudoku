import React from 'react';

interface CellProps {
  value: number;
  isSelected: boolean;
  isInitialSelected: boolean;
  isConflicted: boolean;
  isInitial: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  borderClass?: string;
  children?: React.ReactNode;
}

const Cell: React.FC<CellProps> = ({ value, isSelected, isInitialSelected, isConflicted, isHighlighted, isInitial, onClick, borderClass = '', children }) => {
  return (
    <div
      onClick={onClick}
      className={`
        aspect-square flex items-center justify-center text-lg font-medium cursor-pointer
        transition-all duration-200 relative
        ${borderClass}
        ${isConflicted
          ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
          : isSelected
          ? 'bg-blue-100 ring-2 ring-blue-400 ring-inset'
          : isInitialSelected
          ? 'ring-2 ring-black ring-inset'
          : isHighlighted
          ? 'bg-blue-100'
          : isInitial
          ? 'bg-slate-50 text-slate-800'
          : value !== 0
          ? 'bg-white text-blue-600 hover:bg-blue-50'
          : 'bg-white hover:bg-slate-50'
        }
      `}
    >
      {value !== 0 && (
        <span className={isInitial ? 'font-bold' : ''}>{value}</span>
      )}
      {children}
    </div>
  );
};

export default Cell; 