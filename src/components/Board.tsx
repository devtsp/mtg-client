import React from 'react';

import Card from './Card';
import type { MagicApiCardResponse } from 'src/types';

document.addEventListener('contextmenu', event => {
	event.preventDefault();
});

function Board() {
	const [cards, setCards] = React.useState<MagicApiCardResponse[]>([]);

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
			style={{
				height: 'calc(100vh - 17px )',
				width: '200vw',
				overflowY: 'hidden',
				backgroundColor: 'hsl(0, 0%, 50%)',
				position: 'relative',
			}}
		>
			{cards.length > 0 &&
				cards.map((card, index) => {
					if (!card.imageUrl) return null;
					return <Card key={card.id + index} card={card} />;
				})}
		</div>
	);
}

export default Board;
