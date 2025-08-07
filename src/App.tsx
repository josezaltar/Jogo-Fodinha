// src/App.tsx
import React, { useState } from 'react';
import './index.css';
import Card from './components/Card/Card';
import { useGameLogic } from './hooks/useGameLogic';
import { Player, Card as CardType } from './types/gameTypes'; // Renomeia Card para CardType

function App() {
  const { gameState, makeBid, playCard, setGameMode } = useGameLogic(4); // 4 jogadores
  const {
    players,
    currentRound,
    trumpCard,
    trumpRank,
    phase,
    currentPlayerIndex,
    currentTrick,
    lastTrickPlayed,
    lastTrickWinner,
    gameMode,
    winner,
    isGameStarted,
    roundCardsCount
  } = gameState;

  const humanPlayer = players.find(p => p.id === 'player-1');
  const otherPlayers = players.filter(p => p.id !== 'player-1');
  const currentPlayer = players[currentPlayerIndex];

  const [playerBid, setPlayerBid] = useState<number | null>(null);

  const handleBidChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlayerBid(Number(e.target.value));
  };

  const handleMakeBid = () => {
    if (humanPlayer && playerBid !== null) {
      makeBid(humanPlayer.id, playerBid);
      setPlayerBid(null); // Reseta a seleção após a aposta
    }
  };

  const handlePlayCard = (card: CardType) => {
    if (humanPlayer) {
      playCard(humanPlayer.id, card);
    }
  };

  const renderPlayerInfo = (player: Player) => (
    <div key={player.id} className="player-info">
      <h3>{player.name} {player.id === humanPlayer?.id && '(Você)'} {player.id === currentPlayer?.id && '👑'}</h3>
      <p>Vidas: {player.lives}</p>
      {isGameStarted && (
        <>
          <p>Aposta: {player.bid !== null ? player.bid : '?'}</p>
          <p>Vazas Ganhas: {player.vazasWon}</p>
        </>
      )}
    </div>
  );

  if (!gameMode) {
    return (
      <div className="game-container">
        <h1>Bem-vindo ao Fodinha!</h1>
        <h2>Escolha a Modalidade:</h2>
        <button onClick={() => setGameMode('mineiro')}>Fodinha Mineira</button>
        <button onClick={() => setGameMode('paulista')}>Fodinha Paulista</button>
      </div>
    );
  }

  if (winner) {
    return (
      <div className="game-container">
        <h1>Fim de Jogo!</h1>
        {winner.id !== 'EMPATE' ? (
          <h2>O Vencedor é: {winner.name}! Parabéns!</h2>
        ) : (
          <h2>Nenhum vencedor. Todos foram eliminados!</h2>
        )}
        <button onClick={() => window.location.reload()}>Jogar Novamente</button> {/* Simplesmente recarrega a página */}
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1>Fodinha - Rodada {currentRound}</h1>
      {/* Alterado de <p> para <div> para evitar erro de hidratação se contiver outros elementos de bloco */}
      {isGameStarted && <div>Cartas na Mão nesta Rodada: {roundCardsCount}</div>}
      <h2>Modalidade: {gameMode === 'mineiro' ? 'Mineira (Manilhas Fixas)' : 'Paulista (Manilha da Vira)'}</h2>

      <div className="game-info">
        {trumpCard && (
          // Alterado de <p> para <div> para conter o componente <Card>
          <div>
            Carta Virada (Manilha Base): <Card card={trumpCard} />
            {gameMode === 'paulista' && trumpRank && ` (Manilha é ${trumpRank})`}
            {gameMode === 'mineiro' && ` (Manilhas Fixas: 4P, 7C, AE, 7O)`}
          </div>
        )}
      </div>

      <div className="players-area">
        {otherPlayers.map(renderPlayerInfo)}
      </div>

      <div className="current-trick-area">
        <h3>Vaza Atual:</h3>
        {currentTrick.length > 0 ? (
          <div className="current-trick-cards">
            {currentTrick.map((item, index) => (
              <div key={index} className="played-card-item">
                <Card card={item.card} />
                <p>{players.find(p => p.id === item.playerId)?.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma carta jogada ainda.</p>
        )}
      </div>

      {lastTrickPlayed && lastTrickWinner && (
        <div className="last-trick-area">
          <h3>Última Vaza:</h3>
          <div className="last-trick-cards">
            {lastTrickPlayed.map((item, index) => (
              <div key={index} className="played-card-item">
                <Card card={item.card} />
                <p>{players.find(p => p.id === item.playerId)?.name}</p>
              </div>
            ))}
          </div>
          {lastTrickWinner.id !== 'EMPATE' ? (
            <p>Vencedor da última vaza: {lastTrickWinner.name}</p>
          ) : (
            <p>A última vaza resultou em empate!</p>
          )}
        </div>
      )}

      {humanPlayer && (
        <div className="human-player-area">
          <h2>Sua Mão ({humanPlayer.name}):</h2>
          <div className="player-hand">
            {humanPlayer.hand.map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={handlePlayCard}
                isClickable={
                  phase === 'playing' &&
                  currentPlayer?.id === humanPlayer.id &&
                  humanPlayer.hand.includes(card) // Garante que a carta está na mão
                }
                isTrump={
                  gameMode === 'paulista'
                    ? card.rank === trumpRank
                    : gameMode === 'mineiro'
                      ? (card.rank === '4' && card.suit === 'paus') ||
                        (card.rank === '7' && card.suit === 'copas') ||
                        (card.rank === 'A' && card.suit === 'espadas') ||
                        (card.rank === '7' && card.suit === 'ouros')
                      : false
                }
              />
            ))}
          </div>

          {phase === 'bidding' && currentPlayer?.id === humanPlayer.id && (
            <div className="bid-section">
              <h3>Sua Aposta para esta Rodada:</h3>
              <select onChange={handleBidChange} value={playerBid !== null ? playerBid : ''}>
                <option value="" disabled>Selecione sua aposta</option>
                {Array.from({ length: humanPlayer.hand.length + 1 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <button onClick={handleMakeBid} disabled={playerBid === null}>Apostar</button>
            </div>
          )}
          {phase === 'playing' && currentPlayer?.id === humanPlayer.id && (
            <p>É a sua vez de jogar!</p>
          )}
          {phase === 'bidding' && currentPlayer?.id !== humanPlayer.id && (
            <p>Aguarde a aposta dos outros jogadores...</p>
          )}
          {phase === 'playing' && currentPlayer?.id !== humanPlayer.id && (
            <p>Aguarde a jogada do {currentPlayer?.name}...</p>
          )}
          {phase === 'roundEnd' && !winner && (
            <p>Fim da rodada. Aguardando a próxima...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;