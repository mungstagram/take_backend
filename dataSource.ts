import { CommentLikes } from './src/entities/CommentsLikes';
import { Comments } from './src/entities/Comments';
import { Dogs } from './src/entities/Dogs';
import { PostLikes } from './src/entities/PostLikes';
import { Tokens } from './src/entities/Tokens';
import { Posts } from './src/entities/Posts';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Users } from './src/entities/Users';

dotenv.config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_DB_HOST,
  port: 3306,
  username: process.env.MYSQL_DB_USERNAME,
  password: process.env.MYSQL_DB_PASSWORD,
  database: process.env.MYSQL_DB_NAME + '_' + process.env.NODE_ENV,
  entities: [Users, Posts, Tokens, PostLikes, Dogs, Comments, CommentLikes],
  migrations: [__dirname + '/src/migrations/*.ts'],
  charset: 'utf8mb4_0900_ai_ci',
  synchronize: false,
  logging: process.env.NODE_ENV === 'dev' ? true : false,
});

export default dataSource;
