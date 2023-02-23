import { Files } from './entities/Files';
import { DogsModule } from './dogs/dogs.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { Comments } from './entities/Comments';
import { CommentLikes } from './entities/CommentsLikes';
import { Dogs } from './entities/Dogs';
import { PostLikes } from './entities/PostLikes';
import { Posts } from './entities/Posts';
import { Tokens } from './entities/Tokens';
import { Users } from './entities/Users';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { TodosModule } from './todos/todos.module';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { EventsModule } from './events/events.module';
import { DmsModule } from './dms/dms.module';
import mongoose from 'mongoose';
import { ProfileModule } from './profile/profile.module';
import { SearchesModule } from './searches/searches.module';

const postgresOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    type: 'postgres',
    host: configService.get('POSTGRES_DB_HOST'),
    port: 5432,
    username: configService.get('POSTGRES_DB_USERNAME'),
    password: configService.get('POSTGRES_DB_PASSWORD'),
    database:
      configService.get('POSTGRES_DB_NAME') +
      '_' +
      configService.get('NODE_ENV'),
    entities: [
      Users,
      Posts,
      Tokens,
      PostLikes,
      Dogs,
      Comments,
      CommentLikes,
      Files,
    ],
    migrations: ['src/migrations/**/*.ts'],
    synchronize: false,
    autoLoadEntities: true,
    keepConnectionAlive: true,
    logging: configService.get('NODE_ENV') === 'dev' ? true : false,
  }),
  inject: [ConfigService],
};

const mongodbOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<MongooseModuleOptions> => ({
    uri: configService.get('MONGO_DB_URI'),
    dbName: 'chattings',
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(postgresOptions),
    MongooseModule.forRootAsync(mongodbOptions),
    UsersModule,
    PostsModule,
    AuthModule,
    CommentsModule,
    DogsModule,
    TodosModule,
    EventsModule,
    DmsModule,
    ProfileModule,
    SearchesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const DEBUG = process.env.NODE_ENV === 'dev' ? true : false;
    consumer.apply(LoggerMiddleware).forRoutes('*');
    mongoose.set('debug', DEBUG);
  }
}
