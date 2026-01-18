import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { CardsGateway } from './cards.gateway';
import { Card } from './card.entity';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Card]),
        ProjectsModule,
        UsersModule,
    ],
    providers: [CardsService, CardsGateway],
    controllers: [CardsController],
    exports: [CardsService],
})
export class CardsModule {}