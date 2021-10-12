import jwt from 'jsonwebtoken';
import http from 'http';
import { MongoClient } from 'mongodb';
import { use_res_end } from './utils/use_res_end.util';
import { use_req_body } from './utils/use_req_body.util';
import { set_up_headers } from './utils/set_up_headers.util';
import status_codes from './status_codes';

const URL = 'mongodb+srv://admin:admin@cluster0.lvg9p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const client = new MongoClient(URL);
client.connect();

const db = client.db('shop');
const productsCollection = db.collection('products');
const categoriesCollection = db.collection('categories');

const JWT_SECRET = 'JWT_BY_PAS';

const server = http.createServer(async (req, res) => {
  if (!req) res.end(null);

  set_up_headers(res);

  if (req.url?.startsWith('/products') && req?.url?.includes('?id=')) {
    const id = req.url.split('?id=')?.[1];

    if (req.method === 'GET') {
      const product = (await productsCollection.findOne({
        id,
      })) as any;
      return use_res_end(res, [200, { 'Content-Type': 'application/json' }], { ...product });
    }

    if (req.method === 'POST') {
      return use_req_body(req, async (body) => {
        console.log(body);
        try {
          await productsCollection.updateOne(
            {
              id,
            },
            { $set: JSON.parse(body) },
            { upsert: true }
          );
          return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], 'All right');
        } catch (error) {
          return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
        }
      });
    }

    if (req.method === 'DELETE') {
      console.log(';');
      try {
        await productsCollection.deleteOne({
          id,
        });
        return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], 'Item was deleted');
      } catch (error) {
        return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
      }
    }
    return;
  }

  if (req.url === '/products' && req.method === 'GET') {
    const limitedProducts = await productsCollection.find({}).limit(20).toArray();

    return use_res_end(res, [200, { 'Content-Type': 'application/json' }], limitedProducts);
  }

  if (req.url?.startsWith('/search') && req.method === 'GET') {
    const query = req.url.split('?')?.[1];

    const searchedProducts = await productsCollection
      .find({ name: new RegExp(query) })
      .limit(20)
      .toArray();

    const searchedCategories = await categoriesCollection
      .find({ name: new RegExp(query) })
      .limit(20)
      .toArray();

    return use_res_end(
      res,
      [200, { 'Content-Type': 'application/json' }],
      [
        { caption: 'Products', arr: searchedProducts },
        { caption: 'Categories', arr: searchedCategories },
      ]
    );
  }

  if (req.url === '/auth' && req.method === 'POST') {
    return use_req_body(req, (body) => {
      const { login, password } = JSON.parse(body);

      const EXPIRES_IN_MINUTES = '1440m';
      if (login === 'admin' && password === 'admin') {
        const token = jwt.sign({ id: 'ADMIN' }, JWT_SECRET, {
          expiresIn: EXPIRES_IN_MINUTES,
        });
        return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], token);
      }
      return use_res_end(res, [status_codes.notAcceptable, { 'Content-Type': 'application/json' }], 'Not correct data');
    });
  }

  if (req.url === '/admin' && req.method === 'POST') {
    return use_req_body(req, (body) => {
      const { token } = JSON.parse(body);

      jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (!!err) {
          return use_res_end(res, [status_codes.unauthorized, { 'Content-Type': 'application/json' }], err);
        }

        return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], decoded);
      });
    });
  }

  if (req.url?.startsWith('/categories') && req?.url?.includes('?id=')) {
    const id = req.url.split('?id=')?.[1];
    if (req.method === 'GET') {
      const caterogy = (await categoriesCollection.findOne({
        id,
      })) as any;
      return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], caterogy);
    }

    if (req.method === 'DELETE') {
      await categoriesCollection.deleteOne({
        id,
      });

      return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], 'Item was deleted');
    }

    return;
  }

  if (req.url === '/categories' && req.method === 'GET') {
    const limitedCategories = await categoriesCollection.find({}).limit(20).toArray();

    return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], limitedCategories);
  }

  res.writeHead(status_codes.notFound, { 'Content-Type': 'application/json' });
  res.end('NOT FOUND');
});

const PORT = process.env.PORT || 3030;

server.listen(PORT, async () => {
  console.log('Server was started on ' + PORT + ' port');
});
