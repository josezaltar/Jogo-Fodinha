// src/components/Card/styles.ts
import styled from 'styled-components';
import { Suit } from '../../types/gameTypes'; // Importa a tipagem Suit, pois é usada aqui

// Mapeamento de naipes para símbolos Unicode (mantemos aqui, pois está relacionado aos estilos)
export const suitSymbols: Record<Suit, string> = {
  copas: '♥',
  espadas: '♠',
  ouros: '♦',
  paus: '♣',
};

// Define as propriedades que o CardContainer (o elemento div estilizado) vai receber
interface CardContainerProps {
  $isRedSuit: boolean;
  $isBack?: boolean;
}

// Cria um componente div estilizado para o Card
export const CardContainer = styled.div<CardContainerProps>`
  width: 70px;
  height: 100px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  font-size: 1.2em;
  font-weight: bold;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.1s ease-in-out;
  user-select: none;
  margin: 5px;

  &:hover {
    transform: translateY(-5px);
  }

  ${props => props.$isBack && `
    background-color: #007bff;
    background-image: linear-gradient(45deg, #0056b3 25%, transparent 25%, transparent 75%, #0056b3 75%, #0056b3),
                      linear-gradient(45deg, #0056b3 25%, transparent 25%, transparent 75%, #0056b3 75%, #0056b3);
    background-size: 20px 20px;
    background-position: 0 0, 10px 10px;
    border: 1px solid #004085;
  `}

  color: ${props => props.$isRedSuit ? 'red' : 'black'};
`;

// Cria um componente div estilizado para o conteúdo interno da carta
export const CardContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
  box-sizing: border-box;
`;

// Componentes estilizados para o rank e o naipe
export const CardRank = styled.span`
  font-size: 1em;
`;

export const CardSuit = styled.span`
  font-size: 0.8em;
`;

export const TopLeft = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const BottomRight = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  transform: rotate(180deg);
`;