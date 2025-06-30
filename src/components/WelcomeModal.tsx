import React from 'react';
import Modal from './Modal';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      buttonText="Enjoy :)"
      buttonIcon={
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M8 5v14l11-7z"/>
        </svg>
      }
    >
      <div className="text-center">
        <div className="text-4xl mb-3">🦋</div>
        <div className="text-2xl font-bold text-blue-700 mb-3">Hi Niki</div>
        <div className="text-slate-600 mb-4">
          I hope blue is still your favorite color because essentially every accent in the game is blue.
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal; 