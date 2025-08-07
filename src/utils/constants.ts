// src/utils/constants.ts

import { Card } from '../types/gameTypes'; // Removido Suit e Rank desta importação

export const SUITS = ['copas', 'espadas', 'ouros', 'paus'] as const; // Adicionado 'as const' para tipagem mais rigorosa
export type Suit = typeof SUITS[number]; // Define o tipo Suit a partir das constantes

export const RANKS = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'] as const; // Adicionado 'as const'
export type Rank = typeof RANKS[number]; // Define o tipo Rank a partir das constantes

// Manilhas fixas do Truco Mineiro, em ordem decrescente de força
export const MINEIRO_TRUMPS_ORDERED: Card[] = [
  { suit: 'paus', rank: '4' },    // Maior: Zap
  { suit: 'copas', rank: '7' },   // Segundo: Sete Copas
  { suit: 'espadas', rank: 'A' }, // Terceiro: Espadilha
  { suit: 'ouros', rank: '7' },   // Quarto: Sete Ouros
];

// Mapeia uma carta (Rank_Suit) para sua força no Mineiro.
// Isso é usado para comparar a força das manilhas fixas do Mineiro.
// Um valor maior significa mais forte.
export const MINEIRO_TRUMP_STRENGTH: { [key: string]: number } = {
  '4_paus': 4,
  '7_copas': 3,
  'A_espadas': 2,
  '7_ouros': 1,
};

// Funções utilitárias para cartas
export const getCardIdentifier = (card: Card): string => `${card.rank}_${card.suit}`;

// Array com todas as cartas do baralho
export const FULL_DECK_CARDS: Card[] = [];
SUITS.forEach(suit => {
  RANKS.forEach(rank => {
    FULL_DECK_CARDS.push({ suit, rank });
  });
});