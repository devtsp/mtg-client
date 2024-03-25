import React from 'react';

import type { MagicApiCardResponse } from 'src/types';

const Card = (props: {
  card: MagicApiCardResponse;
  initialCoordinates: { x: number; y: number };
  index: number;
  isSelected: boolean;
  dragOffset: { x: number; y: number };
  dragStartPositions: { [key: string]: { x: number; y: number } } | undefined;
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState(props.initialCoordinates);
  const [isTapped, setIsTapped] = React.useState(false);
  const [isFaceDown, setIsFaceDown] = React.useState(true);

  const [isMouseOver, setIsMouseOver] = React.useState(false);
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [isBeingZoomed, setIsBeingZoomed] = React.useState(false);
  const [dragStart, setDragStart] = React.useState(props.initialCoordinates);
  const [zIndex, setZIndex] = React.useState(props.index);

  function handleMouseEnter() {
    setIsMouseOver(true);
    cardRef.current?.focus();
  }

  function handleMouseLeave() {
    setIsMouseOver(false);
    setIsMouseDown(false);
    cardRef.current?.blur();
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button == 2) {
      e.preventDefault();
      setIsBeingZoomed(!isBeingZoomed);
      return;
    }
    setIsMouseDown(true);
    setIsMouseOver(false);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMouseDown) {
      e.preventDefault();
      setZIndex(101);
      requestAnimationFrame(() => {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      });
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setZIndex(1);
  };

  function handleDoubleClick() {
    setIsTapped(!isTapped);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 't':
        setIsTapped(!isTapped);
        break;
      case 'f':
        setIsFaceDown(!isFaceDown);
        break;
      // case 'ArrowUp':
      // 	e.preventDefault();
      // 	zIndex < 100 && setZIndex(zIndex + 1);
      // 	break;
      // case 'ArrowDown':
      // 	e.preventDefault();
      // 	zIndex > 1 && setZIndex(zIndex - 1);
      // 	break;
      default:
        break;
    }
  }

  React.useEffect(() => {
    if (!props.dragStartPositions) return;
    if (props.isSelected) {
      setZIndex(100);
      // Calculate the drag offset for this card based on its initial position
      const dragStartPos = props.dragStartPositions[props.card.id];
      if (dragStartPos) {
        setPosition({
          x: dragStartPos.x + props.dragOffset.x,
          y: dragStartPos.y + props.dragOffset.y,
        });
      }
    }
  }, [
    props.card.id,
    props.dragOffset,
    props.dragStartPositions,
    props.isSelected,
  ]);

  return (
    <>
      <div
        data-element="CARD"
        id={props.card.id}
        tabIndex={0}
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
        style={{
          position: 'absolute',
          userSelect: 'none',

          // card aspect
          fontFamily: 'garamond',
          width: '150px',
          aspectRatio: 1 / 1.4,
          // Original card image is set as the backgroundImage of the main container
          backgroundImage: `url(${props.card.imageUrl})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          borderRadius: '10px',

          // card 3d position
          top: position.y,
          left: position.x,
          zIndex: zIndex,

          // card style states
          ...(isTapped && { transform: 'rotate(-30deg)' }),
          ...(isFaceDown && { backgroundImage: 'url(public/card_back.jpg)' }),
          ...(isMouseOver && { outline: '4px solid cyan' }),
          ...(isMouseDown && { cursor: 'grabbing', zIndex: 100 }),
          // ...(isMouseOver && !isMouseDown && { transform: 'scale(2)' }),
          ...(props.isSelected && { outline: '4px solid yellowgreen' }),
        }}
      >
        {/* If no image provided display raw data */}

        {/* Maint raw data container */}
        {!props.card.imageUrl && !isFaceDown && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              height: '100%',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'arial',
              fontSize: '12px',
            }}
          >
            {/* Card header container */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '20px',
              }}
            >
              {/* Card Name */}
              <p style={{ fontWeight: '800' }}>{props.card.name}</p>

              {/* Mana Cost */}
              <div style={{ marginLeft: 'auto' }}>
                {/* Generic */}
                {props.card.manaCost.replace(/\D+/g, '')}
                {/* Colored */}
                {props.card.manaCost
                  .replace(/[{}\d]/g, '')
                  .replace(/W/g, '🌞')
                  .replace(/U/g, '💧')
                  .replace(/B/g, '💀')
                  .replace(/G/g, '🌳')
                  .replace(/R/g, '🌋')}
              </div>
            </div>

            {/* Card Type */}
            <p
              style={{
                marginTop: 'auto',
              }}
            >
              {props.card.type}
            </p>

            {/* Card Text */}
            <p
              style={{
                border: '1px solid gray',
                padding: '5px',
                height: 'fit-content',
                lineHeight: '1.1',
              }}
            >
              {props.card.text}
            </p>

            {/* Creature Stats */}
            {props.card.power && (
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  textAlign: 'right',
                }}
              >
                {props.card.power}/{props.card.toughness}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Big preview on hover */}
      {isMouseOver && !isFaceDown && !isMouseDown && (
        <div
          style={{
            width: '20vw',
            aspectRatio: '1 / 1.4',
            ...(props.card.imageUrl
              ? {
                  backgroundImage: `url(${props.card.imageUrl})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }
              : {
                  backgroundColor: 'white',
                  fontSize: '20px',
                  padding: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  outline: '10px solid black',
                  outlineOffset: '-10px',
                }),
            lineHeight: '1.1',
            borderRadius: '16px',
            position: 'fixed',
            cursor: 'pointer',
            transition: 'all 0.1s ease-in-out',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {/* If no image available display raw data */}

          {/* Main raw data container */}
          {!props.card.imageUrl && (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '6px',
                fontSize: '15px',
                height: '100%',
                padding: '5px',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'arial',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <p style={{ fontWeight: '800' }}>{props.card.name}</p>

                {/* Mana Cost */}
                <div style={{ marginLeft: 'auto' }}>
                  {/* Generic */}
                  {props.card.manaCost.replace(/\D+/g, '')}
                  {/* Colored */}
                  {props.card.manaCost
                    .replace(/[{}\d]/g, '')
                    .replace(/W/g, '🌞')
                    .replace(/U/g, '💧')
                    .replace(/B/g, '💀')
                    .replace(/G/g, '🌳')
                    .replace(/R/g, '🌋')}
                </div>
              </div>

              {/* Card Type */}
              <p
                style={{
                  marginTop: 'auto',
                }}
              >
                {props.card.type}
              </p>

              {/* Card Text */}
              <p
                style={{
                  border: '1px solid gray',
                  padding: '5px',
                  height: 'fit-content',
                  lineHeight: '1.1',
                }}
              >
                {props.card.text}
              </p>

              {/* Creature Stats */}
              {props.card.power && (
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    textAlign: 'right',
                  }}
                >
                  {props.card.power}/{props.card.toughness}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Card;
