import React from 'react';

import Card from './Card';
import type { MagicApiCardResponse } from 'src/types';

document.addEventListener('contextmenu', event => {
  event.preventDefault();
});

function shuffle(array: MagicApiCardResponse[]) {
  const copy = [...array];
  let currentIndex = copy.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [copy[currentIndex], copy[randomIndex]] = [
      copy[randomIndex],
      copy[currentIndex],
    ];
  }

  return copy;
}

function Board() {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const [cards, setCards] = React.useState<MagicApiCardResponse[]>([]);
  const [selectedCards, setSelectedCards] = React.useState<string[]>([]);
  const [dragStartPositions, setDragStartPositions] = React.useState<{
    [key: string]: { x: number; y: number };
  }>();

  const [menuOpen, setMenuOpen] = React.useState(false);

  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  const [isSelecting, setIsSelecting] = React.useState(false);
  const [selectionArea, setSelectionArea] = React.useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!(e.target instanceof HTMLDivElement)) {
      return;
    }
    if (e.target.dataset.element === 'CARD') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });

      const scrollLeft = document.documentElement.scrollLeft;
      const scrollTop = document.documentElement.scrollTop;

      // Store the initial positions of the selected cards
      const newDragStartPositions: typeof dragStartPositions = {};
      selectedCards.forEach(cardId => {
        const cardElement = document.getElementById(cardId);
        if (cardElement) {
          const cardRect = cardElement.getBoundingClientRect();
          newDragStartPositions[cardId] = {
            x: cardRect.left + scrollLeft,
            y: cardRect.top + scrollTop,
          };
        }
      });
      setDragStartPositions(newDragStartPositions);
    } else if (e.target.dataset.element === 'BOARD') {
      setIsSelecting(true);
      const scrollLeft = document.documentElement.scrollLeft;
      const scrollTop = document.documentElement.scrollTop;
      const clientX = e.clientX + scrollLeft;
      const clientY = e.clientY + scrollTop;
      setSelectionArea({
        startX: clientX,
        startY: clientY,
        endX: clientX,
        endY: clientY,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting) {
      const scrollLeft = document.documentElement.scrollLeft;
      const scrollTop = document.documentElement.scrollTop;
      const clientX = e.clientX + scrollLeft;
      const clientY = e.clientY + scrollTop;
      setSelectionArea(prev => ({ ...prev, endX: clientX, endY: clientY }));
    } else if (isDragging && selectedCards.length > 0) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setDragOffset({ x: deltaX, y: deltaY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    } else if (isSelecting) {
      setIsSelecting(false);
      logSelectedCards();
    }

    // Only clear the selection if the user is not dragging cards
    if (!isDragging) {
      setSelectionArea({ startX: 0, startY: 0, endX: 0, endY: 0 });
    }
  };

  const logSelectedCards = () => {
    if (!boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const newSelectedCards = cards.filter(card => {
      const cardRect = document
        .getElementById(card.id)
        ?.getBoundingClientRect();

      if (!cardRect) return false;

      const cardLeft = cardRect.left - boardRect.left;
      const cardTop = cardRect.top - boardRect.top;
      const cardRight = cardRect.right - boardRect.left;
      const cardBottom = cardRect.bottom - boardRect.top;

      const selectionLeft = Math.min(selectionArea.startX, selectionArea.endX);
      const selectionTop = Math.min(selectionArea.startY, selectionArea.endY);
      const selectionRight = Math.max(selectionArea.startX, selectionArea.endX);
      const selectionBottom = Math.max(
        selectionArea.startY,
        selectionArea.endY
      );

      return (
        cardLeft >= selectionLeft &&
        cardTop >= selectionTop &&
        cardRight <= selectionRight &&
        cardBottom <= selectionBottom
      );
    });

    setSelectedCards(newSelectedCards.map(card => card.id));
    console.log('Selected Cards:', newSelectedCards);
  };

  function handleKeyDown(e: React.KeyboardEvent) {
    console.log(e.key);
    if (e.key === 'Escape') {
      setSelectedCards([]);
    } else if (e.key === 'm') {
      setMenuOpen(!menuOpen);
    }
  }

  React.useEffect(() => {
    async function getCards() {
      try {
        const response = await fetch('public/magic_api_response.json');
        const data = await response.json();
        setCards(shuffle(data.cards));
      } catch (error) {
        console.log(error);
      }
    }

    getCards();
  }, []);

  const deck1 = cards.slice(0, 5);
  const deck2 = cards.slice(5, 10);

  return (
    <div
      tabIndex={0}
      data-element="BOARD"
      ref={boardRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      style={{
        height: '200vh',
        width: '100%',
        overflowX: 'hidden',
        backgroundColor: 'hsl(0, 0%, 50%)',
        position: 'relative',
      }}
    >
      {/* Dragging click down animation */}
      {isSelecting && (
        <div
          style={{
            position: 'absolute',
            border: '1px solid yellowgreen',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            left: Math.min(selectionArea.startX, selectionArea.endX),
            top: Math.min(selectionArea.startY, selectionArea.endY),
            width: Math.abs(selectionArea.endX - selectionArea.startX),
            height: Math.abs(selectionArea.endY - selectionArea.startY),
          }}
        />
      )}

      {/* Deck 1 */}
      {cards.length > 0 &&
        deck1.map((card, index) => {
          return (
            <Card
              key={card.id + index}
              card={card}
              initialCoordinates={{ x: index + 5, y: index + 5 }}
              index={index}
              isSelected={selectedCards.includes(card.id)}
              dragOffset={dragOffset}
              dragStartPositions={dragStartPositions}
            />
          );
        })}

      {/* Deck 2 */}
      {cards.length > 0 &&
        deck2.map((card, index) => {
          return (
            <Card
              key={card.id + index}
              card={card}
              initialCoordinates={{ x: index + 5, y: index + 250 }}
              index={index}
              isSelected={selectedCards.includes(card.id)}
              dragOffset={dragOffset}
              dragStartPositions={dragStartPositions}
            />
          );
        })}
    </div>
  );
}

export default Board;
