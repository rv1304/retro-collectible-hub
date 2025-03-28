
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from './PixelButton';
import { useToast } from '@/components/ui/use-toast';

const MainMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuVisible, setMenuVisible] = useState(true);

  const handleStartGame = () => {
    setMenuVisible(false);
    // Transition effect
    setTimeout(() => {
      navigate('/game');
    }, 500);
  };

  const handleOpenOptions = () => {
    toast({
      title: "Options",
      description: "Options menu is not implemented yet!",
      duration: 2000,
    });
  };

  const handleOpenHighScores = () => {
    toast({
      title: "High Scores",
      description: "High scores are not implemented yet!",
      duration: 2000,
    });
  };

  const handleOpenCharacterSelect = () => {
    setMenuVisible(false);
    // Transition effect
    setTimeout(() => {
      navigate('/character-select');
    }, 500);
  };

  return (
    <div className="min-h-screen pixel-menu-bg flex flex-col items-center justify-center transition-all duration-500">
      <div className={`text-center transition-all duration-500 ${menuVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <h1 className="text-4xl md:text-6xl mb-8 text-retro-pixel-yellow font-pixel animate-pixel-pulse">
          RETRO<span className="text-retro-pixel-green">QUEST</span>
        </h1>
        
        <div className="pixel-container my-8 flex flex-col space-y-4 w-64 mx-auto">
          <PixelButton 
            variant="primary" 
            onClick={handleStartGame}
            className="w-full"
          >
            START GAME
          </PixelButton>
          
          <PixelButton 
            variant="success" 
            onClick={handleOpenCharacterSelect}
            className="w-full"
          >
            CHARACTER
          </PixelButton>
          
          <PixelButton 
            variant="secondary" 
            onClick={handleOpenOptions}
            className="w-full"
          >
            OPTIONS
          </PixelButton>
          
          <PixelButton 
            variant="danger" 
            onClick={handleOpenHighScores}
            className="w-full"
          >
            HIGH SCORES
          </PixelButton>
        </div>
        
        <div className="mt-8 text-retro-pixel-light font-pixel text-xs">
          © 2023 RETRO COLLECTIBLE HUB
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
