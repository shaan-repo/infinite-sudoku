import React from 'react';
import Modal from './Modal';

type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

interface VictoryModalProps {
  open: boolean;
  onClose: () => void;
  difficulty: Difficulty;
  time: string;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ open, onClose, difficulty, time }) => {
  const getVictoryContent = () => {
    switch (difficulty) {
      case 'easy':
        return {
          emoji: '🤨',
          title: 'Too easy!',
          message: 'You\'re better than this.',
          subtitle: 'Assuming you were just in a hurry.'
        };
      case 'medium':
        return {
          emoji: '🙂',
          title: 'Not bad!',
          message: 'Solid work, depending on your time.',
          subtitle: 'Time to move up.'
        };
      case 'hard':
        return {
          emoji: '🔥',
          title: 'Damn!',
          message: 'You\'re starting to cook',
          subtitle: 'Ready to move up again?'
        };
      case 'extreme':
        return {
          emoji: '👑',
          title: 'You\'re Goated',
          message: 'If you\'re reading this, I\'m creating harder puzzles.',
          subtitle: 'You are #that guy.'
        };
      default:
        return {
          emoji: '🎉',
          title: 'Puzzle Complete!',
          message: 'Congratulations on solving the puzzle!',
          subtitle: 'Great job!'
        };
    }
  };

  const content = getVictoryContent();

  return (
    <Modal
      open={open}
      onClose={onClose}
      buttonText="Start Again"
    >
      <div className="text-center">
        <div className="text-4xl mb-2">{content.emoji}</div>
        <div className="text-xl font-medium text-slate-700 mb-2">{content.title}</div>
        <div className="text-slate-600 mb-2">{content.message}</div>
        <div className="text-sm text-slate-500 mb-3">{content.subtitle}</div>
        <div className="text-lg font-mono text-blue-500">Final time: {time}</div>
      </div>
    </Modal>
  );
};

export default VictoryModal; 