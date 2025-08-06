export interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameStats {
  moves: number;
  matches: number;
  timeElapsed: number;
  isGameComplete: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  gridSize: number;
  timeLimit?: number;
  label: string;
}