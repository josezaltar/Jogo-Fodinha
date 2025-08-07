// src/utils/cardUtils.ts

import { SUITS, RANKS } from './constants';
import { Card } from '../types/gameTypes'; // Importa a tipagem Card

/**
 * Gera um baralho de truco completo (40 cartas, sem coringas).
 * @returns {Card[]} Um array de objetos de carta, cada um com 'rank' e 'suit'.
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

/**
 * Embaralha um array de cartas usando o algoritmo Fisher-Yates.
 * @param {Card[]} deck O baralho a ser embaralhado.
 * @returns {Card[]} O baralho embaralhado.
 */
export function shuffleDeck(deck: Card[]): Card[] {
  let currentIndex = deck.length;
  let randomIndex: number;

  // Enquanto houver elementos para embaralhar.
  while (currentIndex !== 0) {
    // Escolhe um elemento restante.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // E troca com o elemento atual.
    [deck[currentIndex], deck[randomIndex]] = [
      deck[randomIndex], deck[currentIndex]];
  }
  return deck;
}