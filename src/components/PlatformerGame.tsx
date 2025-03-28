
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PlatformerGameProps {
  className?: string;
}

const PlatformerGame = ({ className }: PlatformerGameProps) => {
  // Game state
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Jump function
  const handleJump = () => {
    if (!isJumping && !gameOver) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
      setScore(prev => prev + 10);
    }
  };
  
  // Handle key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'ArrowUp') && !gameOver) {
        handleJump();
      }
      if (e.key === 'r' && gameOver) {
        setGameOver(false);
        setScore(0);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isJumping, gameOver]);
  
  // Game loop interval - spawn enemies and detect collisions
  useEffect(() => {
    const gameInterval = setInterval(() => {
      // Random chance to end game (simulates collision)
      if (!gameOver && !isJumping && Math.random() < 0.05) {
        setGameOver(true);
      }
    }, 1000);
    
    return () => clearInterval(gameInterval);
  }, [isJumping, gameOver]);
  
  return (
    <div 
      className={cn(
        "relative w-full h-48 bg-gradient-to-b from-retro-neon-blue to-retro-arcade-black overflow-hidden border-2 border-retro-neon-pink",
        className
      )}
      onClick={gameOver ? () => { setGameOver(false); setScore(0); } : handleJump}
    >
      {/* Game info overlay */}
      <div className="absolute top-2 left-2 font-pixel text-retro-neon-green text-xs">
        SCORE: {score}
      </div>
      
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="bg-retro-arcade-black/80 p-3 rounded-md">
            <h3 className="font-pixel text-retro-neon-pink text-lg mb-2">GAME OVER!</h3>
            <p className="font-pixel text-retro-neon-yellow text-xs">Click or press 'R' to restart</p>
          </div>
        </div>
      )}
      
      {/* Game elements */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-retro-neon-green/50 border-t-2 border-retro-neon-green">
        {/* Ground */}
      </div>
      
      {/* Player character */}
      <div 
        className={cn(
          "absolute bottom-10 left-10 w-6 h-6 bg-retro-neon-yellow border border-retro-arcade-black",
          isJumping ? "animate-player-jump" : "",
          gameOver ? "opacity-50" : ""
        )}
      ></div>
      
      {/* Enemy */}
      {!gameOver && (
        <div className="absolute bottom-10 right-0 w-6 h-6 bg-retro-neon-pink border border-retro-arcade-black animate-enemy-move"></div>
      )}
      
      {/* Coins */}
      <div className="absolute top-20 right-1/4 w-4 h-4 rounded-full bg-retro-neon-yellow border border-retro-arcade-black animate-pixel-pulse"></div>
      <div className="absolute top-12 right-1/2 w-4 h-4 rounded-full bg-retro-neon-yellow border border-retro-arcade-black animate-pixel-pulse"></div>
      
      {/* Instructions */}
      <div className="absolute top-2 right-2 font-pixel text-retro-neon-green text-xs">
        {!gameOver ? "JUMP: SPACE/UP/CLICK" : ""}
      </div>
    </div>
  );
};

export default PlatformerGame;
