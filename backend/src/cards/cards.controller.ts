import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../users/users.types';
import {
  CardWithAssignees,
  CardWithProject,
  CreateCardBody,
  MessageResponse,
  UpdateCardBody,
  UpdateCardStatusBody,
} from './cards.types';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Post()
  async create(
    @Body() body: CreateCardBody,
    @Req() req: Request,
  ): Promise<CardWithAssignees> {
    const user = req.user as AuthenticatedUser;
    return this.cardsService.create(
      body.projectId,
      body.title,
      body.description,
      body.link,
      body.assigneeIds ?? [],
      user.id,
    );
  }

  @Get('project/:projectId')
  async getProjectCards(
    @Param('projectId') projectId: string,
    @Req() req: Request,
  ): Promise<CardWithAssignees[]> {
    const user = req.user as AuthenticatedUser;
    return this.cardsService.findAllByProject(projectId, user.id);
  }

  @Get(':id')
  async getCard(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<CardWithProject> {
    const user = req.user as AuthenticatedUser;
    return this.cardsService.findOne(id, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCardBody,
    @Req() req: Request,
  ): Promise<CardWithAssignees> {
    const user = req.user as AuthenticatedUser;
    return this.cardsService.update(
      id,
      body.title,
      body.description,
      body.link,
      body.assigneeIds ?? [],
      user.id,
    );
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateCardStatusBody,
    @Req() req: Request,
  ): Promise<CardWithAssignees> {
    const user = req.user as AuthenticatedUser;
    return this.cardsService.updateStatus(
      id,
      body.status,
      body.position,
      user.id,
    );
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<MessageResponse> {
    const user = req.user as AuthenticatedUser;
    await this.cardsService.delete(id, user.id);
    return { message: 'Card deleted successfully' };
  }
}
