import { Prisma } from '../generated/prisma/client';

export type CardWithAssignees = Prisma.CardGetPayload<{
  include: { assignees: true };
}>;
