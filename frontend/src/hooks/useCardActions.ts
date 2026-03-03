import { useMutation } from '@tanstack/react-query';
import { createCard, updateCard, updateCardStatus, deleteCard } from '../api/cards';
import { Card, CardStatus } from '../types';

interface CardFormData {
    title: string;
    description: string;
    link: string;
    assigneeIds: string[];
}

interface UseCardActionsOptions {
    projectId: string;
    editingCard: Card | null;
    onSaveSuccess: () => void;
}

export function useCardActions({ projectId, editingCard, onSaveSuccess }: UseCardActionsOptions) {
    const createCardMutation = useMutation({
        mutationFn: ({ title, description, link, assigneeIds }: CardFormData) =>
            createCard(projectId, title, description, link, assigneeIds),
        onSuccess: onSaveSuccess,
    });

    const updateCardMutation = useMutation({
        mutationFn: ({ title, description, link, assigneeIds }: CardFormData) =>
            updateCard(editingCard!.id, title, description, link, assigneeIds),
        onSuccess: onSaveSuccess,
    });

    const updateCardStatusMutation = useMutation({
        mutationFn: ({ id, status, position }: { id: string; status: CardStatus; position: number }) =>
            updateCardStatus(id, status, position),
    });

    const deleteCardMutation = useMutation({
        mutationFn: (cardId: string) => deleteCard(cardId),
    });

    const handleCardSubmit = (data: CardFormData) => {
        if (editingCard) {
            updateCardMutation.mutate(data);
        } else {
            createCardMutation.mutate(data);
        }
    };

    const handleDeleteCard = (cardId: string) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            deleteCardMutation.mutate(cardId);
        }
    };

    const handleMoveCard = (id: string, status: CardStatus, position: number) => {
        updateCardStatusMutation.mutate({ id, status, position });
    };

    return {
        handleCardSubmit,
        handleDeleteCard,
        handleMoveCard,
        isSubmitting: createCardMutation.isPending || updateCardMutation.isPending,
    };
}