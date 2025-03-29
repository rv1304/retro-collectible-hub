
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameControls } from '@/hooks/useGameControls';
import { GameObstacle, GameCoin, GamePowerUp } from '@/types/gameTypes';

interface PlatformerGameProps {
  className?: string;
  onScoreChange?: (score: number) => void;
  onGameOver?: () => void;
  onHeartLost?: () => void;
  onCoinCollected?: (coins: number) => void;
  onPowerUpCollected?: (type: string) => void;
}

const PlatformerGame = ({ 
  className, 
  onScoreChange, 
  onGameOver,
  onHeartLost,
  onCoinCollected,
  onPowerUpCollected
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
    powerUps,
    groundPosition,
    gameSpeed,
    playerStatus,
    resetGame,
    setIsJumping,
    setIsDucking,
    setGameOver,
    setObstacles,
    setCoins,
    setPowerUps,
    setGroundPosition,
    setGameSpeed,
    setScore,
    setPlayerStatus,
    frameRef,
    lastObstacleRef,
    lastCoinRef,
    lastPowerUpRef,
    lastTimeRef,
    applyShield,
    updateShieldTimer
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
  const powerUpWidth = 25;
  
  // Check for collisions between player and game elements
  const checkCollision = () => {
    if (!gameRef.current) return;
    
    const gameWidth = gameRef.current.offsetWidth;
    const playerPosition = 60; // Fixed x position of player
    
    // Check obstacle collisions
    checkObstacleCollisions(playerPosition);
    
    // Check coin collisions
    checkCoinCollisions(playerPosition);
    
    // Check power-up collisions
    checkPowerUpCollisions(playerPosition);
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
          // Check if player has shield
          if (playerStatus.hasShield) {
            // Use shield to block damage
            setPlayerStatus({
              hasShield: false,
              shieldTimeRemaining: 0
            });
            
            // Remove the obstacle
            setObstacles(prev => prev.filter((_, i) => i !== index));
          } else {
            // No shield, game over
            setGameOver(true);
            if (onHeartLost) onHeartLost();
            if (onGameOver) onGameOver();
          }
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
  
  // Handle power-up collision detection
  const checkPowerUpCollisions = (playerPosition: number) => {
    powerUps.forEach((powerUp, index) => {
      // Remove off-screen power-ups
      if (powerUp.position + powerUpWidth < 0) {
        setPowerUps(prev => prev.filter((_, i) => i !== index));
        return;
      }
      
      if (!powerUp.collected && isColliding(playerPosition, powerUp.position, powerUpWidth)) {
        // Automatically collect power-up
        setPowerUps(prev => prev.map((p, i) => 
          i === index ? { ...p, collected: true } : p
        ));
        
        // Apply power-up effect
        applyPowerUpEffect(powerUp.type);
        
        // Trigger power-up collection callback
        if (onPowerUpCollected) {
          onPowerUpCollected(powerUp.type);
        }
      }
    });
  };
  
  // Apply power-up effect based on type
  const applyPowerUpEffect = (type: string) => {
    switch (type) {
      case 'shield':
        applyShield();
        break;
      default:
        console.warn(`Unknown power-up type: ${type}`);
    }
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
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;
      
      // Move ground
      setGroundPosition(prev => (prev - gameSpeed) % 100);
      
      // Increase score over time
      incrementScore();
      
      // Generate and manage game elements
      generateObstacles();
      generateCoins();
      generatePowerUps();
      moveGameElements();
      
      // Update shield timer
      updateShieldTimer(deltaTime);
      
      // Check for collisions
      checkCollision();
      
      // Continue game loop
      frameRef.current = requestAnimationFrame(gameLoop);
    };
    
    lastTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [gameOver, isDucking, isJumping, playerStatus]);
  
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
  
  // Generate power-ups
  const generatePowerUps = () => {
    const now = Date.now();
    // Make power-ups rarer than coins (every 10-20 seconds)
    if (now - lastPowerUpRef.current > 10000 + Math.random() * 10000) {
      lastPowerUpRef.current = now;
      
      setPowerUps(prev => [
        ...prev, 
        { 
          type: 'shield',
          position: gameRef.current?.offsetWidth || 800, 
          collected: false 
        }
      ]);
    }
  };
  
  // Move obstacles, coins, and power-ups
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
    
    // Move power-ups
    setPowerUps(prev => 
      prev.map(powerUp => ({
        ...powerUp,
        position: powerUp.position - gameSpeed
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
  
  // Get shield time as percentage
  const getShieldTimePercentage = () => {
    if (!playerStatus.hasShield) return 0;
    return (playerStatus.shieldTimeRemaining / 10000) * 100; // 10000ms is max shield time
  };
  
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
          backgroundColor: playerStatus.hasShield ? '#00FFFF' : '#FF5722',
          borderRadius: '4px',
          border: '2px solid #000',
          boxShadow: playerStatus.hasShield 
            ? '0 0 15px rgba(0,255,255,0.9)' 
            : '0 0 10px rgba(255,87,34,0.7)'
        }}
      >
        {/* Eyes */}
        <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
        
        {/* Shield indicator */}
        {playerStatus.hasShield && (
          <div className="absolute inset-0 border-2 border-retro-neon-blue rounded-sm animate-pulse" />
        )}
      </div>
      
      {/* Shield timer */}
      {playerStatus.hasShield && (
        <div className="absolute top-10 left-2 w-20 h-2 bg-retro-arcade-black border border-retro-neon-blue">
          <div 
            className="h-full bg-retro-neon-blue"
            style={{ width: `${getShieldTimePercentage()}%` }}
          />
        </div>
      )}
      
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
            key={`coin-${index}`}
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
      
      {/* Power-ups */}
      {powerUps.map((powerUp, index) => (
        !powerUp.collected && (
          <div 
            key={`powerup-${index}`}
            className="absolute"
            style={{
              left: `${powerUp.position}px`,
              bottom: '60px',
              width: '20px',
              height: '20px',
              backgroundColor: '#00FFFF',
              borderRadius: powerUp.type === 'shield' ? '50%' : '4px',
              border: '2px solid #000',
              boxShadow: '0 0 15px rgba(0,255,255,0.9)',
              animation: 'bounce-small 0.5s infinite alternate'
            }}
          >
            {/* Shield icon */}
            {powerUp.type === 'shield' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-t-2 border-r-2 border-l-2 border-retro-arcade-black rounded-t-full transform rotate-180" />
              </div>
            )}
          </div>
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
