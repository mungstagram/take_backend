import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './Users';

@Entity({ name: 'todos' })
export class Todos {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean' })
  done: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  // * Foreign Key * /

  @Column({ type: 'int' })
  UserId: number;

  // * Relation * /

  // *  PostLikes | M : 1 | Users
  @ManyToOne(() => Users, (users) => users.Todos)
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
  User: Users;
}
