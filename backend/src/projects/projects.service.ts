import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(name: string, description: string | undefined, ownerId: string) {
    const owner = await this.usersService.findById(ownerId);

    if (!owner) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.project.create({
      data: {
        name,
        description,
        owner: { connect: { id: ownerId } },
        members: { connect: { id: ownerId } },
      },
      include: { owner: true, members: true },
    });
  }

  async update(
    projectId: string,
    requesterId: string,
    name?: string,
    description?: string,
  ) {
    const project = await this.findOne(projectId);

    if (project.ownerId !== requesterId) {
      throw new ForbiddenException(
        'Only the project owner can edit this project',
      );
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
      include: { owner: true, members: true },
    });
  }

  async findMyProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { owner: true, members: true },
    });
  }

  async findInvitedProjects(userId: string) {
    return this.prisma.project.findMany({
      where: {
        members: { some: { id: userId } },
        NOT: { ownerId: userId },
      },
      include: {
        owner: true,
        members: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { owner: true, members: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async findProject(projectId: string, userId: string) {
    const project = await this.findOne(projectId);

    const isMember = project.members.some((member) => member.id === userId);

    if (!isMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async addMemberByEmail(
    projectId: string,
    email: string,
    requesterId: string,
  ) {
    const project = await this.findOne(projectId);

    if (project.ownerId !== requesterId) {
      throw new ForbiddenException('Only the project owner can add members');
    }

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const isAlreadyMember = project.members.some(
      (member) => member.id === user.id,
    );

    if (isAlreadyMember) {
      throw new ForbiddenException('User is already a member of this project');
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: { connect: { id: user.id } },
      },
    });
  }

  async removeMember(projectId: string, userId: string, requesterId: string) {
    const project = await this.findOne(projectId);

    if (project.ownerId !== requesterId) {
      throw new ForbiddenException('Only the project owner can remove members');
    }

    if (userId === project.ownerId) {
      throw new ForbiddenException('Cannot remove the project owner');
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: { disconnect: { id: userId } },
      },
    });
  }

  async delete(projectId: string, requesterId: string): Promise<void> {
    const project = await this.findOne(projectId);

    if (project.ownerId !== requesterId) {
      throw new ForbiddenException(
        'Only the project owner can delete the project',
      );
    }

    await this.prisma.project.delete({ where: { id: projectId } });
  }
}
