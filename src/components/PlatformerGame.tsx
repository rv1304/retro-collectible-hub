
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PlatformerGameProps {
  className?: string;
  onScoreChange?: (score: number) => void;
  onGameOver?: () => void;
  onHeartLost?: () => void;
}

const PlatformerGame = ({ 
  className, 
  onScoreChange, 
  onGameOver,
  onHeartLost 
}: PlatformerGameProps) => {
  // Game state
  const [isJumping, setIsJumping] = useState(false);
  const [isDucking, setIsDucking] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<{type: 'cactus' | 'bird'; position: number}[]>([]);
  const [coins, setCoins] = useState<{position: number; collected: boolean}[]>([]);
  const [groundPosition, setGroundPosition] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(5);
  const gameRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const lastObstacleRef = useRef(0);
  const lastCoinRef = useRef(0);
  
  // Game dimensions
  const playerWidth = 30;
  const playerHeight = 40;
  const playerBottom = 10;
  const obstacleWidth = 25;
  
  // Reset the game
  const resetGame = () => {
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
  };
  
  // Jump function
  const handleJump = () => {
    if (!isJumping && !gameOver) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 600);
    }
  };
  
  // Duck function
  const handleDuck = (isDucking: boolean) => {
    if (!gameOver && !isJumping) {
      setIsDucking(isDucking);
    }
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
  }, [isJumping, gameOver]);
  
  // Detect collisions
  const checkCollision = () => {
    if (gameRef.current) {
      const gameWidth = gameRef.current.offsetWidth;
      const playerPosition = 60; // Fixed x position of player
      
      obstacles.forEach((obstacle, index) => {
        const obstaclePosition = obstacle.position;
        
        if (
          obstaclePosition > playerPosition - obstacleWidth && 
          obstaclePosition < playerPosition + playerWidth
        ) {
          // Check vertical collision - different for ducking
          const playerCurrentHeight = isDucking ? playerHeight / 2 : playerHeight;
          const playerTop = 100 - playerBottom - playerCurrentHeight;
          
          // Bird obstacles fly higher
          const obstacleTop = obstacle.type === 'bird' ? 50 : 100 - playerBottom - obstacleWidth;
          
          // Adjust collision detection based on jumping/ducking
          const birdCollision = obstacle.type === 'bird' && !isDucking && !isJumping;
          const cactusCollision = obstacle.type === 'cactus' && !isJumping;
          
          if (birdCollision || cactusCollision) {
            if (!gameOver) {
              setGameOver(true);
              if (onHeartLost) onHeartLost();
              if (onGameOver) onGameOver();
            }
          }
        }
        
        // Check if obstacle is off-screen to remove it
        if (obstaclePosition + obstacleWidth < 0) {
          setObstacles(prev => prev.filter((_, i) => i !== index));
        }
      });
      
      // Check coin collisions
      coins.forEach((coin, index) => {
        const coinPosition = coin.position;
        
        if (
          !coin.collected &&
          coinPosition > playerPosition - 20 && 
          coinPosition < playerPosition + playerWidth
        ) {
          // If player is at right height to collect coin
          setCoins(prev => prev.map((c, i) => 
            i === index ? { ...c, collected: true } : c
          ));
          
          setScore(prev => {
            const newScore = prev + 50;
            if (onScoreChange) onScoreChange(newScore);
            return newScore;
          });
        }
        
        // Remove off-screen coins
        if (coinPosition + 20 < 0) {
          setCoins(prev => prev.filter((_, i) => i !== index));
        }
      });
    }
  };
  
  // Game loop
  useEffect(() => {
    if (gameOver) return;
    
    const gameLoop = () => {
      // Move ground
      setGroundPosition(prev => (prev - gameSpeed) % 100);
      
      // Increase score over time
      setScore(prev => {
        const newScore = prev + 1;
        if (onScoreChange) onScoreChange(newScore);
        
        // Increase game speed every 500 points
        if (newScore % 500 === 0) {
          setGameSpeed(prev => Math.min(prev + 1, 15));
        }
        
        return newScore;
      });
      
      // Generate obstacles
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
      
      // Generate coins
      if (now - lastCoinRef.current > 2000 + Math.random() * 2000) {
        lastCoinRef.current = now;
        
        setCoins(prev => [
          ...prev, 
          { position: gameRef.current?.offsetWidth || 800, collected: false }
        ]);
      }
      
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
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, []);
  
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
          backgroundColor: '#FF5722', // Mario red
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
              backgroundColor: '#FFEB3B', // Bright yellow
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
