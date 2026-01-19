import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject, addMember, removeMember, deleteProject } from '../api/projects';
import { getProjectCards, createCard, updateCard, updateCardStatus, deleteCard } from '../api/cards';
import { checkAuth } from '../api/auth';
import {Card, CardStatus, UserSummary} from "../types";
import { useWebSocket } from '../hooks/useWebSocket';
import InviteModal from '../components/InviteModal';

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
    const queryClient = useQueryClient();

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');

    const [cardTitle, setCardTitle] = useState('');
    const [cardDescription, setCardDescription] = useState('');
    const [cardLink, setCardLink] = useState('');
    const [cardAssignees, setCardAssignees] = useState<string[]>([]);

    const [draggedCard, setDraggedCard] = useState<Card | null>(null);

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: checkAuth,
    });

    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => getProject(projectId!),
        enabled: !!projectId,
    });

    const { data: cards = [] } = useQuery({
        queryKey: ['cards', projectId],
        queryFn: () => getProjectCards(projectId!),
        enabled: !!projectId,
    });

    // WebSocket callbacks
    const handleCardCreated = useCallback((card: Card) => {
        queryClient.setQueryData(['cards', projectId], (oldCards: Card[] = []) => {
            // check if card already exists to avoid duplicates
            if (oldCards.some(c => c.id === card.id)) {
                return oldCards;
            }
            return [...oldCards, card];
        });
    }, [projectId, queryClient]);

    const handleCardUpdated = useCallback((card: Card) => {
        queryClient.setQueryData(['cards', projectId], (oldCards: Card[] = []) => {
            return oldCards.map(c => c.id === card.id ? card : c);
        });
    }, [projectId, queryClient]);

    const handleCardDeleted = useCallback((data: { cardId: string }) => {
        queryClient.setQueryData(['cards', projectId], (oldCards: Card[] = []) => {
            return oldCards.filter(c => c.id !== data.cardId);
        });
    }, [projectId, queryClient]);

    const handleCardMoved = useCallback((card: Card) => {
        queryClient.setQueryData(['cards', projectId], (oldCards: Card[] = []) => {
            return oldCards.map(c => c.id === card.id ? card : c);
        });
    }, [projectId, queryClient]);

    // Connect to WebSocket
    useWebSocket(projectId, {
        onCardCreated: handleCardCreated,
        onCardUpdated: handleCardUpdated,
        onCardDeleted: handleCardDeleted,
        onCardMoved: handleCardMoved,
    });

    const inviteMutation = useMutation({
        mutationFn: () => addMember(projectId!, inviteEmail),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['myProjects'] });
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteError('');
        },
        onError: (error: Error) => {
            setInviteError(error.message);
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: string) => removeMember(projectId!, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['myProjects'] });
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: () => deleteProject(projectId!),
        onSuccess: () => {
            navigate('/dashboard');
        },
    });

    const createCardMutation = useMutation({
        mutationFn: () => createCard(projectId!, cardTitle, cardDescription, cardLink, cardAssignees),
        onSuccess: () => {
            // No need to manually invalidate - WebSocket will handle it
            resetCardForm();
        },
    });

    const updateCardMutation = useMutation({
        mutationFn: () => updateCard(editingCard!.id, cardTitle, cardDescription, cardLink, cardAssignees),
        onSuccess: () => {
            // No need to manually invalidate - WebSocket will handle it
            resetCardForm();
        },
    });

    const updateCardStatusMutation = useMutation({
        mutationFn: ({ id, status, position }: { id: string; status: CardStatus; position: number }) =>
            updateCardStatus(id, status, position),
        onSuccess: () => {
            // No need to manually invalidate - WebSocket will handle it
        },
    });

    const deleteCardMutation = useMutation({
        mutationFn: (cardId: string) => deleteCard(cardId),
        onSuccess: () => {
            // No need to manually invalidate - WebSocket will handle it
        },
    });

    const resetCardForm = () => {
        setShowCardModal(false);
        setEditingCard(null);
        setCardTitle('');
        setCardDescription('');
        setCardLink('');
        setCardAssignees([]);
    };

    const openCreateModal = () => {
        resetCardForm();
        setShowCardModal(true);
    };

    const openEditModal = (card: Card) => {
        setEditingCard(card);
        setCardTitle(card.title);
        setCardDescription(card.description || '');
        setCardLink(card.link || '');
        setCardAssignees(card.assignees.map(a => a.id));
        setShowCardModal(true);
    };

    const handleCardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCard) {
            updateCardMutation.mutate();
        } else {
            createCardMutation.mutate();
        }
    };

    const handleDeleteCard = (cardId: string) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            deleteCardMutation.mutate(cardId);
        }
    };

    const handleInviteMember = (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError('');
        inviteMutation.mutate();
    };

    const handleRemoveMember = (userId: string) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            removeMemberMutation.mutate(userId);
        }
    };

    const handleDeleteProject = () => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            deleteProjectMutation.mutate();
        }
    };

    const handleDragStart = (card: Card) => {
        setDraggedCard(card);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (status: CardStatus, position: number) => {
        if (draggedCard) {
            updateCardStatusMutation.mutate({
                id: draggedCard.id,
                status,
                position,
            });
            setDraggedCard(null);
        }
    };

    const getCardsByStatus = (status: CardStatus) => {
        return cards
            .filter(card => card.status === status)
            .sort((a, b) => a.position - b.position);
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

            {showCardModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingCard ? 'Edit Card' : 'Create New Card'}
                        </h3>
                        <form onSubmit={handleCardSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={cardTitle}
                                    onChange={(e) => setCardTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={cardDescription}
                                    onChange={(e) => setCardDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Link</label>
                                <input
                                    type="url"
                                    value={cardLink}
                                    onChange={(e) => setCardLink(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Assign Members</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                                    {project.members.map((member) => (
                                        <label key={member.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={cardAssignees.includes(member.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setCardAssignees([...cardAssignees, member.id]);
                                                    } else {
                                                        setCardAssignees(cardAssignees.filter(id => id !== member.id));
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{member.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={createCardMutation.isPending || updateCardMutation.isPending}
                                    className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    {editingCard ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetCardForm}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showInviteModal && (
                <InviteModal
                    isOpen={showInviteModal}
                    email={inviteEmail}
                    error={inviteError}
                    isSubmitting={inviteMutation.isPending}
                    onEmailChange={setInviteEmail}
                    onSubmit={handleInviteMember}
                    onClose={() => {
                        setShowInviteModal(false);
                        setInviteEmail('');
                        setInviteError('');
                    }}
                />
            )}
        </div>
    );
}