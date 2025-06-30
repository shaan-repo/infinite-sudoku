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
          emoji: '😊',
          title: 'Easy Victory!',
          message: 'Great start! You\'ve mastered the basics.',
          subtitle: 'Ready for a bigger challenge?'
        };
      case 'medium':
        return {
          emoji: '🎯',
          title: 'Medium Mastery!',
          message: 'Well done! You\'re getting the hang of this.',
          subtitle: 'Your skills are growing!'
        };
      case 'hard':
        return {
          emoji: '🔥',
          title: 'Hard Challenge Conquered!',
          message: 'Impressive! You\'ve tackled a tough puzzle.',
          subtitle: 'You\'re becoming a Sudoku expert!'
        };
      case 'extreme':
        return {
          emoji: '👑',
          title: 'Extreme Victory!',
          message: 'Incredible! You\'ve conquered the ultimate challenge.',
          subtitle: 'You are a Sudoku master!'
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
      buttonIcon={
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2v3M12 19v3M5 12H2M21 12h3M18.364 18.364l-1.414-1.414M7.05 7.05L5.636 5.636M18.364 5.636l-1.414 1.414M7.05 16.95L5.636 18.364"/>
        </svg>
      }
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