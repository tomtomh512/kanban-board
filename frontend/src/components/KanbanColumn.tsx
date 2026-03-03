import { Card, CardStatus } from '../types';
import KanbanCard from './KanbanCard';

export const STATUS_COLUMNS = [
    { id: CardStatus.BACKLOG, title: 'Backlog', color: 'bg-gray-100' },
    { id: CardStatus.PLANNED, title: 'Planned', color: 'bg-blue-100' },
    { id: CardStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-yellow-100' },
    { id: CardStatus.TESTING, title: 'Testing', color: 'bg-purple-100' },
    { id: CardStatus.FINISHED, title: 'Finished', color: 'bg-green-100' },
];

interface KanbanColumnProps {
    id: CardStatus;
    title: string;
    color: string;
    cards: Card[];
    onDragStart: (card: Card) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDropColumn: (e: React.DragEvent) => void;
    onDropCard: (e: React.DragEvent, index: number) => void;
    onEdit: (card: Card) => void;
    onDelete: (cardId: string) => void;
}

export default function KanbanColumn({
                                         title,
                                         color,
                                         cards,
                                         onDragStart,
                                         onDragOver,
                                         onDropColumn,
                                         onDropCard,
                                         onEdit,
                                         onDelete,
                                     }: KanbanColumnProps) {
    return (
        <div
            className="flex-shrink-0 w-80"
            onDragOver={onDragOver}
            onDrop={onDropColumn}
        >
            <div className={`${color} rounded-lg p-3 mb-3`}>
                <h3 className="font-semibold text-sm">
                    {title} ({cards.length})
                </h3>
            </div>
            <div className="space-y-3 min-h-[200px]">
                {cards.map((card, index) => (
                    <KanbanCard
                        key={card.id}
                        card={card}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDropCard(e, index)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}