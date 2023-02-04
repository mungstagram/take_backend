import { CommentLikes } from './src/entities/CommentsLikes';
import { Comments } from './src/entities/Comments';
import { Dogs } from './src/entities/Dogs';
import { PostLikes } from './src/entities/PostLikes';
import { Tokens } from './src/entities/Tokens';
import { Posts } from './src/entities/Posts';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Users } from './src/entities/Users';

dotenv.config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Users, Posts, Tokens, PostLikes, Dogs, Comments, CommentLikes],
  migrations: [__dirname + '/src/migrations/*.ts'],
  charset: 'utf8mb4',
  synchronize: false,
  logging: true,
});

export default dataSource;
