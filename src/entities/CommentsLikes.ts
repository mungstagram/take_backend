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
import { Comments } from './Comments';
import { Users } from './Users';

@Entity({ name: 'commentLikes' })
export class CommentLikes {
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
  CommentId: number;
  // * Relation * /

  // *  PostLikes | M : 1 | Users
  @ManyToOne(() => Users, (users) => users.PostLikes, {})
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
  User: Users;

  // *  PostLikes | M : 1 | Posts
  @ManyToOne(() => Comments, (comments) => comments.CommentLikes, {})
  @JoinColumn([{ name: 'CommentId', referencedColumnName: 'id' }])
  Comment: Comments;
}
