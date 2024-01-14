import React from 'react';

import type { MagicApiCardResponse } from 'src/types';

const Card = ({ card }: { card: MagicApiCardResponse }) => {
	const cardRef = React.useRef<HTMLDivElement>(null);
	const [position, setPosition] = React.useState({ x: 0, y: 0 });
	const [isTapped, setIsTapped] = React.useState(false);
	const [isFaceDown, setIsFaceDown] = React.useState(false);

	const [isMouseOver, setIsMouseOver] = React.useState(false);
	const [isMouseDown, setIsMouseDown] = React.useState(false);
	const [isBeingZoomed, setIsBeingZoomed] = React.useState(false);
	const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
	const [zIndex, setZIndex] = React.useState(1);

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
		setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isMouseDown) {
			e.preventDefault();
			setPosition({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y,
			});
		}
	};

	const handleMouseUp = () => {
		setIsMouseDown(false);
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
			case 'ArrowUp':
				zIndex < 100 && setZIndex(zIndex + 1);
				break;
			case 'ArrowDown':
				zIndex > 1 && setZIndex(zIndex - 1);
				break;
			default:
				break;
		}
	}

	return (
		<>
			<div
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
					cursor: 'grab',
					color: 'red',

					// card aspect
					width: '150px',
					aspectRatio: 1 / 1.4,
					backgroundImage: `url(${card.imageUrl})`,
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
					...(isMouseOver && { outline: '2px solid cyan' }),
					...(isMouseDown && { cursor: 'grabbing', zIndex: 100 }),
				}}
			></div>
			{isBeingZoomed && (
				<div
					onMouseDown={() => setIsBeingZoomed(false)}
					style={{
						width: '400px',
						aspectRatio: 1 / 1.4,
						backgroundImage: `url(${card.imageUrl})`,
						backgroundSize: 'contain',
						backgroundRepeat: 'no-repeat',
						backgroundPosition: 'center',
						borderRadius: '20px',
						position: 'absolute',
						top: '20vh',
						left: '40vw',
						cursor: 'pointer',
						transition: 'all 0.1s ease-in-out',
						zIndex: 1000,
					}}
				></div>
			)}
		</>
	);
};

export default Card;
