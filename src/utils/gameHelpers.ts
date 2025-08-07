// src/utils/gameHelpers.ts
import { RANKS, MINEIRO_TRUMP_STRENGTH, getCardIdentifier } from './constants'; // Certifique-se de que constants.ts existe e contém RANKS, MINEIRO_TRUMP_STRENGTH e getCardIdentifier
import { Card, Player } from '../types/gameTypes';

/**
 * Determina o rank da manilha para o modo Paulista, com base na carta virada.
 * @param turnedCardRank O rank da carta virada.
 * @returns O rank que é a manilha.
 */
export const getPaulistaTrumpRank = (turnedCardRank: Card['rank']): string => {
  const currentIndex = RANKS.indexOf(turnedCardRank);
  return RANKS[(currentIndex + 1) % RANKS.length];
};

/**
 * Determina a força de uma carta, considerando o modo de jogo e a manilha.
 * @param card A carta a ser avaliada.
 * @param trumpRank O rank da manilha (para modo Paulista).
 * @param gameMode O modo de jogo ('mineiro' ou 'paulista').
 * @returns Um valor numérico representando a força da carta.
 */
export const getCardStrength = (card: Card, trumpRank: string | null, gameMode: 'mineiro' | 'paulista' | null): number => {
  if (!gameMode) return RANKS.indexOf(card.rank); // Retorna valor base se modo não definido

  // Manilhas Mineiras (fixas)
  if (gameMode === 'mineiro') {
    const mineiroTrumpIdentifier = getCardIdentifier(card);
    if (MINEIRO_TRUMP_STRENGTH[mineiroTrumpIdentifier]) {
      return 100 + MINEIRO_TRUMP_STRENGTH[mineiroTrumpIdentifier];
    }
  }

  // Manilhas Paulista (dinâmicas)
  if (gameMode === 'paulista' && trumpRank && card.rank === trumpRank) {
    return 50 + RANKS.indexOf(card.rank);
  }

  // Valor base das cartas (Truco)
  return RANKS.indexOf(card.rank);
};

/**
 * Calcula o vencedor de uma vaza.
 * @param trick Array de cartas jogadas na vaza com seus respectivos IDs de jogador.
 * @param gameMode O modo de jogo.
 * @param trumpRank O rank da manilha.
 * @param players A lista completa de jogadores para encontrar o vencedor.
 * @returns O objeto Player que venceu a vaza, ou um Player 'dummy' com ID 'EMPATE' em caso de empate.
 */
export const calculateTrickWinner = (
  trick: { card: Card, playerId: string }[],
  gameMode: 'mineiro' | 'paulista' | null,
  trumpRank: string | null,
  players: Player[]
): Player => {
  if (trick.length === 0 || !gameMode) {
    console.error("[calculateTrickWinner] Vaza vazia ou modo de jogo não definido.");
    return { id: 'DUMMY', name: 'Dummy', lives: 0, hand: [], bid: null, vazasWon: 0 };
  }

  let highestCardStrength = -1;
  let winningCandidates: { card: Card, playerId: string }[] = [];

  trick.forEach(item => {
    const currentCardStrength = getCardStrength(item.card, trumpRank, gameMode);

    if (currentCardStrength > highestCardStrength) {
      highestCardStrength = currentCardStrength;
      winningCandidates = [item];
    } else if (currentCardStrength === highestCardStrength) {
      winningCandidates.push(item);
    }
  });

  if (winningCandidates.length > 1) {
    console.log("[calculateTrickWinner] Vaza empatada entre múltiplos candidatos.");
    return { id: 'EMPATE', name: 'EMPATE', lives: 0, hand: [], bid: null, vazasWon: 0 };
  }

  const finalWinnerItem = winningCandidates[0];
  const finalWinner = players.find(p => p.id === finalWinnerItem.playerId);

  if (!finalWinner) {
    console.error(`[calculateTrickWinner] Vencedor da vaza com ID ${finalWinnerItem.playerId} não encontrado nos jogadores! Retornando o primeiro jogador.`);
    return players[0] as Player; // Fallback seguro
  }
  console.log(`[calculateTrickWinner] Vencedor da vaza: ${finalWinner.name} com ${finalWinnerItem.card.rank} de ${finalWinnerItem.card.suit}`);
  return finalWinner;
};