import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const postgresDataSource = new DataSource({
  name: 'postgresql',
  type: 'postgres',
  host: process.env.POSTGRES_DB_HOST,
  port: 5432,
  username: process.env.POSTGRES_DB_USERNAME,
  password: process.env.POSTGRES_DB_PASSWORD,
  database: process.env.POSTGRES_DB_NAME + '_' + process.env.NODE_ENV,
  entities: [__dirname + '/src/entities/*.ts'],
  migrations: [__dirname + '/src/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'dev' ? true : false,
});

export default postgresDataSource;
