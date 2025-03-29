
import { useCallback } from 'react';

interface UseGameControlsProps {
  isJumping: boolean;
  gameOver: boolean;
  setIsJumping: (value: boolean) => void;
  setIsDucking: (value: boolean) => void;
}

export const useGameControls = ({ 
  isJumping, 
  gameOver, 
  setIsJumping, 
  setIsDucking 
}: UseGameControlsProps) => {
  // Jump function
  const handleJump = useCallback(() => {
    if (!isJumping && !gameOver) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 600);
    }
  }, [isJumping, gameOver, setIsJumping]);
  
  // Duck function
  const handleDuck = useCallback((isDucking: boolean) => {
    if (!gameOver && !isJumping) {
      setIsDucking(isDucking);
    }
  }, [gameOver, isJumping, setIsDucking]);
  
  return {
    handleJump,
    handleDuck
  };
};
