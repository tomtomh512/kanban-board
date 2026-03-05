import { Prisma } from '../generated/prisma/client';

export type ProjectWithMembers = Prisma.ProjectGetPayload<{
  include: { members: true };
}>;
