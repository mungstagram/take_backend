import { ExceptionFilter } from '@nestjs/common';
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

  @Column({ type: 'text' })
  roomId: string;

  @Column({ type: 'array' })
  users: any;

  @Column({ type: 'array' })
  exitedAt: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
