import { Card, CardStatus } from '../types/types';

const API_URL = import.meta.env.VITE_API_URL;

export async function createCard(
    projectId: string,
    title: string,
    description?: string,
    link?: string,
    assigneeIds?: string[]
): Promise<Card> {
    const response = await fetch(`${API_URL}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectId, title, description, link, assigneeIds }),
    });

    if (!response.ok) {
        throw new Error('Failed to create card');
    }

    return response.json();
}

export async function getProjectCards(projectId: string): Promise<Card[]> {
    const response = await fetch(`${API_URL}/cards/project/${projectId}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch cards');
    }

    return response.json();
}

export async function updateCard(
    id: string,
    title: string,
    description?: string,
    link?: string,
    assigneeIds?: string[]
): Promise<Card> {
    const response = await fetch(`${API_URL}/cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, description, link, assigneeIds }),
    });

    if (!response.ok) {
        throw new Error('Failed to update card');
    }

    return response.json();
}

export async function updateCardStatus(
    id: string,
    status: CardStatus,
    position: number
): Promise<Card> {
    const response = await fetch(`${API_URL}/cards/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, position }),
    });

    if (!response.ok) {
        throw new Error('Failed to update card status');
    }

    return response.json();
}

export async function deleteCard(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/cards/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to delete card');
    }
}