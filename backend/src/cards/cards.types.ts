import { CardStatus, Prisma } from '../generated/prisma/client';

export type CardWithAssignees = Prisma.CardGetPayload<{
  include: { assignees: true };
}>;

export type CardWithProject = Prisma.CardGetPayload<{
  include: {
    assignees: true;
    project: { include: { owner: true; members: true } };
  };
}>;

export interface CreateCardBody {
  projectId: string;
  title: string;
  description?: string;
  link?: string;
  assigneeIds?: string[];
}

export interface UpdateCardBody {
  title: string;
  description?: string;
  link?: string;
  assigneeIds?: string[];
}

export interface UpdateCardStatusBody {
  status: CardStatus;
  position: number;
}

export interface MessageResponse {
  message: string;
}
