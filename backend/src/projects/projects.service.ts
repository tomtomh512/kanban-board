import {Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Not, Repository} from 'typeorm';
import { Project } from './project.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
        private usersService: UsersService,
    ) {}

    async create(name: string, description: string, ownerId: string): Promise<Project> {
        const owner = await this.usersService.findById(ownerId);
        if (!owner) {
            throw new NotFoundException('User not found');
        }

        const project = this.projectsRepository.create({
            name,
            description,
            owner,
            members: [owner],
        });

        return this.projectsRepository.save(project);
    }

    async findMyProjects(userId: string): Promise<Project[]> {
        return this.projectsRepository.find({
            where: { owner: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }

    async findInvitedProjects(userId: string): Promise<Project[]> {
        return await this.projectsRepository
            .createQueryBuilder('project')
            .leftJoin('project.members', 'member')
            .leftJoinAndSelect('project.owner', 'owner')
            .leftJoinAndSelect('project.members', 'all_members')
            .where('member.id = :userId', { userId })
            .andWhere('owner.id != :userId', { userId })
            .orderBy('project.createdAt', 'DESC')
            .getMany();
    }

    async findOne(id: string): Promise<Project> {
        const project = await this.projectsRepository.findOne({
            where: { id },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }

    async addMemberByEmail(projectId: string, email: string, requesterId: string): Promise<Project> {
        const project = await this.findOne(projectId);

        if (project.owner.id !== requesterId) {
            throw new ForbiddenException('Only the project owner can add members');
        }

        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User with this email not found');
        }

        const isAlreadyMember = project.members.some(member => member.id === user.id);
        if (isAlreadyMember) {
            throw new ForbiddenException('User is already a member of this project');
        }

        project.members.push(user);
        return this.projectsRepository.save(project);
    }

    async removeMember(projectId: string, userId: string, requesterId: string): Promise<Project> {
        const project = await this.findOne(projectId);

        if (project.owner.id !== requesterId) {
            throw new ForbiddenException('Only the project owner can remove members');
        }

        if (userId === project.owner.id) {
            throw new ForbiddenException('Cannot remove the project owner');
        }

        project.members = project.members.filter(member => member.id !== userId);
        return this.projectsRepository.save(project);
    }

    async delete(projectId: string, requesterId: string): Promise<void> {
        const project = await this.findOne(projectId);

        if (project.owner.id !== requesterId) {
            throw new ForbiddenException('Only the project owner can delete the project');
        }

        await this.projectsRepository.remove(project);
    }
}