import React from 'react';

import Card from './Card';
import type { MagicApiCardResponse } from 'src/types';

document.addEventListener('contextmenu', event => {
	event.preventDefault();
});

function Board() {
	const boardRef = React.useRef<HTMLDivElement>(null);
	const [cards, setCards] = React.useState<MagicApiCardResponse[]>([]);
	const [selectedCards, setSelectedCards] = React.useState<string[]>([]);

	const [isSelecting, setIsSelecting] = React.useState(false);
	const [selectionArea, setSelectionArea] = React.useState({
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
	});

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsSelecting(true);
		const { clientX, clientY } = e;
		setSelectionArea({
			startX: clientX,
			startY: clientY,
			endX: clientX,
			endY: clientY,
		});
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isSelecting) {
			const { clientX, clientY } = e;
			setSelectionArea(prev => ({ ...prev, endX: clientX, endY: clientY }));
		}
	};

	const handleMouseUp = () => {
		setIsSelecting(false);
		logSelectedCards();
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

	React.useEffect(() => {
		async function getCards() {
			try {
				const response = await fetch('public/magic_api_response.json');
				const data = await response.json();
				setCards(data.cards);
			} catch (error) {
				console.log(error);
			}
		}

		getCards();
	}, []);

	return (
		<div
			ref={boardRef}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			style={{
				height: 'calc(100vh - 17px )',
				width: '200vw',
				overflowY: 'hidden',
				backgroundColor: 'hsl(0, 0%, 50%)',
				position: 'relative',
			}}
		>
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
			<div>
				{cards.length > 0 &&
					cards.slice(0, 23).map((card, index) => {
						return (
							<Card
								key={card.id + index}
								card={card}
								initialCoordinates={{ x: 5, y: 470 }}
								index={index}
								isSelected={selectedCards.includes(card.id)}
							/>
						);
					})}
			</div>
		</div>
	);
}

export default Board;
