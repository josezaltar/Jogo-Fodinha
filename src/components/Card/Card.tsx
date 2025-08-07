import {
  CardContainer,
  CardContent,
  CardRank,
  CardSuit,
  TopLeft,
  BottomRight,
  suitSymbols
} from './styles';
import { Card as CardType } from '../../types/gameTypes';

interface CardProps {
  card?: CardType;
}

export function Card({ card }: CardProps) { // <-- AQUI É A MUDANÇA
  if (!card) {
    return <CardContainer $isBack={true} $isRedSuit={false}></CardContainer>;
  }

  const { rank, suit } = card;
  const isRedSuit = suit === 'copas' || suit === 'ouros';

  return (
    <CardContainer $isRedSuit={isRedSuit}>
      <CardContent>
        <TopLeft>
          <CardRank>{rank}</CardRank>
          <CardSuit>{suitSymbols[suit]}</CardSuit>
        </TopLeft>
        <BottomRight>
          <CardRank>{rank}</CardRank>
          <CardSuit>{suitSymbols[suit]}</CardSuit>
        </BottomRight>
      </CardContent>
    </CardContainer>
  );
}

// Não precisa mais de 'export default Card;' aqui