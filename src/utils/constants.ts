// src/utils/constants.ts

import { Suit, Rank, Card } from '../types/gameTypes'; // Importa as tipagens

export const SUITS: Suit[] = ['copas', 'espadas', 'ouros', 'paus'];
export const RANKS: Rank[] = ['4', '5', '6', '7', 'J', 'Q', 'K', 'A', '2', '3'];

// Mapeamento para fácil acesso ao valor da carta para ordenação no modo Mineiro (sem manilha)
export const RANK_VALUES: Record<Rank, number> = {
  '4': 0, '5': 1, '6': 2, '7': 3, 'J': 4, 'Q': 5, 'K': 6, 'A': 7, '2': 8, '3': 9
};

// Manilhas fixas do modo Mineiro (do mais forte para o mais fraco)
export const MINEIRO_TRUMPS: Card[] = [
  { rank: '4', suit: 'paus' },   // 4♣
  { rank: '7', suit: 'copas' },  // 7♥
  { rank: 'A', suit: 'espadas' },// A♠
  { rank: '7', suit: 'ouros' }   // 7♦
];