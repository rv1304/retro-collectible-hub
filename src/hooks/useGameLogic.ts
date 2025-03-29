
import { useState, useRef, useCallback } from 'react';
import { GameObstacle, GameCoin } from '@/types/gameTypes';

interface UseGameLogicProps {
  onScoreChange?: (score: number) => void;
}

export const useGameLogic = ({ onScoreChange }: UseGameLogicProps) => {
  // Game state
  const [isJumping, setIsJumping] = useState(false);
  const [isDucking, setIsDucking] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<GameObstacle[]>([]);
  const [coins, setCoins] = useState<GameCoin[]>([]);
  const [groundPosition, setGroundPosition] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(5);
  
  // Refs for animation and timing
  const frameRef = useRef(0);
  const lastObstacleRef = useRef(0);
  const lastCoinRef = useRef(0);
  
  // Reset the game
  const resetGame = useCallback(() => {
    setIsJumping(false);
    setIsDucking(false);
    setScore(0);
    setGameOver(false);
    setObstacles([]);
    setCoins([]);
    setGroundPosition(0);
    setGameSpeed(5);
    lastObstacleRef.current = 0;
    lastCoinRef.current = 0;
    
    if (onScoreChange) onScoreChange(0);
  }, [onScoreChange]);
  
  return {
    // State
    isJumping,
    isDucking,
    score,
    gameOver,
    obstacles,
    coins,
    groundPosition,
    gameSpeed,
    
    // State setters
    setIsJumping,
    setIsDucking,
    setScore,
    setGameOver,
    setObstacles,
    setCoins,
    setGroundPosition,
    setGameSpeed,
    
    // Refs
    frameRef,
    lastObstacleRef,
    lastCoinRef,
    
    // Methods
    resetGame
  };
};
