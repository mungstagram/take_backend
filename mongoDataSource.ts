import { DataSource } from 'typeorm';

const mongoDataSource = new DataSource({
  name: 'mongodb',
  type: 'mongodb',
  port: 27017,
  url: process.env.MONGO_DB_URI,
  synchronize: false,
  useNewUrlParser: true,
  entities: [__dirname + '/src/entities/mongo/*.ts'],
  database: 'chattings',
});

export default mongoDataSource;
