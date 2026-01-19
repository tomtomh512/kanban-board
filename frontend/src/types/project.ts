import { UserSummary } from './user';

export interface Project {
    id: string;
    name: string;
    description: string;
    owner: UserSummary;
    members: UserSummary[];
    createdAt: string;
}
