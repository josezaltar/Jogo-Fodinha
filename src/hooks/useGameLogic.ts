// src/hooks/useGameLogic.ts
import { useState, useEffect, useCallback } from 'react';
import { createDeck, shuffleDeck } from '../utils/cardUtils';
import { Player, Card as CardType, GamePhase } from '../types/gameTypes';
import { RANKS } from '../utils/constants';

interface GameState {
  players: Player[];
  deck: CardType[];
  currentRound: number;
  dealerIndex: number;
  trumpCard: CardType | null;
  trumpRank: string | null;
  phase: GamePhase; // Adiciona a fase atual do jogo
  currentPlayerIndex: number; // Índice do jogador atual (quem está apostando ou jogando)
  // currentTrick: CardType[];
  // trickWinner: Player | null;
}

export const useGameLogic = (numPlayers: number = 4) => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    deck: [],
    currentRound: 1,
    dealerIndex: 0,
    trumpCard: null,
    trumpRank: null,
    phase: 'bidding', // Começa na fase de aposta
    currentPlayerIndex: 0, // Jogador 1 começa a apostar
  });

  const getTrumpRank = useCallback((turnedCardRank: CardType['rank']): string => {
    const currentIndex = RANKS.indexOf(turnedCardRank);
    return RANKS[(currentIndex + 1) % RANKS.length];
  }, []);

  const dealCards = useCallback((currentDeck: CardType[], currentPlayers: Player[]): { updatedPlayers: Player[], remainingDeck: CardType[], trumpCard: CardType, trumpRank: string } => {
    const cardsPerPlayer = 3;
    const updatedPlayers = currentPlayers.map(player => ({ ...player, hand: [], bid: null, vazasWon: 0 })); // Limpa mãos e lances

    let deckToDeal = [...currentDeck];

    for (let i = 0; i < cardsPerPlayer; i++) {
      for (let j = 0; j < updatedPlayers.length; j++) {
        if (deckToDeal.length > 0) {
          updatedPlayers[j].hand.push(deckToDeal.shift()!);
        }
      }
    }

    const trumpCard = deckToDeal.shift()!;
    const trumpRank = getTrumpRank(trumpCard.rank);

    return { updatedPlayers, remainingDeck: deckToDeal, trumpCard, trumpRank };
  }, [getTrumpRank]);

  // Nova função: Registrar o lance de um jogador
  const makeBid = useCallback((playerId: string, bidAmount: number) => {
    setGameState(prev => {
      const updatedPlayers = prev.players.map(player =>
        player.id === playerId ? { ...player, bid: bidAmount } : player
      );

      // Avança para o próximo jogador para fazer o lance
      let nextPlayerIndex = prev.currentPlayerIndex + 1;
      let newPhase: GamePhase = prev.phase;

      // Se todos os jogadores já apostaram
      if (nextPlayerIndex >= updatedPlayers.length) {
        nextPlayerIndex = 0; // Reinicia para o Jogador 1 (para o início da jogada)
        newPhase = 'playing'; // Muda para a fase de jogar
      }

      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        phase: newPhase,
      };
    });
  }, []);

  const initializeGame = useCallback(() => {
    const initialPlayers: Player[] = [];
    for (let i = 0; i < numPlayers; i++) {
      initialPlayers.push({
        id: `player-${i + 1}`,
        name: `Jogador ${i + 1}`,
        lives: 5,
        hand: [],
        bid: null,
        vazasWon: 0,
      });
    }

    const newDeck = shuffleDeck(createDeck());
    const { updatedPlayers, remainingDeck, trumpCard, trumpRank } = dealCards(newDeck, initialPlayers);

    setGameState({
      players: updatedPlayers,
      deck: remainingDeck,
      currentRound: 1,
      dealerIndex: 0,
      trumpCard: trumpCard,
      trumpRank: trumpRank,
      phase: 'bidding', // Garante que a fase inicial seja a de aposta
      currentPlayerIndex: (initialPlayers.length - 1 + 1) % initialPlayers.length, // Quem faz a primeira aposta (o jogador à direita do dealer)
      // Nota: o jogador à direita do dealer é o primeiro a apostar.
      // Se o dealer for o índice 0, o último jogador (índice numPlayers - 1) aposta primeiro.
      // Então, o próximo seria (numPlayers - 1 + 1) % numPlayers = 0 (Jogador 1).
      // Vamos assumir por enquanto que o primeiro a apostar é o jogador 1 (índice 0).
      // Posteriormente ajustaremos a ordem da aposta. Por enquanto, só o currentPlayerIndex.
      // Correção: o jogador a direita do dealer é o primeiro a apostar. No truco, o dealer é o último a apostar.
      // Se o dealer for o jogador 1 (indice 0), o ultimo a apostar é ele. O proximo (indice 1) aposta primeiro.
      // Vamos começar com o jogador 1 (índice 0) apostando para simplificar.
      currentPlayerIndex: (0 + 1) % numPlayers, // Jogador depois do dealer (se dealer é 0, o jogador 1, índice 1, aposta primeiro)
    });
  }, [numPlayers, dealCards]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return {
    gameState,
    initializeGame,
    makeBid, // Expõe a função makeBid
  };
};