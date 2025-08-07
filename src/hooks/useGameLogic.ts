// src/hooks/useGameLogic.ts
import { useState, useEffect, useCallback } from 'react';
import { createDeck, shuffleDeck } from '../utils/cardUtils';
import { Player, Card as CardType } from '../types/gameTypes'; // Importa Player e CardType

interface GameState {
  players: Player[];
  deck: CardType[];
  currentRound: number;
  // Mais estados virão aqui, como:
  // dealerIndex: number;
  // trumpCard: CardType | null;
  // currentTrick: CardType[];
  // trickWinner: Player | null;
}

export const useGameLogic = (numPlayers: number = 4) => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    deck: [],
    currentRound: 1,
  });

  // Função para inicializar o jogo
  const initializeGame = useCallback(() => {
    const initialPlayers: Player[] = [];
    for (let i = 0; i < numPlayers; i++) {
      initialPlayers.push({
        id: `player-${i + 1}`,
        name: `Jogador ${i + 1}`,
        lives: 5, // Cada jogador começa com 5 vidas
        hand: [],
        bid: null,
        vazasWon: 0,
      });
    }

    const newDeck = shuffleDeck(createDeck()); // Cria e embaralha um novo baralho

    setGameState({
      players: initialPlayers,
      deck: newDeck,
      currentRound: 1,
    });
  }, [numPlayers]);

  // Efeito para inicializar o jogo quando o hook é montado
  useEffect(() => {
    initializeGame();
  }, [initializeGame]); // Dependência initializeGame para garantir que roda apenas uma vez

  return {
    gameState,
    initializeGame, // Podemos expor a função para reiniciar o jogo, se necessário
    // Mais funções virão aqui, como:
    // dealCards,
    // makeBid,
    // playCard,
    // calculateTrickWinner,
    // endRound,
  };
};