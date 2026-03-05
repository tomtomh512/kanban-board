import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CardsGateway } from './cards.gateway';
import { CardStatus } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';

type ProjectWithMembers = Prisma.ProjectGetPayload<{
  include: { members: true };
}>;

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private cardsGateway: CardsGateway,
  ) {}

  async create(
    projectId: string,
    title: string,
    description: string | undefined,
    link: string | undefined,
    assigneeIds: string[],
    userId: string,
  ) {
    const project = await this.projectsService.findOne(projectId);
    this.verifyProjectAccess(project, userId);

    const maxPosition = await this.prisma.card.aggregate({
      where: { projectId, status: CardStatus.backlog },
      _max: { position: true },
    });

    const card = await this.prisma.card.create({
      data: {
        title,
        description,
        link,
        status: CardStatus.backlog,
        position: (maxPosition._max.position ?? -1) + 1,
        project: { connect: { id: projectId } },
        assignees: {
          connect: assigneeIds.map((id) => ({ id })),
        },
      },
      include: { assignees: true },
    });

    this.cardsGateway.cardCreated(projectId, card);
    return card;
  }

  async findAllByProject(projectId: string, userId: string) {
    const project = await this.projectsService.findOne(projectId);
    this.verifyProjectAccess(project, userId);

    return this.prisma.card.findMany({
      where: { projectId },
      include: { assignees: true },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: { project: { include: { members: true } }, assignees: true },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    this.verifyProjectAccess(card.project, userId);
    return card;
  }

  async update(
    id: string,
    title: string,
    description: string | undefined,
    link: string | undefined,
    assigneeIds: string[],
    userId: string,
  ) {
    const card = await this.findOne(id, userId);

    const updatedCard = await this.prisma.card.update({
      where: { id },
      data: {
        title,
        description,
        link,
        assignees: {
          set: assigneeIds.map((id) => ({ id })), // set replaces all assignees
        },
      },
      include: { assignees: true },
    });

    this.cardsGateway.cardUpdated(card.project.id, updatedCard);
    return updatedCard;
  }

  async updateStatus(
    id: string,
    status: CardStatus,
    position: number,
    userId: string,
  ) {
    const card = await this.findOne(id, userId);
    const oldStatus = card.status;
    const projectId = card.project.id;

    if (oldStatus !== status) {
      // Close the gap in the old column
      await this.prisma.card.updateMany({
        where: {
          projectId,
          status: oldStatus,
          position: { gt: card.position },
        },
        data: { position: { decrement: 1 } },
      });

      // Make room in the new column
      await this.prisma.card.updateMany({
        where: { projectId, status, position: { gte: position } },
        data: { position: { increment: 1 } },
      });
    } else {
      if (position < card.position) {
        await this.prisma.card.updateMany({
          where: {
            projectId,
            status,
            position: { gte: position, lt: card.position },
          },
          data: { position: { increment: 1 } },
        });
      } else if (position > card.position) {
        await this.prisma.card.updateMany({
          where: {
            projectId,
            status,
            position: { gt: card.position, lte: position },
          },
          data: { position: { decrement: 1 } },
        });
      }
    }

    const updatedCard = await this.prisma.card.update({
      where: { id },
      data: { status, position },
      include: { assignees: true },
    });

    this.cardsGateway.cardMoved(projectId, updatedCard);
    return updatedCard;
  }

  async delete(id: string, userId: string): Promise<void> {
    const card = await this.findOne(id, userId);
    const projectId = card.project.id;

    await this.prisma.card.updateMany({
      where: {
        projectId,
        status: card.status,
        position: { gt: card.position },
      },
      data: { position: { decrement: 1 } },
    });

    await this.prisma.card.delete({ where: { id } });

    this.cardsGateway.cardDeleted(projectId, id);
  }

  private verifyProjectAccess(
    project: ProjectWithMembers,
    userId: string,
  ): void {
    const isMember = project.members.some((member) => member.id === userId);
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this project');
    }
  }
}
