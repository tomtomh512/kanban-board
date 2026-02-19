import { Card, UserSummary } from '../types';

interface KanbanCardProps {
    card: Card;
    onDragStart: (card: Card) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onEdit: (card: Card) => void;
    onDelete: (cardId: string) => void;
}

export default function KanbanCard({
                                       card,
                                       onDragStart,
                                       onDragOver,
                                       onDrop,
                                       onEdit,
                                       onDelete,
                                   }: KanbanCardProps) {
    return (
        <div
            draggable
            onDragStart={() => onDragStart(card)}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm flex-1">{card.title}</h4>
                <div className="flex gap-1 ml-2">
                    <button
                        onClick={() => onEdit(card)}
                        className="text-blue-500 hover:text-blue-700 text-xs"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(card.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                    >
                        Delete
                    </button>
                </div>
            </div>
            {card.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {card.description}
                </p>
            )}
            {card.link && (
                <a
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline block mb-2"
                >
                    🔗 Link
                </a>
            )}
            {card.assignees.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {card.assignees.map((assignee: UserSummary) => (
                        <span
                            key={assignee.id}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                        >
                            {assignee.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}