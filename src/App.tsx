import { useState, useEffect } from 'react';
import './index.css';
import { Card } from './components/Card/Card'; // Importa o componente Card
import { Card as CardType } from './types/gameTypes'; // Importa a tipagem CardType (ainda útil para testes visuais)
import { useGameLogic } from './hooks/useGameLogic'; // Importa nosso novo hook

function App() {
  // Substituímos os estados locais por nosso hook useGameLogic
  const { gameState } = useGameLogic(4); // Iniciamos com 4 jogadores

  // Como o useGameLogic já inicializa o baralho e as mãos, podemos simplificar aqui.
  // Para fins de demonstração inicial, vamos ainda mostrar algumas cartas.
  // No futuro, a "mão do jogador" virá diretamente do gameState.players[0].hand
  const [testPlayerHand, setTestPlayerHand] = useState<CardType[]>([]);
  const [testDummyCard, setTestDummyCard] = useState<CardType | null>(null);

  useEffect(() => {
    // Apenas para mostrar cartas de exemplo, como fizemos antes.
    // No futuro, removemos isso e usamos gameState.players[0].hand
    if (gameState.deck.length > 0) {
      setTestPlayerHand(gameState.deck.slice(0, 3));
      setTestDummyCard(gameState.deck[5]);
    }
  }, [gameState.deck]); // Roda quando o deck do gameState é populado

  return (
    <div className="game-container">
      <h1>Bem-vindo ao Fodinha!</h1>

      {/* Exibindo informações do estado do jogo */}
      <h2>Status do Jogo:</h2>
      <p>Rodada Atual: {gameState.currentRound}</p>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
        {gameState.players.map(player => (
          <div key={player.id} style={{ border: '1px solid #f0c040', padding: '10px', borderRadius: '8px' }}>
            <h3>{player.name}</h3>
            <p>Vidas: {player.lives}</p>
            <p>Cartas na Mão: {player.hand.length}</p> {/* Por enquanto, 0 */}
            {/* Futuramente: <PlayerHand hand={player.hand} /> */}
          </div>
        ))}
      </div>

      <hr style={{ margin: '30px 0', borderColor: '#555' }}/>

      <h2>Mão do Jogador (Exemplo de Teste Visual):</h2>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
        {testPlayerHand.map((card, index) => (
          <Card key={`${card.rank}-${card.suit}-${index}`} card={card} />
        ))}
      </div>

      <h2>Baralho (Versos de Cartas - Exemplo de Teste Visual):</h2>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
        {gameState.deck.slice(0, 5).map((_, index) => ( // Mostra 5 versos do deck do gameState
          <Card key={`back-${index}`} /> // Renderiza o verso da carta (sem prop 'card')
        ))}
      </div>

      <h2>Carta Aleatória do Baralho (Exemplo de Teste Visual):</h2>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {testDummyCard && <Card card={testDummyCard} />}
      </div>
    </div>
  );
}

export default App;