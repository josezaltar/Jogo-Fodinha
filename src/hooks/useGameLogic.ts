// src/hooks/useGameLogic.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { createDeck, shuffleDeck } from '../utils/cardUtils'; // Certifique-se de que cardUtils.ts existe
import { Player, Card as CardType, GamePhase } from '../types/gameTypes';
import { getPaulistaTrumpRank, getCardStrength, calculateTrickWinner } from '../utils/gameHelpers'; // <-- Novas importações

interface GameState {
  players: Player[];
  deck: CardType[];
  currentRound: number;
  dealerIndex: number;
  trumpCard: CardType | null; // A carta virada
  trumpRank: string | null; // O rank que é manilha no Paulista (ex: se virou 7, 8 é manilha)
  phase: GamePhase;
  currentPlayerIndex: number;
  currentTrick: { card: CardType, playerId: string }[];
  trickWinner: Player | null;
  roundStartPlayerIndex: number;
  lastTrickPlayed: { card: CardType, playerId: string }[] | null;
  lastTrickWinner: Player | null;
  gameMode: 'mineiro' | 'paulista' | null;
  winner: Player | null; // Para armazenar o vencedor final do jogo
  isGameStarted: boolean; // Controla se o jogo já começou (após seleção de modo)
  roundCardsCount: number; // Quantidade de cartas distribuídas nesta rodada
}

export const useGameLogic = (numPlayers: number = 4) => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    deck: [],
    currentRound: 1,
    dealerIndex: 0,
    trumpCard: null,
    trumpRank: null,
    phase: 'bidding',
    currentPlayerIndex: 0,
    currentTrick: [],
    trickWinner: null,
    roundStartPlayerIndex: 0,
    lastTrickPlayed: null,
    lastTrickWinner: null,
    gameMode: null,
    winner: null,
    isGameStarted: false,
    roundCardsCount: 0,
  });

  const timerRef = useRef<number | null>(null);

  // dealCards agora calcula o número de cartas dinamicamente
  const dealCards = useCallback((currentDeck: CardType[], currentPlayers: Player[], roundToDeal: number): { updatedPlayers: Player[], remainingDeck: CardType[], trumpCard: CardType, trumpRank: string | null } => {
    console.log(`[dealCards] Chamado para a rodada: ${roundToDeal}, com ${currentDeck.length} cartas no baralho e ${currentPlayers.length} jogadores.`);
    let desiredCardsPerPlayer = roundToDeal;
    const maxCards = Math.floor((currentDeck.length - 1) / currentPlayers.length); // Max cartas possíveis, menos a manilha

    // Ajusta o número de cartas se o baralho não for suficiente ou exceder o máximo
    if (desiredCardsPerPlayer > maxCards) {
      console.warn(`[dealCards] Desejado (${desiredCardsPerPlayer}) é maior que o máximo possível (${maxCards}). Ajustando para ${maxCards}.`);
      desiredCardsPerPlayer = maxCards > 0 ? maxCards : 0;
    }
    // Se o baralho for muito pequeno e não der nem para a manilha
    if (currentDeck.length < 1) {
        console.warn("[dealCards] Baralho vazio, não é possível virar a manilha ou distribuir cartas.");
        // Retorna um estado que indica que não foi possível distribuir
        return {
            updatedPlayers: currentPlayers.map(p => ({ ...p, hand: [], bid: null, vazasWon: 0 })),
            remainingDeck: [],
            trumpCard: { suit: 'copas', rank: '4' } as CardType, // Carta dummy para evitar null
            trumpRank: null
        };
    }

    // Garante que apenas jogadores ativos são considerados para a distribuição
    const playersToDeal = currentPlayers.filter(p => p.lives > 0);
    // Reinicia as mãos e apostas apenas para os jogadores que receberão cartas
    const updatedPlayers = playersToDeal.map(player => ({ ...player, hand: [], bid: null, vazasWon: 0 }));
    let deckToDeal = [...currentDeck];

    console.log(`[dealCards] Distribuindo ${desiredCardsPerPlayer} cartas por jogador ativo.`);
    for (let i = 0; i < desiredCardsPerPlayer; i++) {
      for (let j = 0; j < updatedPlayers.length; j++) {
        if (deckToDeal.length > 0) {
          const dealtCard = deckToDeal.shift()!;
          updatedPlayers[j].hand.push(dealtCard);
          console.log(`[dealCards] Jogador ${updatedPlayers[j].id} recebeu: ${dealtCard.rank} de ${dealtCard.suit}.`);
        } else {
            console.warn(`[dealCards] Baralho ficou vazio antes de distribuir todas as cartas. Parando distribuição na iteração ${i}, jogador ${j}.`);
            break; // Sai do loop interno se o baralho acabar
        }
      }
      if (deckToDeal.length === 0 && i < desiredCardsPerPlayer - 1) {
        console.warn("[dealCards] Baralho vazio, não foi possível completar a distribuição para todos os rounds por jogador.");
        break; // Sai do loop externo se o baralho acabar
      }
    }

    const trumpCard = deckToDeal.shift(); // Pode ser undefined se o baralho esvaziar
    if (!trumpCard) {
        console.warn("[dealCards] Não foi possível virar a manilha, baralho vazio.");
        // Retorna uma carta dummy para a manilha e trumpRank nulo
        return {
            updatedPlayers: updatedPlayers,
            remainingDeck: deckToDeal,
            trumpCard: { suit: 'paus', rank: 'A' } as CardType, // Dummy card if no trump
            trumpRank: null
        };
    }

    let trumpRank: string | null = null;
    if (gameState.gameMode === 'paulista') { // gameState ainda é acessível via closure
      trumpRank = getPaulistaTrumpRank(trumpCard.rank); // <-- Usa a função importada
      console.log(`[dealCards] Manilha Paulista virada: ${trumpCard.rank} de ${trumpCard.suit}. Manilha para a rodada: ${trumpRank}`);
    } else {
        console.log(`[dealCards] Manilha virada (Mineiro/Nenhum): ${trumpCard.rank} de ${trumpCard.suit}`);
    }
    console.log(`[dealCards] Mãos após distribuição:`, updatedPlayers.map(p => ({ id: p.id, handLength: p.hand.length })));


    return { updatedPlayers, remainingDeck: deckToDeal, trumpCard, trumpRank };
  }, [gameState.gameMode]); // Dependência adicionada para gameState.gameMode

  const makeBid = useCallback((playerId: string, bidAmount: number) => {
    setGameState(prev => {
      const updatedPlayers = prev.players.map(player =>
        player.id === playerId ? { ...player, bid: bidAmount } : player
      );

      // Filtra jogadores ativos para determinar o próximo jogador que ainda está no jogo
      const activePlayers = updatedPlayers.filter(p => p.lives > 0);
      const currentPlayerInActiveListIndex = activePlayers.findIndex(p => p.id === prev.players[prev.currentPlayerIndex].id);
      let nextPlayerIndexInActiveList = (currentPlayerInActiveListIndex + 1) % activePlayers.length;
      let nextPlayerGlobalIndex = prev.players.findIndex(p => p.id === activePlayers[nextPlayerIndexInActiveList].id);


      let newPhase: GamePhase = prev.phase;
      let allBidsMade = activePlayers.every(p => p.bid !== null); // Verifica apenas jogadores ativos

      if (allBidsMade) {
        newPhase = 'playing';
        // O primeiro a jogar na primeira vaza é sempre o jogador à esquerda do dealer
        // Baseado nos jogadores ATIVOS
        const dealerInActiveListIndex = activePlayers.findIndex(p => p.id === prev.players[prev.dealerIndex].id);
        const firstToPlayInActiveListIndex = (dealerInActiveListIndex + 1) % activePlayers.length;
        nextPlayerGlobalIndex = prev.players.findIndex(p => p.id === activePlayers[firstToPlayInActiveListIndex].id);
      }

      console.log(`[makeBid] Jogador ${playerId} apostou ${bidAmount}. Próximo jogador: ${prev.players[nextPlayerGlobalIndex]?.name}. Nova fase: ${newPhase}.`);
      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerGlobalIndex,
        phase: newPhase,
      };
    });
  }, []);

  const endRound = useCallback(() => {
    console.log("[endRound] Fim da rodada acionado.");
    setGameState(prev => {
      let updatedPlayers = prev.players.map(player => {
        if (player.id === 'EMPATE') return player; // Ignora o jogador dummy de empate

        // Apenas aplica a lógica de vida se o jogador fez uma aposta nesta rodada
        if (player.bid !== null) {
          if (player.vazasWon === player.bid) {
            console.log(`${player.name} apostou ${player.bid} e ganhou ${player.vazasWon}. Acertou!`);
            return { ...player, hand: [], bid: null, vazasWon: 0 };
          } else {
            console.log(`${player.name} apostou ${player.bid} e ganhou ${player.vazasWon}. Perdeu uma vida.`);
            return { ...player, lives: player.lives - 1, hand: [], bid: null, vazasWon: 0 };
          }
        }
        // Se o jogador não fez aposta (ex: foi eliminado na rodada anterior ou erro), só reseta
        return { ...player, hand: [], bid: null, vazasWon: 0 };
      });

      // Filtra os jogadores ativos após a perda de vidas
      const totalPlayersInitial = prev.players.length; // Usa o número total de jogadores originais para rotação do dealer
      const activePlayers = updatedPlayers.filter(p => p.lives > 0);
      console.log(`[endRound] Jogadores ativos restantes: ${activePlayers.length}.`);

      // Lógica de Vencedor Final do Jogo
      // Se sobrou 1 jogador, ele é o vencedor. Se sobrou 0 (ou menos, teoricamente impossível), todos foram eliminados.
      if (activePlayers.length <= 1 && totalPlayersInitial > 1) {
        const gameWinner = activePlayers.length === 1 ? activePlayers[0] : null;
        console.log("[endRound] Jogo finalizado. Vencedor:", gameWinner?.name || "Nenhum (todos eliminados).");
        return {
          ...prev,
          players: updatedPlayers, // Inclui os jogadores eliminados para fins de exibição final
          phase: 'gameOver', // Nova fase para indicar o fim do jogo
          winner: gameWinner,
          isGameStarted: false, // Jogo terminado
        };
      }

      // Prepara para a Próxima Rodada
      // O dealer rotaciona com base na contagem *inicial* de jogadores para manter a ordem
      const newDealerIndex = (prev.dealerIndex + 1) % totalPlayersInitial;
      let newRoundNumber = prev.currentRound + 1;
      let newDeck = shuffleDeck(createDeck()); // Sempre cria um baralho novo para cada rodada

      // Regra de "reiniciar a contagem de cartas" se alguém foi eliminado
      // Se o número de jogadores ativos mudou, a próxima rodada é a Rodada 1
      if (activePlayers.length < prev.players.length) {
        console.log("[endRound] Jogador(es) eliminado(s). Reiniciando contagem de cartas para rodada 1.");
        newRoundNumber = 1;
        // O dealer continua a rotação normal, mas as cartas reiniciam a contagem.
      }

      console.log(`[endRound] Iniciando nova rodada: ${newRoundNumber}.`);
      // dealCards precisa dos jogadores *ativos* para distribuir cartas corretamente
      const { updatedPlayers: playersForNextRound, remainingDeck, trumpCard, trumpRank } = dealCards(newDeck, activePlayers, newRoundNumber);

      // Adicione um log aqui para inspecionar playersForNextRound
      console.log("[endRound] Jogadores para próxima rodada (após dealCards):", playersForNextRound.map(p => ({id: p.id, handLength: p.hand.length})));

      // O jogador à esquerda do dealer começa a primeira aposta/jogada da nova rodada
      // Precisa considerar apenas os jogadores que estão na rodada (playersForNextRound)
      // Encontra o índice do novo dealer na lista de jogadores ativos para calcular quem começa
      const dealerActiveIndex = playersForNextRound.findIndex(p => p.id === prev.players[newDealerIndex].id);
      // fallback para 0 caso o dealer que seria o próximo tenha sido eliminado e não esteja mais em playersForNextRound
      const actualDealerIndexForNextRound = dealerActiveIndex !== -1 ? dealerActiveIndex : 0;
      const firstPlayerToActIndex = (actualDealerIndexForNextRound + 1) % playersForNextRound.length;
      console.log(`[endRound] Primeiro jogador a agir na nova rodada: ${playersForNextRound[firstPlayerToActIndex]?.name}.`);

      return {
        ...prev,
        players: playersForNextRound, // Usar playersForNextRound que tem as novas mãos
        deck: remainingDeck,
        currentRound: newRoundNumber,
        dealerIndex: newDealerIndex,
        trumpCard: trumpCard,
        trumpRank: trumpRank,
        phase: 'bidding', // Volta para a fase de aposta
        currentPlayerIndex: firstPlayerToActIndex, // Define o primeiro jogador da nova rodada
        currentTrick: [], // Reseta a vaza atual
        trickWinner: null, // Reseta o vencedor da vaza
        roundStartPlayerIndex: firstPlayerToActIndex, // Define quem começa a próxima vaza
        lastTrickPlayed: null, // Limpa a última vaza jogada
        lastTrickWinner: null, // Limpa o último vencedor da vaza
        roundCardsCount: playersForNextRound[0]?.hand.length || 0, // Atualiza a contagem de cartas distribuídas
      };
    });
  }, [dealCards]);

  const playCard = useCallback((playerId: string, card: CardType) => {
    setGameState(prev => {
      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1 || prev.phase !== 'playing' || prev.currentPlayerIndex !== playerIndex) {
        console.warn(`[playCard] Não é a vez do jogador ${playerId} ou não é a fase de jogar.`);
        return prev;
      }

      const playerHand = prev.players[playerIndex].hand;
      const cardInHand = playerHand.find(c => c.rank === card.rank && c.suit === card.suit);
      if (!cardInHand) {
        console.warn(`[playCard] Carta ${card.rank} de ${card.suit} não encontrada na mão do jogador ${playerId}.`);
        return prev;
      }

      const updatedPlayers = prev.players.map(p => {
        if (p.id === playerId) {
          const newHand = p.hand.filter(c => c.rank !== card.rank || c.suit !== card.suit);
          return { ...p, hand: newHand };
        }
        return p;
      });

      const newTrick = [...prev.currentTrick, { card, playerId }];
      console.log(`[playCard] Jogador ${playerId} jogou ${card.rank} de ${card.suit}. Cartas na vaza: ${newTrick.length}.`);

      const activePlayers = updatedPlayers.filter(p => p.lives > 0); // Considera apenas jogadores ativos para a vez
      
      let nextPlayerIndex = (prev.currentPlayerIndex + 1) % updatedPlayers.length;
      // Ajusta nextPlayerIndex para pular jogadores eliminados
      while (updatedPlayers[nextPlayerIndex] && updatedPlayers[nextPlayerIndex].lives === 0) {
          nextPlayerIndex = (nextPlayerIndex + 1) % updatedPlayers.length;
      }

      let newPhase: GamePhase = prev.phase;
      let nextTrickWinner: Player | null = null;
      let newRoundStartPlayerIndex = prev.roundStartPlayerIndex; // Mantém quem começa a próxima vaza por padrão

      // Se todos os jogadores ativos jogaram na vaza
      if (newTrick.length === activePlayers.length) { // Comparar com activePlayers.length é mais preciso
        console.log("[playCard] Todos os jogadores jogaram na vaza. Calculando vencedor...");
        // Passa updatedPlayers para calculateTrickWinner
        const winner = calculateTrickWinner(newTrick, prev.gameMode, prev.trumpRank, updatedPlayers); // <-- Usa a função importada
        nextTrickWinner = winner;

        let playersAfterTrick = updatedPlayers;

        if (winner.id === 'EMPATE') {
          console.log("[playCard] Vaza empatada! Ninguém ganha vazas nesta.");
        } else {
          // Apenas atualiza as vazas ganhas se não houver empate
          playersAfterTrick = updatedPlayers.map(p =>
            p.id === winner.id ? { ...p, vazasWon: p.vazasWon + 1 } : p
          );
          console.log(`[playCard] Vencedor da vaza: ${winner.name}. Vazas ganhas: ${playersAfterTrick.find(p => p.id === winner.id)?.vazasWon}`);
        }

        // Verifica se a rodada terminou (todas as mãos estão vazias para jogadores ativos)
        const isRoundEnd = playersAfterTrick.filter(p => p.lives > 0).every(p => p.hand.length === 0);
        console.log(`[playCard] É o fim da rodada? ${isRoundEnd}.`);

        if (isRoundEnd) {
          timerRef.current = setTimeout(() => endRound(), 2000); // Chama endRound após 2 segundos
          return {
            ...prev,
            players: playersAfterTrick,
            currentTrick: [],
            trickWinner: nextTrickWinner,
            // Não muda currentPlayerIndex aqui, será definido no endRound
            phase: 'roundEnd', // Define a fase como 'roundEnd' para exibir uma mensagem
            roundStartPlayerIndex: newRoundStartPlayerIndex, // Mantém o player inicial da rodada, ou reseta no endRound
            lastTrickPlayed: newTrick,
            lastTrickWinner: winner,
          };
        } else {
          // Se não é o fim da rodada, o vencedor da vaza começa a próxima
          // Encontra o índice global do vencedor para a próxima jogada
          nextPlayerIndex = playersAfterTrick.findIndex(p => p.id === winner.id);
          newRoundStartPlayerIndex = nextPlayerIndex;
          console.log(`[playCard] Não é o fim da rodada. Próxima vaza começa com: ${playersAfterTrick[nextPlayerIndex]?.name}.`);

          return {
            ...prev,
            players: playersAfterTrick,
            currentTrick: [],
            trickWinner: nextTrickWinner,
            currentPlayerIndex: nextPlayerIndex, // O vencedor da vaza joga a próxima
            phase: newPhase,
            roundStartPlayerIndex: newRoundStartPlayerIndex,
            lastTrickPlayed: newTrick,
            lastTrickWinner: winner,
          };
        }
      }

      // Se a vaza ainda não terminou, apenas atualiza e passa para o próximo jogador
      return {
        ...prev,
        players: updatedPlayers,
        currentTrick: newTrick,
        currentPlayerIndex: nextPlayerIndex,
      };
    });
  }, [calculateTrickWinner, endRound, getCardStrength]); // Dependências atualizadas

  const setGameMode = useCallback((mode: 'mineiro' | 'paulista') => {
    console.log(`[setGameMode] Modo de jogo selecionado: ${mode}.`);
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      // isGameStarted: true, // Removido daqui, será definido no initializeGame
    }));
  }, []);

  const initializeGame = useCallback(() => {
    console.log("[initializeGame] Chamado para inicializar o jogo.");
    const selectedMode = gameState.gameMode;
    if (!selectedMode) {
      console.warn("[initializeGame] Modo de jogo não selecionado. Não inicializando.");
      return;
    }

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
    console.log(`[initializeGame] ${numPlayers} jogadores criados.`);

    const newDeck = shuffleDeck(createDeck());
    console.log("[initializeGame] Baralho novo e embaralhado criado. Distribuindo cartas para a Rodada 1...");
    // dealCards agora retorna os jogadores com as mãos já atualizadas
    const { updatedPlayers, remainingDeck, trumpCard, trumpRank } = dealCards(newDeck, initialPlayers, 1);

    // O primeiro jogador a agir é sempre o à esquerda do dealer (jogador 2 se dealer é jogador 1)
    const firstPlayerToActIndex = (0 + 1) % numPlayers;

    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      deck: remainingDeck,
      currentRound: 1,
      dealerIndex: 0, // O dealer inicial é o jogador 1 (índice 0)
      trumpCard: trumpCard,
      trumpRank: trumpRank,
      phase: 'bidding', // Começa na fase de aposta
      currentPlayerIndex: firstPlayerToActIndex, // Primeiro a agir é o jogador 2
      currentTrick: [],
      trickWinner: null,
      roundStartPlayerIndex: firstPlayerToActIndex,
      lastTrickPlayed: null,
      lastTrickWinner: null,
      winner: null,
      isGameStarted: true, // Jogo iniciado aqui
      roundCardsCount: updatedPlayers[0]?.hand.length || 0,
    }));
    console.log(`[initializeGame] Estado do jogo inicializado. Cartas na mão do primeiro jogador: ${updatedPlayers[0]?.hand.length || 0}.`);
  }, [numPlayers, dealCards, gameState.gameMode]); // Dependência atualizada

  useEffect(() => {
    // Dispara a inicialização do jogo apenas uma vez, quando o gameMode é definido
    // e o jogo ainda não foi inicializado (usa isGameStarted como flag).
    if (gameState.gameMode && !gameState.isGameStarted) {
      console.log("[useEffect] Modo de jogo detectado e jogo não inicializado. Chamando initializeGame.");
      initializeGame();
    }
  }, [gameState.gameMode, gameState.isGameStarted, initializeGame]);


  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const { phase, currentPlayerIndex, players, trumpRank, currentTrick, gameMode, winner } = gameState;
    const currentPlayer = players[currentPlayerIndex];
    const activePlayers = players.filter(p => p.lives > 0); // Considera apenas jogadores ativos

    // Se o jogo terminou, não há mais jogadas de bot
    if (winner || phase === 'gameOver') return;

    // Lógica para bots (jogadores que não são 'player-1')
    // Ação do bot apenas se for a vez dele e ele for um jogador ativo
    if (currentPlayer && currentPlayer.id !== 'player-1' && activePlayers.some(p => p.id === currentPlayer.id) && phase !== 'roundEnd') {
      if (phase === 'bidding') {
        timerRef.current = setTimeout(() => {
          const maxBid = currentPlayer.hand.length;
          // Bot tenta apostar inteligentemente (exemplo básico)
          const randomBid = Math.floor(Math.random() * (maxBid + 1)); // Aposta aleatória entre 0 e o número de cartas
          console.log(`[Bot - Bidding] Jogador ${currentPlayer.id} apostando ${randomBid}.`);
          makeBid(currentPlayer.id, randomBid);
        }, 1500); // Tempo para o bot pensar na aposta
      } else if (phase === 'playing' && currentPlayer.hand.length > 0) {
        timerRef.current = setTimeout(() => {
          const firstCardInTrickSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : null;
          let cardToPlay: CardType | undefined;

          // Filtrar cartas que podem ser jogadas (seguir o naipe)
          const cardsOfSameSuit = currentPlayer.hand.filter(card => card.suit === firstCardInTrickSuit);

          if (firstCardInTrickSuit && cardsOfSameSuit.length > 0) {
            // Se tiver o naipe da vaza, joga a carta mais forte desse naipe que tiver
            cardToPlay = cardsOfSameSuit.sort((a, b) => getCardStrength(b, trumpRank, gameMode) - getCardStrength(a, trumpRank, gameMode))[0]; // <-- Usa a função importada
          } else {
            // Se não tiver o naipe, joga a carta mais fraca (para se livrar dela)
            cardToPlay = currentPlayer.hand.sort((a, b) => getCardStrength(a, trumpRank, gameMode) - getCardStrength(b, trumpRank, gameMode))[0]; // <-- Usa a função importada
          }

          if (cardToPlay) {
            console.log(`[Bot - Playing] Jogador ${currentPlayer.id} jogando ${cardToPlay.rank} de ${cardToPlay.suit}.`);
            playCard(currentPlayer.id, cardToPlay);
          } else {
            console.warn(`[Bot - Playing] Bot ${currentPlayer.id} não conseguiu encontrar uma carta para jogar.`);
          }
        }, 1500); // Tempo para o bot jogar a carta
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameState.phase, gameState.currentPlayerIndex, gameState.players, gameState.trumpRank, gameState.currentTrick, gameState.gameMode, gameState.winner, makeBid, playCard, getCardStrength]); // Dependências atualizadas

  return {
    gameState,
    initializeGame,
    makeBid,
    playCard,
    setGameMode,
  };
};