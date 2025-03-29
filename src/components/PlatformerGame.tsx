
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameControls } from '@/hooks/useGameControls';
import { GameObstacle, GameCoin } from '@/types/gameTypes';

interface PlatformerGameProps {
  className?: string;
  onScoreChange?: (score: number) => void;
  onGameOver?: () => void;
  onHeartLost?: () => void;
  onCoinCollected?: (coins: number) => void;
}

const PlatformerGame = ({ 
  className, 
  onScoreChange, 
  onGameOver,
  onHeartLost,
  onCoinCollected 
}: PlatformerGameProps) => {
  const gameRef = useRef<HTMLDivElement>(null);
  
  // Use custom hooks for game logic and controls
  const {
    isJumping,
    isDucking,
    score,
    gameOver,
    obstacles,
    coins,
    groundPosition,
    gameSpeed,
    resetGame,
    setIsJumping,
    setIsDucking,
    setGameOver,
    setObstacles,
    setCoins,
    setGroundPosition,
    setGameSpeed,
    setScore,
    frameRef,
    lastObstacleRef,
    lastCoinRef
  } = useGameLogic({ onScoreChange });
  
  const { handleJump, handleDuck } = useGameControls({
    isJumping,
    gameOver,
    setIsJumping,
    setIsDucking
  });
  
  // Game dimensions - could be moved to a constants file in a larger project
  const playerWidth = 30;
  const playerHeight = 40;
  const playerBottom = 10;
  const obstacleWidth = 25;
  
  // Check for collisions between player and game elements
  const checkCollision = () => {
    if (!gameRef.current) return;
    
    const gameWidth = gameRef.current.offsetWidth;
    const playerPosition = 60; // Fixed x position of player
    
    // Check obstacle collisions
    checkObstacleCollisions(playerPosition);
    
    // Check coin collisions
    checkCoinCollisions(playerPosition);
  };
  
  // Handle obstacle collision detection
  const checkObstacleCollisions = (playerPosition: number) => {
    obstacles.forEach((obstacle, index) => {
      // Remove off-screen obstacles
      if (obstacle.position + obstacleWidth < 0) {
        setObstacles(prev => prev.filter((_, i) => i !== index));
        return;
      }
      
      if (isColliding(playerPosition, obstacle.position, obstacleWidth)) {
        const playerCurrentHeight = isDucking ? playerHeight / 2 : playerHeight;
        const obstacleTop = obstacle.type === 'bird' ? 50 : 100 - playerBottom - obstacleWidth;
        
        const birdCollision = obstacle.type === 'bird' && !isDucking && !isJumping;
        const cactusCollision = obstacle.type === 'cactus' && !isJumping;
        
        if ((birdCollision || cactusCollision) && !gameOver) {
          setGameOver(true);
          if (onHeartLost) onHeartLost();
          if (onGameOver) onGameOver();
        }
      }
    });
  };
  
  // Handle coin collision detection
  const checkCoinCollisions = (playerPosition: number) => {
    coins.forEach((coin, index) => {
      // Remove off-screen coins
      if (coin.position + 20 < 0) {
        setCoins(prev => prev.filter((_, i) => i !== index));
        return;
      }
      
      if (!coin.collected && isColliding(playerPosition, coin.position, 20)) {
        // Automatically collect coin
        setCoins(prev => prev.map((c, i) => 
          i === index ? { ...c, collected: true } : c
        ));
        
        // Update score and trigger coin collection callback
        updateScoreForCoinCollection();
        
        // Trigger coin collection callback
        if (onCoinCollected) {
          onCoinCollected(1);  // Collect 1 coin
        }
      }
    });
  };
  
  // Update score when collecting a coin
  const updateScoreForCoinCollection = () => {
    setScore(prev => {
      const newScore = prev + 50;
      if (onScoreChange) onScoreChange(newScore);
      return newScore;
    });
  };
  
  // Helper to determine if two objects are colliding
  const isColliding = (playerPos: number, objectPos: number, objectWidth: number) => {
    return objectPos > playerPos - objectWidth && objectPos < playerPos + playerWidth;
  };
  
  // Game loop
  useEffect(() => {
    if (gameOver) return;
    
    const gameLoop = () => {
      // Move ground
      setGroundPosition(prev => (prev - gameSpeed) % 100);
      
      // Increase score over time
      incrementScore();
      
      // Generate and manage game elements
      generateObstacles();
      generateCoins();
      moveGameElements();
      
      // Check for collisions
      checkCollision();
      
      // Continue game loop
      frameRef.current = requestAnimationFrame(gameLoop);
    };
    
    frameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [gameOver, isDucking, isJumping]);
  
  // Increment score and adjust game speed
  const incrementScore = () => {
    setScore(prev => {
      const newScore = prev + 1;
      if (onScoreChange) onScoreChange(newScore);
      
      // Increase game speed every 500 points
      if (newScore % 500 === 0) {
        setGameSpeed(prev => Math.min(prev + 1, 15));
      }
      
      return newScore;
    });
  };
  
  // Generate obstacles
  const generateObstacles = () => {
    const now = Date.now();
    if (now - lastObstacleRef.current > 1500 + Math.random() * 1000) {
      lastObstacleRef.current = now;
      
      // 30% chance of bird, 70% chance of cactus
      const type = Math.random() < 0.3 ? 'bird' : 'cactus';
      
      setObstacles(prev => [
        ...prev, 
        { type, position: gameRef.current?.offsetWidth || 800 }
      ]);
    }
  };
  
  // Generate coins
  const generateCoins = () => {
    const now = Date.now();
    if (now - lastCoinRef.current > 2000 + Math.random() * 2000) {
      lastCoinRef.current = now;
      
      setCoins(prev => [
        ...prev, 
        { position: gameRef.current?.offsetWidth || 800, collected: false }
      ]);
    }
  };
  
  // Move obstacles and coins
  const moveGameElements = () => {
    // Move obstacles
    setObstacles(prev => 
      prev.map(obstacle => ({
        ...obstacle,
        position: obstacle.position - gameSpeed
      }))
    );
    
    // Move coins
    setCoins(prev => 
      prev.map(coin => ({
        ...coin,
        position: coin.position - gameSpeed
      }))
    );
  };
  
  // Handle key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !gameOver) {
        handleJump();
      }
      if (e.code === 'ArrowDown' && !gameOver) {
        handleDuck(true);
      }
      if (e.code === 'KeyR' && gameOver) {
        resetGame();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        handleDuck(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isJumping, gameOver, handleJump, handleDuck, resetGame]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, []);
  
  // Render the game
  return (
    <div 
      ref={gameRef}
      className={cn(
        "relative w-full h-48 bg-gradient-to-b from-retro-neon-blue to-retro-arcade-black overflow-hidden border-2 border-retro-neon-pink",
        gameOver ? "opacity-80" : "",
        className
      )}
      onClick={gameOver ? resetGame : handleJump}
    >
      {/* Game info overlay */}
      <div className="absolute top-2 left-2 font-pixel text-retro-neon-green text-xs">
        SCORE: {score}
      </div>
      
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
          <div className="bg-retro-arcade-black/80 p-3 rounded-md">
            <h3 className="font-pixel text-retro-neon-pink text-lg mb-2">GAME OVER!</h3>
            <p className="font-pixel text-retro-neon-yellow text-xs">Click or press 'R' to restart</p>
          </div>
        </div>
      )}
      
      {/* Ground with moving texture */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-10 bg-retro-neon-green/50 border-t-2 border-retro-neon-green"
        style={{ 
          backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)',
          backgroundSize: '100px 100%',
          backgroundPosition: `${groundPosition}px 0`
        }}
      />
      
      {/* Player character */}
      <div 
        className={cn(
          "absolute left-10 z-10",
          isJumping ? "animate-player-jump" : "",
          isDucking ? "w-10 h-5" : "w-8 h-10",
        )}
        style={{ 
          bottom: `${playerBottom}px`,
          transition: "height 0.1s",
          backgroundColor: '#FF5722',
          borderRadius: '4px',
          border: '2px solid #000',
          boxShadow: '0 0 10px rgba(255,87,34,0.7)'
        }}
      >
        {/* Eyes */}
        <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
      </div>
      
      {/* Obstacles */}
      {obstacles.map((obstacle, index) => (
        <div 
          key={index}
          className={cn(
            "absolute bottom-10 z-5",
            obstacle.type === 'cactus' ? "bg-retro-neon-green" : "bg-retro-neon-yellow",
          )}
          style={{
            left: `${obstacle.position}px`,
            width: `${obstacleWidth}px`,
            height: obstacle.type === 'cactus' ? '30px' : '20px',
            borderRadius: '2px',
            border: '2px solid #000',
            boxShadow: obstacle.type === 'cactus' 
              ? '0 0 8px rgba(0,255,0,0.7)' 
              : '0 0 8px rgba(255,255,0,0.7)',
            bottom: obstacle.type === 'bird' ? '40px' : '10px',
          }}
        />
      ))}
      
      {/* Coins */}
      {coins.map((coin, index) => (
        !coin.collected && (
          <div 
            key={index}
            className="absolute"
            style={{
              left: `${coin.position}px`,
              bottom: '60px',
              width: '15px',
              height: '15px',
              backgroundColor: '#FFEB3B',
              borderRadius: '50%',
              border: '2px solid #000',
              boxShadow: '0 0 10px rgba(255,235,59,0.9)',
              animation: 'pixel-pulse 0.5s infinite alternate'
            }}
          />
        )
      ))}
      
      {/* Instructions */}
      <div className="absolute top-2 right-2 font-pixel text-retro-neon-green text-xs">
        {!gameOver ? "JUMP: SPACE/UP/CLICK | DUCK: DOWN" : ""}
      </div>
    </div>
  );
};

export default PlatformerGame;
