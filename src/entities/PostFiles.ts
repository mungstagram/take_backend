import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Files } from './Files';
import { Posts } from './Posts';

@Entity({ name: 'postFiles' })
export class PostFiles {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', nullable: true })
  PostId: number;

  @Column({ type: 'int' })
  FileId: number;

  @ManyToOne(() => Posts, (posts) => posts.PostFiles, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'PostId', referencedColumnName: 'id' }])
  Post: Posts;

  @ManyToOne(() => Files, (files) => files.PostFiles, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'FileId', referencedColumnName: 'id' }])
  File: Files;
}
