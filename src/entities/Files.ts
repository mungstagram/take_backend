import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { PostFiles } from './PostFiles';
import { Posts } from './Posts';

@Entity({ name: 'files' })
export class Files {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  contentUrl: string;

  @Column({ type: 'text' })
  hash: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  // *  Files | 1 : M | PostFiles
  @OneToMany(() => PostFiles, (postFiles) => postFiles.File)
  PostFiles: PostFiles[];
}
