
import { useState, useRef, useCallback } from 'react';
import { GameObstacle, GameCoin, GamePowerUp, PlayerStatus } from '@/types/gameTypes';

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
  const [powerUps, setPowerUps] = useState<GamePowerUp[]>([]);
  const [groundPosition, setGroundPosition] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(5);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>({
    hasShield: false,
    shieldTimeRemaining: 0
  });
  
  // Refs for animation and timing
  const frameRef = useRef(0);
  const lastObstacleRef = useRef(0);
  const lastCoinRef = useRef(0);
  const lastPowerUpRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  // Reset the game
  const resetGame = useCallback(() => {
    setIsJumping(false);
    setIsDucking(false);
    setScore(0);
    setGameOver(false);
    setObstacles([]);
    setCoins([]);
    setPowerUps([]);
    setGroundPosition(0);
    setGameSpeed(5);
    setPlayerStatus({
      hasShield: false,
      shieldTimeRemaining: 0
    });
    lastObstacleRef.current = 0;
    lastCoinRef.current = 0;
    lastPowerUpRef.current = 0;
    lastTimeRef.current = 0;
    
    if (onScoreChange) onScoreChange(0);
  }, [onScoreChange]);
  
  // Apply shield power-up
  const applyShield = useCallback(() => {
    setPlayerStatus({
      hasShield: true,
      shieldTimeRemaining: 10000 // 10 seconds
    });
  }, []);
  
  // Update shield timer
  const updateShieldTimer = useCallback((deltaTime: number) => {
    if (playerStatus.hasShield && playerStatus.shieldTimeRemaining > 0) {
      const newTimeRemaining = playerStatus.shieldTimeRemaining - deltaTime;
      
      if (newTimeRemaining <= 0) {
        // Shield expired
        setPlayerStatus({
          hasShield: false,
          shieldTimeRemaining: 0
        });
      } else {
        // Update shield time
        setPlayerStatus({
          ...playerStatus,
          shieldTimeRemaining: newTimeRemaining
        });
      }
    }
  }, [playerStatus]);

  // Check if two objects are colliding with pixel-perfect precision
  const checkPixelCollision = useCallback((
    playerX: number, 
    playerY: number, 
    playerWidth: number, 
    playerHeight: number,
    objectX: number,
    objectY: number,
    objectWidth: number,
    objectHeight: number
  ) => {
    // Even a 1% overlap should trigger collision
    return (
      playerX < objectX + objectWidth &&
      playerX + playerWidth > objectX &&
      playerY < objectY + objectHeight &&
      playerY + playerHeight > objectY
    );
  }, []);
  
  return {
    // State
    isJumping,
    isDucking,
    score,
    gameOver,
    obstacles,
    coins,
    powerUps,
    groundPosition,
    gameSpeed,
    playerStatus,
    
    // State setters
    setIsJumping,
    setIsDucking,
    setScore,
    setGameOver,
    setObstacles,
    setCoins,
    setPowerUps,
    setGroundPosition,
    setGameSpeed,
    setPlayerStatus,
    
    // Refs
    frameRef,
    lastObstacleRef,
    lastCoinRef,
    lastPowerUpRef,
    lastTimeRef,
    
    // Methods
    resetGame,
    applyShield,
    updateShieldTimer,
    checkPixelCollision
  };
};
