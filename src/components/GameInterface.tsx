
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from './PixelButton';
import CollectibleItem from './CollectibleItem';
import PlatformerGame from './PlatformerGame';
import { useToast } from '@/components/ui/use-toast';

// Game state interface
interface GameState {
  coins: number;
  keys: number;
  hearts: number;
  level: number;
  score: number;
}

const GameInterface = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    coins: 0,
    keys: 0,
    hearts: 3,
    level: 1,
    score: 0
  });

  // Simulated game progression
  useEffect(() => {
    const gameInterval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins + 1,
        score: prev.score + 10
      }));
    }, 3000);

    return () => clearInterval(gameInterval);
  }, []);

  // Simulate collecting items with keyboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'c':
          setGameState(prev => ({ ...prev, coins: prev.coins + 5 }));
          toast({
            title: "Coins collected!",
            description: "+5 coins added to your inventory",
            duration: 1500,
          });
          break;
        case 'k':
          setGameState(prev => ({ ...prev, keys: prev.keys + 1 }));
          toast({
            title: "Key found!",
            description: "You found a new key",
            duration: 1500,
          });
          break;
        case 'h':
          setGameState(prev => ({ ...prev, hearts: Math.min(prev.hearts + 1, 5) }));
          toast({
            title: "Health restored!",
            description: "You gained an extra heart",
            duration: 1500,
          });
          break;
        case 'l':
          setGameState(prev => ({ ...prev, level: prev.level + 1 }));
          toast({
            title: "Level up!",
            description: `You advanced to level ${gameState.level + 1}`,
            duration: 1500,
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.level, toast]);

  const handleExit = () => {
    navigate('/');
  };

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
            {[...Array(5)].map((_, i) => (
              <CollectibleItem 
                key={i} 
                type="heart" 
                size="sm" 
                animated={false}
                className={i < gameState.hearts ? "text-retro-neon-pink animate-pulse" : "opacity-30"}
              />
            ))}
          </div>
        </div>
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
          
          {/* Mario-style Platformer Game */}
          <PlatformerGame className="mb-6" />
          
          <div className="bg-retro-arcade-blue/20 p-3 border border-retro-neon-blue mb-6">
            <p className="font-pixel text-xs mb-2 text-retro-neon-green">
              GAME CONTROLS:
            </p>
            <div className="grid grid-cols-2 gap-2 text-left text-xs font-pixel">
              <div className="text-retro-neon-pink">C = Collect coins</div>
              <div className="text-retro-neon-yellow">K = Find key</div>
              <div className="text-retro-neon-pink">H = Gain heart</div>
              <div className="text-retro-neon-yellow">L = Level up</div>
              <div className="text-retro-neon-pink col-span-2">SPACE/UP/CLICK = Jump in platformer</div>
            </div>
          </div>
          
          <PixelButton onClick={handleExit} variant="danger" className="mt-4 shadow-[0_0_10px_rgba(255,0,0,0.7)]">
            EXIT ARCADE
          </PixelButton>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-retro-arcade-black text-center py-2 border-t border-retro-neon-blue text-xs font-pixel text-retro-neon-green">
        INSERT COIN TO CONTINUE - PRESS C FOR COINS
      </div>
    </div>
  );
};

export default GameInterface;
