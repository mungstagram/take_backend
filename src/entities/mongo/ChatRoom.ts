import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({ name: 'chatRooms' })
export class ChatRooms {
  @ObjectIdColumn()
  id: string;

  @Column({ type: 'array' })
  users: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
