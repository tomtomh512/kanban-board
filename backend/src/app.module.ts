import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { CardsModule } from './cards/cards.module';
import { User } from './users/user.entity';
import { Project } from './projects/project.entity';
import { Card } from './cards/card.entity';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000,
                limit: 10,       // 10 requests per second
            },
            {
                name: 'medium',
                ttl: 60000,
                limit: 100,      // 100 requests per minute
            },
            {
                name: 'long',
                ttl: 3600000,
                limit: 1000,     // 1000 requests per hour
            },
        ]),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT),
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            entities: [User, Project, Card],
            synchronize: true,
        }),
        AuthModule,
        UsersModule,
        ProjectsModule,
        CardsModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,  // applies rate limiting to all routes
        },
    ],
})
export class AppModule {}