import { CardStatus } from './enums';
import { UserSummary } from './user';

export interface Card {
    id: string;
    title: string;
    description: string;
    link: string;
    status: CardStatus;
    position: number;
    assignees: UserSummary[];
    createdAt: string;
    updatedAt: string;
}
