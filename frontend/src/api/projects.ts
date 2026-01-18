import {Project} from "../types/types.ts";

const API_URL = import.meta.env.VITE_API_URL;

export async function createProject(name: string, description?: string): Promise<Project> {
    const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
        throw new Error('Failed to create project');
    }

    return response.json();
}

export async function getMyProjects(): Promise<Project[]> {
    const response = await fetch(`${API_URL}/projects/my-projects`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch projects');
    }

    return response.json();
}

export async function getInvitedProjects(): Promise<Project[]> {
    const response = await fetch(`${API_URL}/projects/invited-projects`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch invited projects');
    }

    return response.json();
}

export async function getProject(id: string): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch project');
    }

    return response.json();
}

export async function addMember(projectId: string, email: string): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add member');
    }

    return response.json();
}

export async function removeMember(projectId: string, userId: string): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to remove member');
    }

    return response.json();
}

export async function deleteProject(projectId: string): Promise<void> {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to delete project');
    }
}