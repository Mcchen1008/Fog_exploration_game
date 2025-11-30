export enum BiomeType {
  OCEAN = 'Ocean',
  BEACH = 'Beach',
  GRASSLAND = 'Grassland',
  FOREST = 'Forest',
  MOUNTAIN = 'Mountain',
  SNOW = 'Snow'
}

export interface GameState {
  currentBiome: BiomeType;
  playerPosition: [number, number, number];
  isExploring: boolean;
  journalOpen: boolean;
  lastLog: string | null;
  loadingLog: boolean;
}

export interface WorldConfig {
  seed: number;
  width: number;
  depth: number;
  scale: number;
}
