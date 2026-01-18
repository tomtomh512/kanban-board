import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

export enum CardStatus {
    BACKLOG = 'backlog',
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    TESTING = 'testing',
    FINISHED = 'finished'
}

@Entity('cards')
export class Card {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    link: string;

    @Column({
        type: 'enum',
        enum: CardStatus,
        default: CardStatus.BACKLOG
    })
    status: CardStatus;

    @Column({ type: 'int', default: 0 })
    position: number;

    @ManyToOne(() => Project, { onDelete: 'CASCADE' })
    project: Project;

    @ManyToMany(() => User, { eager: true })
    @JoinTable({
        name: 'card_assignees',
        joinColumn: { name: 'card_id' },
        inverseJoinColumn: { name: 'user_id' }
    })
    assignees: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}