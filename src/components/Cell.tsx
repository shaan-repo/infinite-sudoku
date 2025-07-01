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
  isWrongInput?: boolean;
  notes?: number[];
}

const Cell: React.FC<CellProps> = ({ value, isSelected, isInitialSelected, isConflicted, isHighlighted, isSameNumber, isInitial, onClick, borderClass = '', children, isWrongInput, notes = [] }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        aspect-square flex items-center justify-center text-lg font-medium cursor-pointer
        transition-all duration-200 relative
        ${borderClass}
        ${isConflicted
          ? 'bg-red-100/80 text-red-700 ring-1 ring-red-300'
          : isWrongInput
          ? 'bg-rose-100/80 text-rose-700 ring-1 ring-rose-300'
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
      {value === 0 && notes.length > 0 && (
        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none select-none p-[2px]">
          <div className="grid grid-cols-3 grid-rows-3 w-[85%] h-[85%] text-[0.5rem] text-slate-400 font-normal">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="flex items-center justify-center min-h-[8px] min-w-[8px]">
                {notes.includes(i + 1) ? i + 1 : ''}
              </div>
            ))}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default Cell; 