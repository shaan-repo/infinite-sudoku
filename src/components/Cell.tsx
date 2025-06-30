import React from 'react';

interface CellProps {
  value: number;
  isSelected: boolean;
  isInitialSelected: boolean;
  isConflicted: boolean;
  isInitial: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  onClick: () => void;
  borderClass?: string;
  children?: React.ReactNode;
}

const Cell: React.FC<CellProps> = ({ value, isSelected, isInitialSelected, isConflicted, isHighlighted, isSameNumber, isInitial, onClick, borderClass = '', children }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        aspect-square flex items-center justify-center text-lg font-medium cursor-pointer
        transition-all duration-200 relative
        ${borderClass}
        ${isConflicted
          ? 'bg-red-100/80 text-red-700 ring-1 ring-red-300'
          : isSelected
          ? 'bg-blue-100/80 ring-2 ring-blue-400 ring-inset'
          : isInitialSelected
          ? 'ring-2 ring-slate-600 ring-inset'
          : isSameNumber
          ? 'bg-blue-200/70'
          : isHighlighted
          ? 'bg-blue-100/60'
          : isInitial
          ? 'bg-slate-50/80 text-slate-700'
          : value !== 0
          ? 'bg-white/80 text-blue-600 hover:bg-blue-50/80'
          : 'bg-white/80 hover:bg-blue-50/60'
        }
      `}
    >
      {value !== 0 && (
        <span className={`${isInitial ? 'font-semibold' : 'font-medium'}`}>{value}</span>
      )}
      {children}
    </div>
  );
};

export default Cell; 