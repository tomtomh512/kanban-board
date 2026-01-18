export interface User {
    id: string;
    email: string;
    name: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    owner: {
        id: string;
        email: string;
        name: string;
    };
    members: Array<{
        id: string;
        email: string;
        name: string;
    }>;
    createdAt: string;
}

export enum CardStatus {
    BACKLOG = 'backlog',
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    TESTING = 'testing',
    FINISHED = 'finished'
}

export interface Card {
    id: string;
    title: string;
    description: string;
    link: string;
    status: CardStatus;
    position: number;
    assignees: Array<{
        id: string;
        email: string;
        name: string;
    }>;
    createdAt: string;
    updatedAt: string;
}