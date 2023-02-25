import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({ name: 'chattings' })
export class Chattings {
  @ObjectIdColumn()
  id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text' })
  contentUrl: string;

  @Column({ type: 'int' })
  SenderId: number;

  @Column({ type: 'int' })
  ReceiverId: number;

  @Column({ type: 'text' })
  RoomId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
