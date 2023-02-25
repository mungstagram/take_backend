import { DogsModule } from './dogs/dogs.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { TodosModule } from './todos/todos.module';
import { EventsModule } from './events/events.module';
import { DmsModule } from './dms/dms.module';
import { ProfileModule } from './profile/profile.module';
import { SearchesModule } from './searches/searches.module';
import { Users } from './entities/Users';
import { Todos } from './entities/Todos';
import { Tokens } from './entities/Tokens';
import { Posts } from './entities/Posts';
import { PostLikes } from './entities/PostLikes';
import { PostFiles } from './entities/PostFiles';
import { Files } from './entities/Files';
import { Comments } from './entities/Comments';
import { Dogs } from './entities/Dogs';
import { Chattings } from './entities/mongo/Chattings';
import { ChatRooms } from './entities/mongo/ChatRoom';

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
      Todos,
      Tokens,
      Posts,
      PostLikes,
      PostFiles,
      Files,
      Comments,
      Dogs,
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
  ): Promise<TypeOrmModuleOptions> => ({
    type: 'mongodb',
    port: 27017,
    url: configService.get('MONGO_DB_URI'),
    synchronize: false,
    useNewUrlParser: true,
    entities: [Chattings, ChatRooms],
    database: 'chattings',
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ ...postgresOptions, name: 'postgresql' }),
    TypeOrmModule.forRootAsync({ ...mongodbOptions, name: 'mongodb' }),
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
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
