import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Dogs } from './Dogs';
import { PostFiles } from './PostFiles';
import { Posts } from './Posts';
import { Users } from './Users';

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

  // * Files | 1 : 1 | Dogs
  @OneToMany(() => Dogs, (dogs) => dogs.File)
  Dog: Dogs;

  // * Files | 1 : 1 | Dogs
  @OneToMany(() => Users, (users) => users.File)
  User: Users;
}
