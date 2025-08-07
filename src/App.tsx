import { useState, useEffect } from 'react';
import './index.css';
// **Mude esta linha para importar como exportação nomeada:**
import { Card } from './components/Card/Card'; // <-- AQUI É A MUDANÇA
import { createDeck, shuffleDeck } from './utils/cardUtils';
import { Card as CardType } from './types/gameTypes';

function App() {
  const [deck, setDeck] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [dummyCard, setDummyCard] = useState<CardType | null>(null);

  useEffect(() => {
    const newDeck = createDeck();
    const shuffled = shuffleDeck([...newDeck]);

    setDeck(shuffled);
    setPlayerHand(shuffled.slice(0, 3));
    setDummyCard(shuffled[5]);
  }, []);

  return (
    <div className="game-container">
      <h1>Bem-vindo ao Fodinha!</h1>

      <h2>Mão do Jogador (Exemplo):</h2>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
        {playerHand.map((card, index) => (
          <Card key={`${card.rank}-${card.suit}-${index}`} card={card} />
        ))}
      </div>

      <h2>Baralho (Versos de Cartas - Exemplo):</h2>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
        {deck.slice(0, 5).map((_, index) => (
          <Card key={`back-${index}`} />
        ))}
      </div>

      <h2>Carta Aleatória do Baralho (Exemplo):</h2>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {dummyCard && <Card card={dummyCard} />}
      </div>
    </div>
  );
}

export default App;