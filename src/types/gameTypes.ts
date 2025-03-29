
// Game obstacle types (cactus, bird)
export interface GameObstacle {
  type: 'cactus' | 'bird';
  position: number;
}

// Game coin type
export interface GameCoin {
  position: number;
  collected: boolean;
}

// Game power-up types
export type PowerUpType = 'shield';

// Game power-up interface
export interface GamePowerUp {
  type: PowerUpType;
  position: number;
  collected: boolean;
}

// Player status effects
export interface PlayerStatus {
  hasShield: boolean;
  shieldTimeRemaining: number; // in milliseconds
}
