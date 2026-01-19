export interface User {
    id: string;
    email: string;
    name: string;
}

/**
 * Lightweight user representation
 * used in relations (owner, members, assignees)
 */
export type UserSummary = User;