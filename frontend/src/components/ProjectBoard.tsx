import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardStatus, UserSummary } from '../types';
import { useProjectBoard } from '../hooks/useProjectBoard';
import { useCardActions } from '../hooks/useCardActions';
import { useProjectActions } from '../hooks/useProjectActions';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import InviteModal from '../components/InviteModal';
import CardModal from '../components/CardModal';

const STATUS_COLUMNS = [
    { id: CardStatus.BACKLOG, title: 'Backlog', color: 'bg-gray-100' },
    { id: CardStatus.PLANNED, title: 'Planned', color: 'bg-blue-100' },
    { id: CardStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-yellow-100' },
    { id: CardStatus.TESTING, title: 'Testing', color: 'bg-purple-100' },
    { id: CardStatus.FINISHED, title: 'Finished', color: 'bg-green-100' },
];

export default function ProjectBoard() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    const [showCardModal, setShowCardModal] = useState(false);
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const { user, project, cards, isLoading } = useProjectBoard(projectId);

    const closeCardModal = () => {
        setShowCardModal(false);
        setEditingCard(null);
    };

    const { handleCardSubmit, handleDeleteCard, handleMoveCard, isSubmitting } = useCardActions({
        projectId: projectId!,
        editingCard,
        onSaveSuccess: closeCardModal,
    });

    const {
        inviteEmail, setInviteEmail,
        inviteError, setInviteError,
        isInviting,
        handleInviteMember,
        handleRemoveMember,
        handleDeleteProject,
    } = useProjectActions(projectId!);

    const { getCardsByStatus, handleDragStart, handleDragOver, handleDrop } = useDragAndDrop(
        cards,
        handleMoveCard,
    );

    const openCreateModal = () => {
        setEditingCard(null);
        setShowCardModal(true);
    };

    const openEditModal = (card: Card) => {
        setEditingCard(card);
        setShowCardModal(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="text-xl">Loading project...</span>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="text-xl">Project not found</span>
            </div>
        );
    }

    const isOwner = project.owner.id === user?.id;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                ← Back
                            </button>
                            <h1 className="text-xl font-bold">{project.name}</h1>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={openCreateModal}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                                + New Card
                            </button>
                            {isOwner && (
                                <button
                                    onClick={handleDeleteProject}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                >
                                    Delete Project
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                            <p className="text-xs text-gray-500 mb-3">
                                Owner: <span className="font-medium">{project.owner.name}</span>
                            </p>
                            <div>
                                <p className="text-xs font-medium text-gray-700 mb-2">Team Members:</p>
                                <div className="flex flex-wrap gap-2">
                                    {project.members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                                        >
                                            <span>{member.name}</span>
                                            {isOwner && member.id !== project.owner.id && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="text-red-500 hover:text-red-700 text-xs"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="ml-4">
                            {isOwner && (
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600"
                                >
                                    + Invite
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4">
                    {STATUS_COLUMNS.map((column) => {
                        const columnCards = getCardsByStatus(column.id);
                        return (
                            <div
                                key={column.id}
                                className="flex-shrink-0 w-80"
                                onDragOver={handleDragOver}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    handleDrop(column.id, columnCards.length);
                                }}
                            >
                                <div className={`${column.color} rounded-lg p-3 mb-3`}>
                                    <h3 className="font-semibold text-sm">
                                        {column.title} ({columnCards.length})
                                    </h3>
                                </div>
                                <div className="space-y-3 min-h-[200px]">
                                    {columnCards.map((card, index) => (
                                        <div
                                            key={card.id}
                                            draggable
                                            onDragStart={() => handleDragStart(card)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => {
                                                e.stopPropagation();
                                                handleDrop(column.id, index);
                                            }}
                                            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-sm flex-1">{card.title}</h4>
                                                <div className="flex gap-1 ml-2">
                                                    <button
                                                        onClick={() => openEditModal(card)}
                                                        className="text-blue-500 hover:text-blue-700 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCard(card.id)}
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
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            <CardModal
                isOpen={showCardModal}
                editingCard={editingCard}
                members={project.members}
                isSubmitting={isSubmitting}
                onSubmit={handleCardSubmit}
                onClose={closeCardModal}
            />

            <InviteModal
                isOpen={showInviteModal}
                email={inviteEmail}
                error={inviteError}
                isSubmitting={isInviting}
                onEmailChange={setInviteEmail}
                onSubmit={handleInviteMember}
                onClose={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setInviteError('');
                }}
            />
        </div>
    );
}