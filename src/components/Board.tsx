/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import Card from './Card';
import type { ScryfallApiResponseCard } from 'src/types';

document.addEventListener('contextmenu', event => {
  event.preventDefault();
});

const API_1 = 'https://api.scryfall.com';

function Board() {
  const boardRef = React.useRef<HTMLDivElement>(null);

  const [userInput, setUserInput] = React.useState<string>('Omnath');

  const [loadedCards, setLoadedCards] = React.useState<
    ScryfallApiResponseCard[]
  >([]);
  const [error, setError] = React.useState<any>();
  const [loading, setLoading] = React.useState<boolean>(false);

  const [selectedCards, setSelectedCards] = React.useState<string[]>([]);
  const [dragStartPositions, setDragStartPositions] = React.useState<{
    [key: string]: { x: number; y: number };
  }>();

  const [menuOpen, setMenuOpen] = React.useState(true);

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
    const target = e.target as HTMLDivElement;
    if (target.dataset?.element === 'CARD') {
      console.log('Mouse Down Card');
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
    } else if (target.dataset.element === 'BOARD') {
      console.log('Mouse Down Board');
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
      console.log('Selecting... ');
      const scrollLeft = document.documentElement.scrollLeft;
      const scrollTop = document.documentElement.scrollTop;
      const clientX = e.clientX + scrollLeft;
      const clientY = e.clientY + scrollTop;
      setSelectionArea(prev => ({ ...prev, endX: clientX, endY: clientY }));
    } else if (isDragging && selectedCards.length > 0) {
      console.log('Dragging');
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setDragOffset({ x: deltaX, y: deltaY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      console.log('Release Drag');
      setIsDragging(false);
    } else if (isSelecting) {
      console.log('Finish Selection');
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
    const scrollLeft = document.documentElement.scrollLeft;
    const scrollTop = document.documentElement.scrollTop;

    const newSelectedCards = loadedCards.filter(card => {
      const cardRect = document
        .getElementById(card.id)
        ?.getBoundingClientRect();

      if (!cardRect) return false;

      const cardLeft = cardRect.left + scrollLeft - boardRect.left;
      const cardTop = cardRect.top + scrollTop - boardRect.top;
      const cardRight = cardRect.right + scrollLeft - boardRect.left;
      const cardBottom = cardRect.bottom + scrollTop - boardRect.top;

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

    setSelectedCards(newSelectedCards!.map(card => card.id));
    console.log('Selected Cards:', newSelectedCards);
  };

  function handleKeyDown(e: React.KeyboardEvent) {
    console.log('Keydown ', e.key);
    if (e.key === 'Escape') {
      setSelectedCards([]);
    } else if (e.key.toLowerCase() === 'm') {
      const focusedElement = document.activeElement;
      if (focusedElement instanceof HTMLInputElement) return;
      setMenuOpen(!menuOpen);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    fetch(API_1 + '/cards/search?q=' + userInput)
      .then(r => {
        if (!r.ok) {
          throw new Error(r.statusText);
        }
        return r.json();
      })
      .then(list => {
        console.log(list);
        setLoadedCards(prev => [...prev, ...list.data]);
      })
      .catch(err => {
        console.log(err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }

  React.useEffect(() => {
    setLoading(true);
    fetch(API_1 + '/cards/search?page=1&q=' + userInput)
      .then(r => {
        if (!r.ok) {
          throw new Error(r.statusText);
        }
        return r.json();
      })
      .then(list => {
        setLoadedCards(list.data);
      })
      .catch(err => {
        console.log(err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

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
        outlineColor: 'red',
      }}
    >
      {/* Menu */}
      {menuOpen && (
        <div
          style={{
            resize: 'both',
            overflow: 'auto',
            position: 'absolute',
            right: 0,
            height: '100%',
            backgroundColor: 'rgba(255,255,255,.3)',
            zIndex: 200,
          }}
        >
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            style={{
              margin: '1rem',
            }}
          >
            {/* TEXT INPUT */}
            <input
              style={{
                width: '100%',
                padding: '1rem',
                resize: 'none',
              }}
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              name="cardList"
              id="card-list"
            />

            <div
              style={{
                display: 'flex',
                marginTop: '10px',
                gap: '10px',
              }}
            >
              <button type="submit">Send</button>
              <button
                type="reset"
                onClick={() => {
                  setUserInput('');
                }}
              >
                Clear
              </button>
            </div>
            {error && (
              <div
                style={{
                  color: 'crimson',
                }}
              >
                {error.toString()}
              </div>
            )}
          </form>
        </div>
      )}

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

      {/* Cards Spawned */}
      {!loading && !error && loadedCards.length
        ? loadedCards?.map((card, index) => {
            if (!card?.id) {
              return <div>Uups</div>;
            }

            return (
              <Card
                key={card.id + index}
                card={card}
                initialCoordinates={{ x: 5 + index * 20, y: 650 + index }}
                index={index}
                isSelected={selectedCards.includes(card.id)}
                dragOffset={dragOffset}
                dragStartPositions={dragStartPositions}
              />
            );
          })
        : null}
    </div>
  );
}

export default Board;
