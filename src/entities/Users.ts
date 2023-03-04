import { Posts } from './Posts';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comments } from './Comments';
import { Dogs } from './Dogs';
import { Tokens } from './Tokens';
import { PostLikes } from './PostLikes';
import { CommentLikes } from './CommentsLikes';
import { Todos } from './Todos';
import { Files } from './Files';

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: '20', nullable: true })
  nickname: string;

  @Column({ type: 'text', nullable: true })
  introduce: string;

  @Column({ type: 'varchar', length: 6, nullable: true })
  provider: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  // * Relation * /

  // ForignKey
  @Column({ type: 'int', nullable: true })
  FileId: number;

  // * Users | 1 : 1 | Files
  @ManyToOne(() => Files, (files) => files.User)
  @JoinColumn([{ name: 'FileId', referencedColumnName: 'id' }])
  File: Files[];

  // *  Users | 1 : M | Posts
  @OneToMany(() => Posts, (posts) => posts.User)
  Posts: Posts[];

  // *  Users | 1 : M | Comments
  @OneToMany(() => Comments, (comments) => comments.User)
  Comments: Comments[];

  // *  Users | 1 : M | Dogs
  @OneToMany(() => Dogs, (dogs) => dogs.User)
  Dogs: Dogs[];

  // *  Users | 1 : M | Tokens
  @OneToMany(() => Tokens, (tokens) => tokens.User)
  Tokens: Tokens[];

  // *  Users | 1 : M | PostsLikes
  @OneToMany(() => PostLikes, (postLikes) => postLikes.User)
  PostLikes: PostLikes[];

  // *  Users | 1 : M | CommentsLikes
  @OneToMany(() => CommentLikes, (commentLikes) => commentLikes.User)
  CommentLikes: CommentLikes[];

  // *  Users | 1 : M | CommentsLikes
  @OneToMany(() => Todos, (todos) => todos.User)
  Todos: Todos[];
}
