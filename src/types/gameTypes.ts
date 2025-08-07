// src/types/gameTypes.ts

export type Suit = 'copas' | 'espadas' | 'ouros' | 'paus'; // ♥♠♦♣
export type Rank = '4' | '5' | '6' | '7' | 'J' | 'Q' | 'K' | 'A' | '2' | '3';

export interface Card {
  rank: Rank;
  suit: Suit;
}

// Opcional: Tipos para o modo de jogo, fases, etc., que usaremos mais tarde
export type GameMode = 'Mineiro' | 'Paulista';
export type GamePhase = 'bidding' | 'playing' | 'roundEnd' | 'gameOver';

// Exemplo de como um jogador poderia ser tipado (usaremos mais tarde)
export interface Player {
  id: string;
  name: string;
  lives: number;
  hand: Card[];
  bid: number | null;
  vazasWon: number;
}