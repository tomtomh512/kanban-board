import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => User, { eager: true })
    owner: User;

    @ManyToMany(() => User, { eager: true })
    @JoinTable({
        name: 'project_members',
        joinColumn: { name: 'project_id' },
        inverseJoinColumn: { name: 'user_id' }
    })
    members: User[];

    @CreateDateColumn()
    createdAt: Date;
}