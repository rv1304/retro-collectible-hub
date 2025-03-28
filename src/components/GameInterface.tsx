
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from './PixelButton';
import CollectibleItem from './CollectibleItem';

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
          break;
        case 'k':
          setGameState(prev => ({ ...prev, keys: prev.keys + 1 }));
          break;
        case 'h':
          setGameState(prev => ({ ...prev, hearts: Math.min(prev.hearts + 1, 5) }));
          break;
        case 'l':
          setGameState(prev => ({ ...prev, level: prev.level + 1 }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen pixel-menu-bg flex flex-col">
      {/* Top HUD */}
      <div className="bg-retro-darker-purple/80 p-2 border-b-2 border-retro-pixel-dark">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <CollectibleItem type="coin" count={gameState.coins} size="sm" />
            <CollectibleItem type="key" count={gameState.keys} size="sm" />
          </div>
          
          <div className="text-center">
            <div className="font-pixel text-xs">LEVEL {gameState.level}</div>
            <div className="font-pixel text-sm text-retro-pixel-yellow">SCORE: {gameState.score}</div>
          </div>
          
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <CollectibleItem 
                key={i} 
                type="heart" 
                size="sm" 
                animated={false}
                className={i < gameState.hearts ? 'opacity-100' : 'opacity-30'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="pixel-container text-center max-w-md w-full">
          <h2 className="font-pixel text-xl mb-4">GAME AREA</h2>
          <p className="font-pixel text-xs mb-6">
            This is where the game would be rendered.
            <br /><br />
            Press C to collect coins.
            <br />
            Press K to collect keys.
            <br />
            Press H to gain health.
            <br />
            Press L to level up.
          </p>
          
          <div className="my-4">
            <div className="w-20 h-20 mx-auto bg-retro-pixel-green pixel-border flex items-center justify-center animate-pixel-float">
              <span className="text-2xl">♣</span>
            </div>
            <p className="mt-2 font-pixel text-xs">PLAYER CHARACTER</p>
          </div>
          
          <PixelButton onClick={handleExit} variant="danger" className="mt-4">
            EXIT GAME
          </PixelButton>
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
