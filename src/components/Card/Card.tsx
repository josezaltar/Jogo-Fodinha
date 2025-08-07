// src/components/Card/Card.tsx
import React from 'react';
import { Card as CardType } from '../../types/gameTypes'; // Renomeia para evitar conflito
import './Card.css'; // Vamos criar este arquivo de CSS também!

interface CardProps {
  card: CardType;
  isFaceDown?: boolean;
  isTrump?: boolean;
  onClick?: (card: CardType) => void;
  isClickable?: boolean;
}

const Card: React.FC<CardProps> = ({ card, isFaceDown = false, isTrump = false, onClick, isClickable = false }) => {
  const cardClass = `card ${card.suit} ${isFaceDown ? 'face-down' : ''} ${isTrump ? 'trump' : ''} ${isClickable ? 'clickable' : ''}`;

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(card);
    }
  };

  if (isFaceDown) {
    return (
      <div className={cardClass} onClick={handleClick}>
        <div className="card-back"></div>
      </div>
    );
  }

  return (
    <div className={cardClass} onClick={handleClick}>
      <div className="card-content">
        <span className="rank">{card.rank}</span>
        <span className="suit-icon">
          {card.suit === 'copas' && '♥'}
          {card.suit === 'espadas' && '♠'}
          {card.suit === 'ouros' && '♦'}
          {card.suit === 'paus' && '♣'}
        </span>
      </div>
    </div>
  );
};

export default Card;