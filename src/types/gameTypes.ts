// src/types/gameTypes.ts

export type GamePhase = 'bidding' | 'playing' | 'roundEnd' | 'gameOver';

export interface Card {
  suit: 'copas' | 'espadas' | 'ouros' | 'paus';
  rank: '4' | '5' | '6' | '7' | 'Q' | 'J' | 'K' | 'A' | '2' | '3';
}

export interface Player {
  id: string;
  name: string;
  lives: number;
  hand: Card[];
  bid: number | null;
  vazasWon: number;
}