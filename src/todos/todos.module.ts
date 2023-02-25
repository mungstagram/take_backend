import { Todos } from '../entities/Todos';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import postgresDataSource from 'dataSource';

@Module({
  imports: [TypeOrmModule.forFeature([Todos], postgresDataSource)],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
