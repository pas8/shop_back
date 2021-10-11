import http from 'http';
import { MongoClient } from 'mongodb';
import { use_res_end } from './utils/use_res_end.util';

const URL = 'mongodb+srv://admin:admin@cluster0.lvg9p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const client = new MongoClient(URL);
client.connect();

const db = client.db('shop');
const productsCollection = db.collection('products');

const server = http.createServer(async (req, res) => {
  if (!req) res.end(null);

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  if (req.url?.startsWith('/products') && req?.url?.includes('?id=') && req.method === 'GET') {
    const id = req.url.split('?id=')?.[1];

    const product = (await productsCollection.findOne({
      id,
    })) as any;
    return use_res_end(res, [200, { 'Content-Type': 'application/json' }], product);
  }

  if (req.url === '/products' && req.method === 'GET') {
    const limitedProducts = await productsCollection.find({}).limit(20).toArray();

    return use_res_end(res, [200, { 'Content-Type': 'application/json' }], limitedProducts);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end('PAGE NOT FOUND');
});

const PORT = process.env.PORT || 3030;
console.log(process.env);

server.listen(PORT, async () => {
  console.log('Server was started on ' + PORT + ' port');
});
