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

  @Column({ type: 'int' })
  PostId: number;

  @Column({ type: 'int' })
  FileId: number;

  @ManyToOne(() => Posts, (posts) => posts.PostFiles, {})
  @JoinColumn([{ name: 'PostId', referencedColumnName: 'id' }])
  Post: Posts;

  @ManyToOne(() => Files, (files) => files.PostFiles, {})
  @JoinColumn([{ name: 'FileId', referencedColumnName: 'id' }])
  File: Files;
}
