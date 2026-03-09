import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { checkAuth } from '../api/auth';
import { getProject } from '../api/projects';
import { getProjectCards } from '../api/cards';
import { useWebSocket } from './useWebSocket';
import { Card } from '../types';
import {useNavigate} from "react-router-dom";

export function useProjectBoard(projectId: string | undefined) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: checkAuth,
    });

    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => getProject(projectId!),
        enabled: !!projectId,
        retry: false,
        throwOnError: () => {
            navigate('/dashboard');
            return false;
        },
    });

    const { data: cards = [] } = useQuery({
        queryKey: ['cards', projectId],
        queryFn: () => getProjectCards(projectId!),
        enabled: !!projectId,
    });

    const handleCardCreated = useCallback((card: Card) => {
        queryClient.setQueryData(['cards', projectId], (oldCards: Card[] = []) => {
            if (oldCards.some(c => c.id === card.id)) return oldCards;
            return [...oldCards, card];
        });
    }, [projectId, queryClient]);

    const handleCardUpdated = useCallback((card: Card) => {
        queryClient.setQueryData(['cards', projectId], (oldCards: Card[] = []) =>
            oldCards.map(c => c.id === card.id ? card : c)
        );
    }, [projectId, queryClient]);

    const handleCardDeleted = useCallback((data: { cardId: string }) => {
        queryClient.setQueryData(['cards', projectId], (oldCards: Card[] = []) =>
            oldCards.filter(c => c.id !== data.cardId)
        );
    }, [projectId, queryClient]);

    const handleCardMoved = useCallback((card: Card) => {
        queryClient.setQueryData(['cards', projectId], (oldCards: Card[] = []) =>
            oldCards.map(c => c.id === card.id ? card : c)
        );
    }, [projectId, queryClient]);

    useWebSocket(projectId, {
        onCardCreated: handleCardCreated,
        onCardUpdated: handleCardUpdated,
        onCardDeleted: handleCardDeleted,
        onCardMoved: handleCardMoved,
    });

    return { user, project, cards, isLoading };
}