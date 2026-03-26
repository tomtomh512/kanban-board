import { Prisma } from '../generated/prisma/client';

export type ProjectWithMembers = Prisma.ProjectGetPayload<{
  include: { members: true };
}>;

export interface CreateProjectBody {
  name: string;
  description?: string;
}

export interface UpdateProjectBody {
  name?: string;
  description?: string;
}

export interface AddMemberBody {
  email: string;
}

export interface MessageResponse {
  message: string;
}
