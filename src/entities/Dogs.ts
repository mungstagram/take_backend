import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Files } from './Files';
import { Users } from './Users';

@Entity({ name: 'dogs' })
export class Dogs {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 10 })
  name: string;

  @Column({ type: 'varchar', length: 15 })
  species: string;

  @Column({ type: 'float' })
  weight: number;

  @Column({ type: 'date' })
  birthday: Date;

  @Column({ type: 'date' })
  bringDate: Date;

  @Column({ type: 'boolean' })
  representative: boolean;

  @Column({ type: 'text' })
  introduce: string;

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
  FileId: number;

  // * Relation * /

  // *  Dogs | M : 1 | Users
  @ManyToOne(() => Users, (users) => users.Dogs, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
  User: Users;

  // * Dogs | 1 : 1 | File
  @ManyToOne(() => Files, (files) => files.Dog)
  @JoinColumn([{ name: 'FileId', referencedColumnName: 'id' }])
  File: Files[];
}
