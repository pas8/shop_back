import { MongoClient } from 'mongodb';

export const use_connect = () => {
  const URL = 'mongodb+srv://admin:admin@cluster0.lvg9p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

  const client = new MongoClient(URL);
  client.connect();

  const db = client.db('shop');
  return db;
};
