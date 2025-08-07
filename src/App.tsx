import { useState, useEffect } from 'react';
import './index.css';
import { Card } from './components/Card/Card';
import { Card as CardType } from './types/gameTypes';
import { useGameLogic } from './hooks/useGameLogic';

function App() {
  const { gameState, makeBid } = useGameLogic(4); // Importa makeBid

  const [player1Hand, setPlayer1Hand] = useState<CardType[]>([]);

  useEffect(() => {
    if (gameState.players.length > 0 && gameState.players[0].hand.length > 0) {
      setPlayer1Hand(gameState.players[0].hand);
    }
  }, [gameState.players]);

  // Função para simular o lance do Jogador 1 (para testes)
  const handlePlayer1Bid = (bidAmount: number) => {
    if (gameState.phase === 'bidding' && gameState.currentPlayerIndex === 1) { // Jogador 1 (índice 0) é o primeiro a apostar
      // NOTE: Temporariamente, vamos permitir que o jogador 1 (índice 0) aposta,
      // mesmo que currentPlayerIndex comece em 1.
      // No jogo real, o jogador à direita do dealer é o primeiro.
      // Ajuste para fins de teste:
      makeBid(gameState.players[0].id, bidAmount);
    }
  };


  return (
    <div className="game-container">
      <h1>Bem-vindo ao Fodinha!</h1>

      <h2>Status do Jogo:</h2>
      <p>Rodada Atual: {gameState.currentRound}</p>
      <p>Fase Atual: **{gameState.phase.toUpperCase()}**</p>
      <p>É a vez do: **{gameState.players[gameState.currentPlayerIndex]?.name || 'Carregando...'}**</p>
      <p>Manilha da Rodada: {gameState.trumpRank ? `"${gameState.trumpRank}"` : 'N/A'}</p>

      {gameState.trumpCard && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Carta da Manilha:</h3>
          <Card card={gameState.trumpCard} />
        </div>
      )}

      <h3>Jogadores:</h3>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
        {gameState.players.map(player => (
          <div key={player.id} style={{ border: '1px solid #f0c040', padding: '10px', borderRadius: '8px' }}>
            <h4>{player.name} {player.id === `player-${gameState.dealerIndex + 1}` && '(Dealer)'}</h4>
            <p>Vidas: {player.lives}</p>
            <p>Cartas na Mão: {player.hand.length}</p>
            <p>Aposta: {player.bid !== null ? player.bid : 'Não apostou'}</p> {/* Exibe a aposta */}

            {/* Simulação de aposta para o jogador atual na fase de aposta */}
            {gameState.phase === 'bidding' && player.id === gameState.players[gameState.currentPlayerIndex]?.id && (
              <div style={{ marginTop: '10px' }}>
                <p>Faça sua aposta:</p>
                {[0, 1, 2, 3].map(bid => ( // Opções de aposta de 0 a 3 vazas
                  <button
                    key={`bid-${bid}`}
                    onClick={() => makeBid(player.id, bid)}
                    style={{ margin: '5px', padding: '8px 12px', cursor: 'pointer' }}
                  >
                    {bid}
                  </button>
                ))}
              </div>
            )}

            {/* Exibe a mão do Jogador 1 (para fins de depuração/visualização) */}
            {player.id === 'player-1' && player1Hand.length > 0 && (
              <div style={{ display: 'flex', marginTop: '10px' }}>
                {player1Hand.map((card, index) => (
                  <Card key={`${card.rank}-${card.suit}-${index}`} card={card} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <hr style={{ margin: '30px 0', borderColor: '#555' }}/>

      <h2>Cartas Restantes no Baralho: {gameState.deck.length}</h2>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
        {gameState.deck.slice(0, 5).map((_, index) => (
          <Card key={`remaining-back-${index}`} />
        ))}
      </div>
    </div>
  );
}

export default App;