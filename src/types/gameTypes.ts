
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
