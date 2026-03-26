import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { Request } from 'express';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../users/users.types';
import {
  AddMemberBody,
  CreateProjectBody,
  MessageResponse,
  ProjectWithMembers,
  UpdateProjectBody,
} from './projects.types';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  async create(
    @Body() body: CreateProjectBody,
    @Req() req: Request,
  ): Promise<ProjectWithMembers> {
    const user = req.user as AuthenticatedUser;
    return this.projectsService.create(body.name, body.description, user.id);
  }

  @Get('my-projects')
  getMyProjects(@Req() req: Request): Promise<ProjectWithMembers[]> {
    const user = req.user as AuthenticatedUser;
    return this.projectsService.findMyProjects(user.id);
  }

  @Get('invited-projects')
  getInvitedProjects(@Req() req: Request): Promise<ProjectWithMembers[]> {
    const user = req.user as AuthenticatedUser;
    return this.projectsService.findInvitedProjects(user.id);
  }

  @Get(':id')
  async getProject(
    @Param('id') projectId: string,
    @Req() req: Request,
  ): Promise<ProjectWithMembers> {
    const user = req.user as AuthenticatedUser;
    return this.projectsService.findProject(projectId, user.id);
  }

  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() body: UpdateProjectBody,
    @Req() req: Request,
  ): Promise<ProjectWithMembers> {
    const user = req.user as AuthenticatedUser;
    return this.projectsService.update(
      id,
      user.id,
      body.name,
      body.description,
    );
  }

  @Post(':id/members')
  async addMember(
    @Param('id') projectId: string,
    @Body() body: AddMemberBody,
    @Req() req: Request,
  ): Promise<MessageResponse> {
    const user = req.user as AuthenticatedUser;
    await this.projectsService.addMemberByEmail(projectId, body.email, user.id);
    return { message: 'Member added successfully' };
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
    @Req() req: Request,
  ): Promise<MessageResponse> {
    const requester = req.user as AuthenticatedUser;
    await this.projectsService.removeMember(projectId, userId, requester.id);
    return { message: 'Member removed successfully' };
  }

  @Delete(':id')
  async deleteProject(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<MessageResponse> {
    const user = req.user as AuthenticatedUser;
    await this.projectsService.delete(id, user.id);
    return { message: 'Project deleted successfully' };
  }
}
