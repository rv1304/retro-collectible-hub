
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from './PixelButton';

interface Character {
  id: number;
  name: string;
  color: string;
  skills: string[];
}

const characters: Character[] = [
  {
    id: 1,
    name: "KNIGHT",
    color: "bg-retro-pixel-blue",
    skills: ["Sword Attack", "Shield Block", "Heavy Armor"]
  },
  {
    id: 2,
    name: "MAGE",
    color: "bg-retro-pixel-purple",
    skills: ["Fireball", "Teleport", "Mana Shield"]
  },
  {
    id: 3,
    name: "ROGUE",
    color: "bg-retro-pixel-green",
    skills: ["Stealth", "Quick Strike", "Lockpicking"]
  },
  {
    id: 4,
    name: "HEALER",
    color: "bg-retro-pixel-red",
    skills: ["Heal", "Bless", "Revive"]
  }
];

const CharacterSelect = () => {
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleConfirmCharacter = () => {
    // Would typically save character selection to state/context
    navigate('/inventory');
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen pixel-menu-bg flex flex-col p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-4xl font-pixel text-retro-pixel-yellow">
          SELECT CHARACTER
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {characters.map(character => (
          <div 
            key={character.id}
            className={`pixel-container cursor-pointer transition-all ${
              selectedCharacter?.id === character.id 
                ? 'border-retro-pixel-yellow' 
                : ''
            }`}
            onClick={() => handleSelectCharacter(character)}
          >
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 ${character.color} mb-4 pixel-border`}>
                {/* Character icon would go here */}
                <div className="flex items-center justify-center h-full text-xl font-bold">
                  {character.name.charAt(0)}
                </div>
              </div>
              <h2 className="text-lg font-pixel mb-2">{character.name}</h2>
              <div className="text-xs font-pixel text-retro-pixel-light">
                <ul>
                  {character.skills.map((skill, index) => (
                    <li key={index} className="mb-1">• {skill}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-4 mt-8">
        <PixelButton onClick={handleBackToMenu} variant="danger">
          BACK
        </PixelButton>
        <PixelButton 
          onClick={handleConfirmCharacter} 
          variant="success"
          disabled={!selectedCharacter}
          className={!selectedCharacter ? 'opacity-50 cursor-not-allowed' : ''}
        >
          CONFIRM
        </PixelButton>
      </div>
    </div>
  );
};

export default CharacterSelect;
