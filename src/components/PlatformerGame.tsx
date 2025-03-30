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
    updateShieldTimer,
    checkPixelCollision
  } = useGameLogic({ onScoreChange });
  
  const { handleJump, handleDuck } = useGameControls({
    isJumping,
    gameOver,
    setIsJumping,
    setIsDucking
  });
  
  const playerWidth = 30;
  const playerHeight = 40;
  const playerBottom = 40;
  const groundHeight = 10;
  const obstacleWidth = 25;
  const powerUpWidth = 25;
  
  const [jumpProgress, setJumpProgress] = useState(0);
  const jumpAnimationRef = useRef<Animation | null>(null);
  
  const getPlayerY = () => {
    if (!isJumping) return playerBottom;
    
    const jumpHeight = 80;
    const height = 4 * jumpHeight * jumpProgress * (1 - jumpProgress);
    return playerBottom + height;
  };
  
  useEffect(() => {
    if (isJumping) {
      const jumpElement = document.querySelector('.animate-player-jump');
      if (jumpElement) {
        const animations = jumpElement.getAnimations();
        if (animations.length > 0) {
          jumpAnimationRef.current = animations[0];
          
          const updateProgress = () => {
            const animation = jumpAnimationRef.current;
            if (animation) {
              const currentTime = animation.currentTime || 0;
              const totalDuration = animation.effect?.getTiming().duration || 600;
              const normalizedProgress = Math.min(1, Math.max(0, currentTime as number / (totalDuration as number)));
              setJumpProgress(normalizedProgress);
            }
            
            if (isJumping) {
              requestAnimationFrame(updateProgress);
            }
          };
          
          requestAnimationFrame(updateProgress);
        }
      }
    } else {
      setJumpProgress(0);
    }
  }, [isJumping]);
  
  const incrementScore = () => {
    setScore(prev => {
      const newScore = prev + 1;
      if (onScoreChange) onScoreChange(newScore);
      
      if (newScore % 500 === 0) {
        setGameSpeed(prev => Math.min(prev + 1, 15));
      }
      
      return newScore;
    });
  };
  
  const generateObstacles = () => {
    const now = Date.now();
    if (now - lastObstacleRef.current > 1500 + Math.random() * 1000) {
      lastObstacleRef.current = now;
      
      const type = Math.random() < 0.3 ? 'bird' : 'cactus';
      
      setObstacles(prev => [
        ...prev, 
        { type, position: gameRef.current?.offsetWidth || 800 }
      ]);
    }
  };
  
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
  
  const generatePowerUps = () => {
    const now = Date.now();
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
  
  const moveGameElements = () => {
    setObstacles(prev => 
      prev.map(obstacle => ({
        ...obstacle,
        position: obstacle.position - gameSpeed
      }))
    );
    
    setCoins(prev => 
      prev.map(coin => ({
        ...coin,
        position: coin.position - gameSpeed
      }))
    );
    
    setPowerUps(prev => 
      prev.map(powerUp => ({
        ...powerUp,
        position: powerUp.position - gameSpeed
      }))
    );
  };
  
  const checkCollision = () => {
    if (!gameRef.current) return;
    
    const gameWidth = gameRef.current.offsetWidth;
    const gameHeight = gameRef.current.offsetHeight;
    const playerX = 60;
    const playerY = gameHeight - groundHeight - playerHeight - getPlayerY();
    const actualPlayerHeight = isDucking ? playerHeight / 2 : playerHeight;
    
    checkObstacleCollisions(playerX, playerY, actualPlayerHeight, gameHeight);
    
    checkCoinCollisions(playerX, playerY, actualPlayerHeight, gameHeight);
    
    checkPowerUpCollisions(playerX, playerY, actualPlayerHeight, gameHeight);
  };
  
  const checkObstacleCollisions = (playerX: number, playerY: number, actualPlayerHeight: number, gameHeight: number) => {
    obstacles.forEach((obstacle, index) => {
      if (obstacle.position + obstacleWidth < 0) {
        setObstacles(prev => prev.filter((_, i) => i !== index));
        return;
      }
      
      const obstacleX = obstacle.position;
      const obstacleHeight = obstacle.type === 'cactus' ? 30 : 20;
      const obstacleY = gameHeight - groundHeight - obstacleHeight;
      
      if (checkPixelCollision(
        playerX, 
        playerY, 
        playerWidth, 
        actualPlayerHeight,
        obstacleX,
        obstacleY,
        obstacleWidth,
        obstacleHeight
      )) {
        if (!gameOver) {
          if (playerStatus.hasShield) {
            setPlayerStatus({
              hasShield: false,
              shieldTimeRemaining: 0
            });
            setObstacles(prev => prev.filter((_, i) => i !== index));
          } else {
            setGameOver(true);
            if (onHeartLost) onHeartLost();
            if (onGameOver) onGameOver();
          }
        }
      }
    });
  };
  
  const checkCoinCollisions = (playerX: number, playerY: number, actualPlayerHeight: number, gameHeight: number) => {
    coins.forEach((coin, index) => {
      if (coin.position + 20 < 0) {
        setCoins(prev => prev.filter((_, i) => i !== index));
        return;
      }
      
      const coinX = coin.position;
      const coinY = gameHeight - groundHeight - 20;
      const coinSize = 15;
      
      if (!coin.collected && checkPixelCollision(
        playerX,
        playerY,
        playerWidth,
        actualPlayerHeight,
        coinX,
        coinY,
        coinSize,
        coinSize
      )) {
        setCoins(prev => prev.map((c, i) => 
          i === index ? { ...c, collected: true } : c
        ));
        updateScoreForCoinCollection();
        if (onCoinCollected) {
          onCoinCollected(1);
        }
      }
    });
  };
  
  const checkPowerUpCollisions = (playerX: number, playerY: number, actualPlayerHeight: number, gameHeight: number) => {
    powerUps.forEach((powerUp, index) => {
      if (powerUp.position + powerUpWidth < 0) {
        setPowerUps(prev => prev.filter((_, i) => i !== index));
        return;
      }
      
      const powerUpX = powerUp.position;
      const powerUpY = gameHeight - groundHeight - 20;
      const powerUpSize = 20;
      
      if (!powerUp.collected && checkPixelCollision(
        playerX,
        playerY,
        playerWidth,
        actualPlayerHeight,
        powerUpX,
        powerUpY,
        powerUpSize,
        powerUpSize
      )) {
        setPowerUps(prev => prev.map((p, i) => 
          i === index ? { ...p, collected: true } : p
        ));
        applyPowerUpEffect(powerUp.type);
        if (onPowerUpCollected) {
          onPowerUpCollected(powerUp.type);
        }
      }
    });
  };
  
  const applyPowerUpEffect = (type: string) => {
    switch (type) {
      case 'shield':
        applyShield();
        break;
      default:
        console.warn(`Unknown power-up type: ${type}`);
    }
  };
  
  const updateScoreForCoinCollection = () => {
    setScore(prev => {
      const newScore = prev + 50;
      if (onScoreChange) onScoreChange(newScore);
      return newScore;
    });
  };
  
  useEffect(() => {
    if (gameOver) return;
    
    const gameLoop = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;
      
      setGroundPosition(prev => (prev - gameSpeed) % 100);
      
      incrementScore();
      
      generateObstacles();
      generateCoins();
      generatePowerUps();
      moveGameElements();
      
      updateShieldTimer(deltaTime);
      
      checkCollision();
      
      frameRef.current = requestAnimationFrame(gameLoop);
    };
    
    lastTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [gameOver, isDucking, isJumping, playerStatus, updateShieldTimer, gameSpeed, setGroundPosition]);
  
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
  
  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, []);
  
  const getShieldTimePercentage = () => {
    if (!playerStatus.hasShield) return 0;
    return (playerStatus.shieldTimeRemaining / 10000) * 100;
  };
  
  const [showHitboxes, setShowHitboxes] = useState(false);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'KeyD') {
        setShowHitboxes(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
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
      <div className="absolute top-2 left-2 font-pixel text-retro-neon-green text-xs">
        SCORE: {score} {showHitboxes && '(DEBUG: ON)'}
      </div>
      
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
          <div className="bg-retro-arcade-black/80 p-3 rounded-md">
            <h3 className="font-pixel text-retro-neon-pink text-lg mb-2">GAME OVER!</h3>
            <p className="font-pixel text-retro-neon-yellow text-xs">Click or press 'R' to restart</p>
          </div>
        </div>
      )}
      
      <div 
        className="absolute bottom-0 left-0 right-0 h-10 bg-retro-neon-green/50 border-t-2 border-retro-neon-green"
        style={{ 
          backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)',
          backgroundSize: '100px 100%',
          backgroundPosition: `${groundPosition}px 0`
        }}
      />
      
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
        <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
        
        {playerStatus.hasShield && (
          <div className="absolute inset-0 border-2 border-retro-neon-blue rounded-sm animate-pulse" />
        )}
        
        {showHitboxes && (
          <div className="absolute inset-0 border-2 border-red-500 rounded-sm" />
        )}
      </div>
      
      <div className="absolute top-10 left-2 w-20 h-2 bg-retro-arcade-black border border-retro-neon-blue">
        <div 
          className="h-full bg-retro-neon-blue"
          style={{ width: `${getShieldTimePercentage()}%` }}
        />
      </div>
      
      {obstacles.map((obstacle, index) => (
        <div 
          key={index}
          className={cn(
            "absolute z-5",
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
            bottom: obstacle.type === 'bird' ? `${playerBottom + 30}px` : `${groundHeight}px`,
          }}
        >
          {showHitboxes && (
            <div className="absolute inset-0 border-2 border-red-500 rounded-sm" />
          )}
        </div>
      ))}
      
      {coins.map((coin, index) => (
        !coin.collected && (
          <div 
            key={`coin-${index}`}
            className="absolute"
            style={{
              left: `${coin.position}px`,
              bottom: `${groundHeight + 50}px`,
              width: '15px',
              height: '15px',
              backgroundColor: '#FFEB3B',
              borderRadius: '50%',
              border: '2px solid #000',
              boxShadow: '0 0 10px rgba(255,235,59,0.9)',
              animation: 'pixel-pulse 0.5s infinite alternate'
            }}
          >
            {showHitboxes && (
              <div className="absolute inset-0 border-2 border-blue-500 rounded-sm" />
            )}
          </div>
        )
      ))}
      
      {powerUps.map((powerUp, index) => (
        !powerUp.collected && (
          <div 
            key={`powerup-${index}`}
            className="absolute"
            style={{
              left: `${powerUp.position}px`,
              bottom: `${groundHeight + 50}px`,
              width: '20px',
              height: '20px',
              backgroundColor: '#00FFFF',
              borderRadius: powerUp.type === 'shield' ? '50%' : '4px',
              border: '2px solid #000',
              boxShadow: '0 0 15px rgba(0,255,255,0.9)',
              animation: 'bounce-small 0.5s infinite alternate'
            }}
          >
            {powerUp.type === 'shield' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-t-2 border-r-2 border-l-2 border-retro-arcade-black rounded-t-full transform rotate-180" />
              </div>
            )}
            
            {showHitboxes && (
              <div className="absolute inset-0 border-2 border-blue-500 rounded-sm" />
            )}
          </div>
        )
      ))}
      
      <div className="absolute top-2 right-2 font-pixel text-retro-neon-green text-xs">
        {!gameOver ? "JUMP: SPACE/UP/CLICK | DUCK: DOWN" : ""}
      </div>
    </div>
  );
};

export default PlatformerGame;
