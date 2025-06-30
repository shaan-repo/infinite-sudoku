import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        {children}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg w-full">OK</button>
      </div>
    </div>
  );
};

export default Modal; 