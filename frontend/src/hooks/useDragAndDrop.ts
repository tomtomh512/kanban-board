import { useState } from 'react';
import { Card, CardStatus } from '../types';

export function useDragAndDrop(
    cards: Card[],
    onDrop: (id: string, status: CardStatus, position: number) => void,
) {
    const [draggedCard, setDraggedCard] = useState<Card | null>(null);

    const getCardsByStatus = (status: CardStatus) =>
        cards.filter(c => c.status === status).sort((a, b) => a.position - b.position);

    const handleDragStart = (card: Card) => setDraggedCard(card);

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleDrop = (status: CardStatus, position: number) => {
        if (draggedCard) {
            onDrop(draggedCard.id, status, position);
            setDraggedCard(null);
        }
    };

    return { getCardsByStatus, handleDragStart, handleDragOver, handleDrop };
}