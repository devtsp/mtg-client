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
  };

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 't':
        setIsTapped(!isTapped);
        break;
      case 'f':
        setIsFaceDown(!isFaceDown);
        break;
      case 'ArrowUp':
        e.preventDefault();
        zIndex < 100 && setZIndex(zIndex + 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        zIndex > 1 && setZIndex(zIndex - 1);
        break;
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
        data-card-name={props.card.name}
        id={props.card.id}
        tabIndex={0}
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        style={{
          position: 'absolute',
          userSelect: 'none',

          // card aspect
          fontFamily: 'garamond',
          width: '150px',
          aspectRatio: 1 / 1.39,
          borderRadius: '7px',
          // Original card image is set as the backgroundImage of the main container
          backgroundImage: `url(${props.card.imageUrl})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',

          // card 3d position
          top: position.y,
          left: position.x,
          zIndex: isMouseOver ? 101 : zIndex,

          // card style states
          ...(isTapped && { transform: 'rotate(-30deg)' }),
          ...(isFaceDown && {
            backgroundImage: 'url(public/card_back.jpg)',
            backgroundSize: 'cover',
          }),
          ...(isMouseOver && { outline: '4px solid cyan' }),
          ...(isMouseDown && { cursor: 'grabbing', zIndex: 100 }),
          ...(props.isSelected && { outline: '4px solid yellowgreen' }),
        }}
      >
        {/* If no image provided display raw data */}

        {/* Main raw data container */}
        {!props.card.imageUrl && !isFaceDown && (
          <div
            style={{
              backgroundColor: props.card.colorIdentity.includes('W')
                ? 'wheat'
                : 'yellow',
              borderRadius: '7px',
              height: '100%',
              overflow: 'hidden',
              padding: '5px',
              display: 'flex',
              flexDirection: 'column',
              fontSize: '14px',
              border: '8px solid black',
            }}
          >
            {/* Card header container */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                fontSize: '16px',
                flexWrap: 'wrap',
              }}
            >
              {/* Card Name */}
              <p
                style={{
                  fontWeight: '600',
                  paddingRight: '10px',
                  marginRight: 'auto',
                  lineHeight: '1',
                }}
              >
                {props.card.name}
              </p>

              {/* Mana Cost */}
              <div>
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
                lineHeight: '1',
              }}
            >
              {props.card.type}
            </p>

            {/* Card Text */}
            <p
              style={{
                border: '1px solid gray',
                borderRadius: '4px',
                padding: '5px',
                maxHeight: '50%',
                overflow: 'auto',
                lineHeight: '1.1',
                fontFamily: 'arial',
                fontSize: '12px',
              }}
            >
              {props.card.text}
            </p>

            {/* Creature Stats */}
            {props.card.power && (
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  textAlign: 'right',
                  height: '15px',
                }}
              >
                {props.card.power}/{props.card.toughness}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Big preview on hover */}
      {isMouseOver && !isMouseDown && (
        <div
          style={{
            width: '20vw',
            aspectRatio: '1 / 1.4',
            ...(props.card.imageUrl
              ? {
                  backgroundImage: `url(${props.card.imageUrl})`,
                }
              : {
                  backgroundColor: 'white',
                  fontSize: '20px',
                  padding: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  outline: '20px solid black',
                  outlineOffset: '-20px',
                }),
            lineHeight: '1.1',
            borderRadius: '18px',
            position: 'fixed',
            right: 0,
            cursor: 'pointer',
            transition: 'all 0.1s ease-in-out',
            zIndex: 1000,
            pointerEvents: 'none',
            fontFamily: 'garamond',
            fontSize: '26px',
            padding: '30px',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            ...(isFaceDown && { backgroundImage: 'url(public/card_back.jpg)' }),
          }}
        >
          {/* If no image available display raw data */}

          {/* Main raw data container */}
          {!props.card.imageUrl && !isFaceDown && (
            <div
              style={{
                backgroundColor: 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 3px 6px 14px',
                  lineHeight: '18px',
                  border: '3px ridge lightgray',
                  borderRadius: '8px',
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
                  lineHeight: '18px',
                }}
              >
                {props.card.type}
              </p>

              {/* Card Text */}
              <p
                style={{
                  border: '5px inset lightgray',
                  padding: '10px 14px',
                  maxHeight: '50%',
                  overflow: 'auto',
                  lineHeight: '1.1',
                  marginTop: '10px',
                }}
              >
                {props.card.text}
              </p>

              {/* Creature Stats */}
              {props.card.power && (
                <p
                  style={{
                    fontSize: '30px',
                    marginTop: '5px',
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
