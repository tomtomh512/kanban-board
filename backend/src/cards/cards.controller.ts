import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../types/types';
import { CardStatus } from './card.entity';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
    constructor(private cardsService: CardsService) {}

    @Post()
    async create(
        @Body() body: {
            projectId: string;
            title: string;
            description?: string;
            link?: string;
            assigneeIds?: string[];
        },
        @Req() req: Request,
    ) {
        const user = req.user as AuthenticatedUser;
        return this.cardsService.create(
            body.projectId,
            body.title,
            body.description,
            body.link,
            body.assigneeIds || [],
            user.id
        );
    }

    @Get('project/:projectId')
    async getProjectCards(
        @Param('projectId') projectId: string,
        @Req() req: Request,
    ) {
        const user = req.user as AuthenticatedUser;
        return this.cardsService.findAllByProject(projectId, user.id);
    }

    @Get(':id')
    async getCard(
        @Param('id') id: string,
        @Req() req: Request,
    ) {
        const user = req.user as AuthenticatedUser;
        return this.cardsService.findOne(id, user.id);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: {
            title: string;
            description?: string;
            link?: string;
            assigneeIds?: string[];
        },
        @Req() req: Request,
    ) {
        const user = req.user as AuthenticatedUser;
        return this.cardsService.update(
            id,
            body.title,
            body.description,
            body.link,
            body.assigneeIds || [],
            user.id
        );
    }

    @Put(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() body: {
            status: CardStatus;
            position: number;
        },
        @Req() req: Request,
    ) {
        const user = req.user as AuthenticatedUser;
        return this.cardsService.updateStatus(id, body.status, body.position, user.id);
    }

    @Delete(':id')
    async delete(
        @Param('id') id: string,
        @Req() req: Request,
    ) {
        const user = req.user as AuthenticatedUser;
        await this.cardsService.delete(id, user.id);
        return { message: 'Card deleted successfully' };
    }
}