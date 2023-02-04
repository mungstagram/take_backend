import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Comments } from './entities/Comments';
import { CommentLikes } from './entities/CommentsLikes';
import { Dogs } from './entities/Dogs';
import { PostLikes } from './entities/PostLikes';
import { Posts } from './entities/Posts';
import { Tokens } from './entities/Tokens';
import { Users } from './entities/Users';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    type: 'mysql',
    host: configService.get('MYSQL_DB_HOST'),
    port: 3306,
    username: configService.get('MYSQL_DB_USERNAME'),
    password: configService.get('MYSQL_DB_PASSWORD'),
    database:
      configService.get('MYSQL_DB_NAME') + '_' + configService.get('NODE_ENV'),
    entities: [Users, Posts, Tokens, PostLikes, Dogs, Comments, CommentLikes],
    migrations: [__dirname + '/src/migrations/*.ts'],
    charset: 'utf8mb4_0900_ai_ci',
    synchronize: false,
    autoLoadEntities: true,
    keepConnectionAlive: true,
    logging: configService.get('NODE_ENV') === 'dev' ? true : false,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
