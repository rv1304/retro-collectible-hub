
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from './PixelButton';
import CollectibleItem from './CollectibleItem';

// Mock inventory data
const inventoryItems = [
  { id: 1, name: "Gold Coins", type: "coin", count: 124 },
  { id: 2, name: "Dungeon Key", type: "key", count: 3 },
  { id: 3, name: "Health Crystal", type: "heart", count: 5 },
  { id: 4, name: "Bronze Coins", type: "coin", count: 57 },
  { id: 5, name: "Tower Key", type: "key", count: 1 },
  { id: 6, name: "Energy Heart", type: "heart", count: 2 },
];

const Inventory = () => {
  const navigate = useNavigate();

  const handleBackToMenu = () => {
    navigate('/');
  };

  const handleStartGame = () => {
    navigate('/game');
  };

  return (
    <div className="min-h-screen pixel-menu-bg flex flex-col p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-4xl font-pixel text-retro-pixel-yellow">
          INVENTORY
        </h1>
      </div>

      <div className="pixel-container max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inventoryItems.map((item) => (
            <div key={item.id} className="bg-retro-darker-purple/50 p-3 pixel-border">
              <div className="flex items-center">
                <CollectibleItem 
                  type={item.type as 'coin' | 'key' | 'heart'} 
                  count={item.count} 
                />
                <div className="ml-4">
                  <h3 className="text-sm font-pixel">{item.name}</h3>
                  <p className="text-xs text-retro-pixel-light/70 font-pixel">
                    {item.type === 'coin' ? 'Currency' : 
                     item.type === 'key' ? 'Quest Item' : 'Consumable'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs font-pixel text-center text-retro-pixel-light/70">
          Collect more items by exploring dungeons and defeating enemies!
        </div>
      </div>

      <div className="flex justify-center space-x-4 mt-8">
        <PixelButton onClick={handleBackToMenu} variant="danger">
          BACK TO MENU
        </PixelButton>
        <PixelButton onClick={handleStartGame} variant="success">
          START ADVENTURE
        </PixelButton>
      </div>
    </div>
  );
};

export default Inventory;
