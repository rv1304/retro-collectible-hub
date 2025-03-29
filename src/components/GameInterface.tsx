
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from './PixelButton';
import CollectibleItem from './CollectibleItem';
import PlatformerGame from './PlatformerGame';
import { useToast } from '@/hooks/use-toast';

// Game state interface
interface GameState {
  coins: number;
  keys: number;
  hearts: number;
  maxHearts: number;
  level: number;
  score: number;
  hasShield: boolean;
  heartCooldowns: number[];
}

const GameInterface = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    coins: 0,
    keys: 0,
    hearts: 3,
    maxHearts: 5,
    level: 1,
    score: 0,
    hasShield: false,
    heartCooldowns: [] // Timestamps for when hearts will regenerate
  });

  // Update the score from the platformer game
  const handleScoreChange = useCallback((newScore: number) => {
    setGameState(prev => ({
      ...prev,
      score: newScore
    }));
  }, []);

  // Handle losing a heart when dying in platformer
  const handleHeartLost = useCallback(() => {
    setGameState(prev => {
      // Only proceed if there are hearts left
      if (prev.hearts <= 0) return prev;

      const heartCooldowns = [...prev.heartCooldowns];
      // Add cooldown - 10 minutes from now
      const regenerateTime = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds
      heartCooldowns.push(regenerateTime);

      toast({
        title: "You lost a heart!",
        description: "A heart will regenerate in 10 minutes",
        duration: 3000,
      });

      return {
        ...prev,
        hearts: prev.hearts - 1,
        heartCooldowns
      };
    });
  }, [toast]);

  // Check heart cooldowns every second
  useEffect(() => {
    const heartTimer = setInterval(() => {
      const now = Date.now();
      
      setGameState(prev => {
        // Check for expired cooldowns
        if (prev.heartCooldowns.length === 0 || prev.hearts >= prev.maxHearts) {
          return prev;
        }

        const activeCooldowns = [];
        let heartsToAdd = 0;

        // Check each cooldown timestamp
        for (const timestamp of prev.heartCooldowns) {
          if (now >= timestamp) {
            // This heart can regenerate
            heartsToAdd++;
          } else {
            // This heart is still on cooldown
            activeCooldowns.push(timestamp);
          }
        }

        // If no hearts regenerated, no changes needed
        if (heartsToAdd === 0) return prev;

        // Calculate new heart count, not exceeding max
        const newHeartCount = Math.min(prev.hearts + heartsToAdd, prev.maxHearts);
        
        if (newHeartCount > prev.hearts) {
          toast({
            title: "Heart regenerated!",
            description: `You gained ${newHeartCount - prev.hearts} heart(s)`,
            duration: 3000,
          });
        }

        return {
          ...prev,
          hearts: newHeartCount,
          heartCooldowns: activeCooldowns
        };
      });
    }, 1000);

    return () => clearInterval(heartTimer);
  }, [toast]);

  // Collect key when finding one in the platformer
  const handleFindKey = useCallback(() => {
    setGameState(prev => ({ 
      ...prev, 
      keys: prev.keys + 1 
    }));
    
    toast({
      title: "Key found!",
      description: "You found a new key",
      duration: 1500,
    });
  }, [toast]);

  // Handle game over
  const handleGameOver = useCallback(() => {
    // Any additional game over logic can go here
  }, []);

  // Level up when score reaches certain thresholds
  useEffect(() => {
    const calculateLevel = (score: number) => Math.floor(score / 1000) + 1;
    const newLevel = calculateLevel(gameState.score);
    
    if (newLevel > gameState.level) {
      setGameState(prev => ({ ...prev, level: newLevel }));
      
      toast({
        title: "Level up!",
        description: `You advanced to level ${newLevel}`,
        duration: 1500,
      });
    }
  }, [gameState.score, gameState.level, toast]);

  const handleExit = () => {
    navigate('/');
  };

  // Format cooldown time
  const formatCooldownTime = (timestamp: number) => {
    const remainingMs = Math.max(0, timestamp - Date.now());
    const minutes = Math.floor(remainingMs / (60 * 1000));
    const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // New method to handle coin collection
  const handleCoinCollected = useCallback((coinsCollected: number) => {
    setGameState(prev => {
      const newCoins = prev.coins + coinsCollected;
      
      toast({
        title: "Coin Collected!",
        description: `You collected ${coinsCollected} coin(s)`,
        duration: 1500,
      });

      return { 
        ...prev, 
        coins: newCoins 
      };
    });
  }, [toast]);

  // New method to handle power-up collection
  const handlePowerUpCollected = useCallback((type: string) => {
    if (type === 'shield') {
      setGameState(prev => ({
        ...prev,
        hasShield: true
      }));
      
      toast({
        title: "Shield Activated!",
        description: "You're protected from the next obstacle hit",
        duration: 3000,
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-retro-arcade-black text-retro-neon-green flex flex-col">
      {/* Top HUD */}
      <div className="bg-retro-arcade-blue/80 p-2 border-b-2 border-retro-neon-blue shadow-[0_0_10px_rgba(0,255,255,0.7)]">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <CollectibleItem type="coin" count={gameState.coins} size="sm" className="text-retro-neon-yellow" />
            <CollectibleItem type="key" count={gameState.keys} size="sm" className="text-retro-neon-blue" />
          </div>
          
          <div className="text-center">
            <div className="font-pixel text-xs text-retro-neon-pink">LEVEL {gameState.level}</div>
            <div className="font-pixel text-sm text-retro-neon-green">SCORE: {gameState.score}</div>
          </div>
          
          <div className="flex space-x-1">
            {[...Array(gameState.maxHearts)].map((_, i) => (
              <CollectibleItem 
                key={i} 
                type="heart" 
                size="sm" 
                animated={i < gameState.hearts}
                className={i < gameState.hearts ? "text-retro-neon-pink animate-pulse" : "opacity-30"}
              />
            ))}
          </div>
        </div>
        
        {/* Shield indicator */}
        {gameState.hasShield && (
          <div className="mt-1 flex items-center">
            <div className="w-5 h-5 bg-retro-neon-blue rounded-full mr-2 animate-pulse"></div>
            <span className="text-xs font-pixel text-retro-neon-blue">SHIELD ACTIVE</span>
          </div>
        )}
        
        {/* Hearts cooldown indicator */}
        {gameState.heartCooldowns.length > 0 && (
          <div className="mt-1 text-xs font-pixel text-retro-neon-yellow">
            Next heart in: {formatCooldownTime(gameState.heartCooldowns[0])}
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 bg-gradient-to-b from-retro-arcade-blue to-retro-arcade-black">
        <div className="pixel-container max-w-xl w-full bg-retro-arcade-black border-2 border-retro-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.6)] p-6">
          <h2 className="font-pixel text-xl mb-6 text-retro-neon-yellow animate-neon-glow">RETRO ARCADE</h2>
          
          {/* Pacman-style element */}
          <div className="relative h-8 w-full bg-retro-arcade-black border border-retro-neon-blue mb-6 overflow-hidden">
            <div className="absolute top-1 left-0 w-0 h-0 
                           border-t-[10px] border-t-transparent
                           border-b-[10px] border-b-transparent
                           border-r-[20px] border-r-retro-neon-yellow
                           animate-pacman-move"></div>
            
            {/* Dots */}
            <div className="flex justify-between px-8 py-3">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 rounded-full bg-retro-neon-yellow"
                ></div>
              ))}
            </div>
          </div>
          
          {/* Dino-style Platformer Game */}
          <PlatformerGame 
            className="mb-6" 
            onScoreChange={handleScoreChange}
            onHeartLost={handleHeartLost}
            onGameOver={handleGameOver}
            onCoinCollected={handleCoinCollected}
            onPowerUpCollected={handlePowerUpCollected}
          />
          
          <div className="bg-retro-arcade-blue/20 p-3 border border-retro-neon-blue mb-6">
            <p className="font-pixel text-xs mb-2 text-retro-neon-green">
              GAME CONTROLS:
            </p>
            <div className="grid grid-cols-2 gap-2 text-left text-xs font-pixel">
              <div className="text-retro-neon-pink">SPACE/UP/CLICK = Jump</div>
              <div className="text-retro-neon-yellow">DOWN = Duck</div>
              <div className="text-retro-neon-pink">R = Restart after game over</div>
              <div className="text-retro-neon-yellow">Hearts regenerate every 10 min</div>
              <div className="text-retro-neon-blue">Collect shields for protection</div>
            </div>
          </div>
          
          <PixelButton onClick={handleExit} variant="danger" className="mt-4 shadow-[0_0_10px_rgba(255,0,0,0.7)]">
            EXIT ARCADE
          </PixelButton>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-retro-arcade-black text-center py-2 border-t border-retro-neon-blue text-xs font-pixel text-retro-neon-green">
        JUMP OBSTACLES TO SURVIVE - COLLECT COINS & POWER-UPS
      </div>
    </div>
  );
};

export default GameInterface;
