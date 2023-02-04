import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_DB_HOST,
  port: 3306,
  username: process.env.MYSQL_DB_USERNAME,
  password: process.env.MYSQL_DB_PASSWORD,
  database: process.env.MYSQL_DB_NAME + '_' + process.env.NODE_ENV,
  entities: [__dirname + '/src/entities/*.ts'],
  migrations: [__dirname + '/src/migrations/*.ts'],
  charset: 'utf8mb4_unicode_ci',
  synchronize: false,
  logging: process.env.NODE_ENV === 'dev' ? true : false,
});

export default dataSource;
