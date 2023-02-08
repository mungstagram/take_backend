import { PostLikes } from './PostLikes';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comments } from './Comments';
import { Users } from './Users';

@Entity({ name: 'posts' })
export class Posts {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text' })
  content_url: string;

  @Column({ type: 'text' })
  hashtag: string;

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

  // *  Posts | M : 1 | Users
  @ManyToOne(() => Users, (users) => users.Posts, {})
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
  User: Users;

  // *  Posts | 1 : M | Comments
  @OneToMany(() => Comments, (comments) => comments.Post)
  Comments: Comments[];

  // *  Posts | 1 : M | PostLikes
  @OneToMany(() => PostLikes, (postLikes) => postLikes.Post)
  PostLikes: Comments[];
}
