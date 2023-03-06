import { PostLikes } from './PostLikes';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comments } from './Comments';
import { Users } from './Users';
import { Files } from './Files';
import { PostFiles } from './PostFiles';

@Entity({ name: 'posts' })
export class Posts {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text' })
  category: string;

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
  @ManyToOne(() => Users, (users) => users.Posts, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
  User: Users;

  // *  Posts | 1 : M | Comments
  @OneToMany(() => Comments, (comments) => comments.Post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  Comments: Comments[];

  // *  Posts | 1 : M | PostLikes
  @OneToMany(() => PostLikes, (postLikes) => postLikes.Post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  PostLikes: PostLikes[];

  // *  Posts | 1 : M | PostFiles
  @OneToMany(() => PostFiles, (postFiles) => postFiles.Post, { cascade: true })
  PostFiles: PostFiles[];
}
