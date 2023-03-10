import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Posts } from './Posts';
import { Users } from './Users';

@Entity({ name: 'postLikes' })
export class PostLikes {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  // * Foreign Key * /

  @Column({ type: 'int' })
  UserId: number;

  @Column({ type: 'int' })
  PostId: number;
  // * Relation * /

  // *  PostLikes | M : 1 | Users
  @ManyToOne(() => Users, (users) => users.PostLikes, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
  User: Users;

  // *  PostLikes | M : 1 | Posts
  @ManyToOne(() => Posts, (posts) => posts.PostLikes, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'PostId', referencedColumnName: 'id' }])
  Post: Posts;
}
