import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, buttonText = 'OK', buttonIcon }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 max-w-xs w-full mx-4 border border-blue-100">
        {children}
        <button onClick={onClose} className="mt-3 px-3 py-2 bg-blue-400 text-white rounded-lg w-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-blue-500 transition-all duration-300 shadow-md hover:shadow-lg">
          {buttonIcon}
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Modal; 