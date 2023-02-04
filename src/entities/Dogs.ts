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
import { Users } from './Users';

@Entity({ name: 'dogs' })
export class Dogs {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 10 })
  name: string;

  @Column({ type: 'datetime' })
  birthday: Date;

  @Column({ type: 'boolean' })
  gender: boolean;

  @Column({ type: 'text' })
  photos: string;

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

  // *  Dogs | M : 1 | Users
  @ManyToOne(() => Users, (users) => users.Dogs, {})
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
  User: Users;
}
