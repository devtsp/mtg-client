import React from 'react';
import { ScryfallApiResponseCard } from '../types';

const Card = (props: {
  card: Partial<ScryfallApiResponseCard>;
  initialCoordinates: { x: number; y: number };
  index: number;
  isSelected: boolean;
  dragOffset: { x: number; y: number };
  dragStartPositions: { [key: string]: { x: number; y: number } } | undefined;
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState(props.initialCoordinates);
  const [isTapped, setIsTapped] = React.useState(false);
  const [isFaceDown, setIsFaceDown] = React.useState(false);

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
      const dragStartPos = props.dragStartPositions[props?.card?.id || -1];
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
          backgroundImage: `url(${props.card?.image_uris?.png})`,
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
            backgroundImage: 'url(card_back.jpg)',
            backgroundSize: 'cover',
          }),
          ...(isMouseOver && { outline: '4px solid cyan' }),
          ...(isMouseDown && { cursor: 'grabbing', zIndex: 100 }),
          ...(props.isSelected && { outline: '4px solid yellowgreen' }),
        }}
      >
        {/* If no image provided display raw data */}

        {/* Main raw data container */}
        {!props.card.image_uris?.png && !isFaceDown && (
          <div
            style={{
              backgroundColor: 'gray',
              borderRadius: '7px',
              height: '100%',
              overflow: 'hidden',
              padding: '5px',
              display: 'flex',
              flexDirection: 'column',
              fontSize: '12px',
              border: '8px solid black',
            }}
          >
            {/* Card header container */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                fontSize: '12px',
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
              <div
                style={{
                  whiteSpace: 'nowrap',
                }}
              >
                {/* Generic */}
                {(
                  props?.card?.mana_cost ||
                  props?.card?.card_faces?.[0].mana_cost
                )?.replace(/\D+/g, '')}
                {/* Colored */}
                {(
                  props?.card?.mana_cost ||
                  props?.card?.card_faces?.[0].mana_cost
                )
                  ?.replace(/[{}\d]/g, '')
                  ?.replace(/W/g, '🌞')
                  ?.replace(/U/g, '💧')
                  ?.replace(/B/g, '💀')
                  ?.replace(/G/g, '🌳')
                  ?.replace(/R/g, '🌋')}
              </div>
            </div>

            {/* Card Type */}
            <p
              style={{
                marginTop: 'auto',
                lineHeight: '1',
              }}
            >
              {props.card.type_line}
            </p>

            {/* Card Text */}
            <p
              style={{
                border: '1px solid black',
                padding: '5px',
                maxHeight: '50%',
                overflow: 'auto',
                lineHeight: '1.1',
                fontFamily: 'arial',
                fontSize: '12px',
              }}
            >
              {props.card.oracle_text || props.card.card_faces?.[0].oracle_text}
            </p>

            {/* Creature Stats */}
            {props.card.power ||
              (props?.card?.card_faces?.[0].power && (
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    textAlign: 'right',
                    height: '15px',
                  }}
                >
                  {props.card.power || props?.card?.card_faces?.[0].power}/
                  {props.card.toughness ||
                    props?.card?.card_faces?.[0].toughness}
                </p>
              ))}
          </div>
        )}
      </div>

      {/* Big preview on hover */}
      {isMouseOver && !isMouseDown && (
        <div
          style={{
            width: 'max(15vw, 300px)',
            backgroundColor: 'gray',
            aspectRatio: '1 / 1.4',
            ...(props.card.image_uris?.png
              ? {
                  backgroundImage: `url(${props.card.image_uris?.png})`,
                }
              : {
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
            right: '50%',
            cursor: 'pointer',
            transition: 'all 0.1s ease-in-out',
            zIndex: 1000,
            pointerEvents: 'none',
            fontSize: '20px',
            padding: '30px',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            ...(isFaceDown && { backgroundImage: 'url(card_back.jpg)' }),
          }}
        >
          {/* If no image available display raw data */}

          {/* Main raw data container */}
          {!props.card.image_uris?.png && !isFaceDown && (
            <div
              style={{
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
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  lineHeight: '18px',
                  borderRadius: '8px',
                }}
              >
                <p style={{ fontWeight: '800', fontFamily: 'garamond' }}>
                  {props.card.name}
                </p>

                {/* Mana Cost */}
                <div
                  style={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  {/* Generic */}
                  {(
                    props?.card?.mana_cost ||
                    props?.card?.card_faces?.[0].mana_cost
                  )?.replace(/\D+/g, '')}
                  {/* Colored */}
                  {(
                    props?.card?.mana_cost ||
                    props?.card?.card_faces?.[0].mana_cost
                  )
                    ?.replace(/[{}\d]/g, '')
                    ?.replace(/W/g, '🌞')
                    ?.replace(/U/g, '💧')
                    ?.replace(/B/g, '💀')
                    ?.replace(/G/g, '🌳')
                    ?.replace(/R/g, '🌋')}
                </div>
              </div>

              {/* Card Type */}
              <p
                style={{
                  marginTop: 'auto',
                  lineHeight: '18px',
                }}
              >
                {props.card.type_line}
              </p>

              {/* Card Text */}
              <p
                style={{
                  border: '1px solid black',
                  padding: '10px 14px',
                  maxHeight: '50%',
                  overflow: 'auto',
                  lineHeight: '1.1',
                  marginTop: '10px',
                }}
                data-element="hover-preview-oracle-text"
              >
                {props.card.oracle_text ||
                  props.card.card_faces?.[0].oracle_text}
              </p>

              {/* Creature Stats */}
              {props.card.power ||
                (props?.card?.card_faces?.[0].power && (
                  <p
                    style={{
                      fontSize: '30px',
                      marginTop: '5px',
                      fontWeight: '800',
                      textAlign: 'right',
                    }}
                  >
                    {props.card.power || props?.card?.card_faces?.[0].power}/
                    {props.card.toughness ||
                      props?.card?.card_faces?.[0].toughness}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Card;
