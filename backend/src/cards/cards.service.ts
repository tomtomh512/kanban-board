import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, CardStatus } from './card.entity';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';
import { CardsGateway } from './cards.gateway';

@Injectable()
export class CardsService {
    constructor(
        @InjectRepository(Card)
        private cardsRepository: Repository<Card>,
        private projectsService: ProjectsService,
        private usersService: UsersService,
        private cardsGateway: CardsGateway,
    ) {}

    async create(
        projectId: string,
        title: string,
        description: string,
        link: string,
        assigneeIds: string[],
        userId: string
    ): Promise<Card> {
        const project = await this.projectsService.findOne(projectId);
        await this.verifyProjectAccess(project, userId);

        const assignees = [];
        if (assigneeIds && assigneeIds.length > 0) {
            for (const assigneeId of assigneeIds) {
                const user = await this.usersService.findById(assigneeId);
                if (user) {
                    assignees.push(user);
                }
            }
        }

        const maxPosition = await this.cardsRepository
            .createQueryBuilder('card')
            .where('card.projectId = :projectId', { projectId })
            .andWhere('card.status = :status', { status: CardStatus.BACKLOG })
            .select('MAX(card.position)', 'max')
            .getRawOne();

        const card = this.cardsRepository.create({
            title,
            description,
            link,
            project,
            assignees,
            status: CardStatus.BACKLOG,
            position: (maxPosition?.max ?? -1) + 1,     // if empty max = null
        });

        const savedCard = await this.cardsRepository.save(card);

        // Emit WebSocket event
        this.cardsGateway.cardCreated(projectId, savedCard);

        return savedCard;
    }

    async findAllByProject(projectId: string, userId: string): Promise<Card[]> {
        const project = await this.projectsService.findOne(projectId);
        await this.verifyProjectAccess(project, userId);

        return this.cardsRepository.find({
            where: { project: { id: projectId } },
            order: { position: 'ASC' },
        });
    }

    async findOne(id: string, userId: string): Promise<Card> {
        const card = await this.cardsRepository.findOne({
            where: { id },
            relations: ['project'],
        });

        if (!card) {
            throw new NotFoundException('Card not found');
        }

        await this.verifyProjectAccess(card.project, userId);
        return card;
    }

    async update(
        id: string,
        title: string,
        description: string,
        link: string,
        assigneeIds: string[],
        userId: string
    ): Promise<Card> {
        const card = await this.findOne(id, userId);

        const assignees = [];
        if (assigneeIds && assigneeIds.length > 0) {
            for (const assigneeId of assigneeIds) {
                const user = await this.usersService.findById(assigneeId);
                if (user) {
                    assignees.push(user);
                }
            }
        }

        card.title = title;
        card.description = description;
        card.link = link;
        card.assignees = assignees;

        const updatedCard = await this.cardsRepository.save(card);

        // Emit WebSocket event
        this.cardsGateway.cardUpdated(card.project.id, updatedCard);

        return updatedCard;
    }

    async updateStatus(
        id: string,
        status: CardStatus,
        position: number,
        userId: string
    ): Promise<Card> {
        const card = await this.findOne(id, userId);
        const oldStatus = card.status;

        if (oldStatus !== status) {
            await this.cardsRepository
                .createQueryBuilder()
                .update(Card)
                .set({ position: () => 'position - 1' })
                .where('projectId = :projectId', { projectId: card.project.id })
                .andWhere('status = :status', { status: oldStatus })
                .andWhere('position > :position', { position: card.position })
                .execute();

            await this.cardsRepository
                .createQueryBuilder()
                .update(Card)
                .set({ position: () => 'position + 1' })
                .where('projectId = :projectId', { projectId: card.project.id })
                .andWhere('status = :status', { status })
                .andWhere('position >= :position', { position })
                .execute();
        } else {
            if (position < card.position) {
                await this.cardsRepository
                    .createQueryBuilder()
                    .update(Card)
                    .set({ position: () => 'position + 1' })
                    .where('projectId = :projectId', { projectId: card.project.id })
                    .andWhere('status = :status', { status })
                    .andWhere('position >= :newPos', { newPos: position })
                    .andWhere('position < :oldPos', { oldPos: card.position })
                    .execute();
            } else if (position > card.position) {
                await this.cardsRepository
                    .createQueryBuilder()
                    .update(Card)
                    .set({ position: () => 'position - 1' })
                    .where('projectId = :projectId', { projectId: card.project.id })
                    .andWhere('status = :status', { status })
                    .andWhere('position > :oldPos', { oldPos: card.position })
                    .andWhere('position <= :newPos', { newPos: position })
                    .execute();
            }
        }

        card.status = status;
        card.position = position;

        const updatedCard = await this.cardsRepository.save(card);

        // Emit WebSocket event
        this.cardsGateway.cardMoved(card.project.id, updatedCard);

        return updatedCard;
    }

    async delete(id: string, userId: string): Promise<void> {
        const card = await this.findOne(id, userId);
        const projectId = card.project.id;

        await this.cardsRepository
            .createQueryBuilder()
            .update(Card)
            .set({ position: () => 'position - 1' })
            .where('projectId = :projectId', { projectId: card.project.id })
            .andWhere('status = :status', { status: card.status })
            .andWhere('position > :position', { position: card.position })
            .execute();

        await this.cardsRepository.remove(card);

        // Emit WebSocket event
        this.cardsGateway.cardDeleted(projectId, id);
    }

    private async verifyProjectAccess(project: any, userId: string): Promise<void> {
        const isMember = project.members.some(member => member.id === userId);
        if (!isMember) {
            throw new ForbiddenException('You do not have access to this project');
        }
    }
}