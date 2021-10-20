import jwt from 'jsonwebtoken';
import http from 'http';
import { MongoClient } from 'mongodb';
import { use_res_end } from './utils/use_res_end.util';
import { use_req_body } from './utils/use_req_body.util';
import { set_up_headers } from './utils/set_up_headers.util';
import status_codes from './status_codes';
import { get_random_id } from './utils/get_random_id.util';

const URL = 'mongodb+srv://admin:admin@cluster0.lvg9p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const client = new MongoClient(URL);
client.connect();

const db = client.db('shop');
const productsCollection = db.collection('products');
const categoriesCollection = db.collection('categories');
const ordersCollection = db.collection('orders');

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

    return;
  }

  if (req.url?.startsWith('/delete_products') && req?.url?.includes('?id=')) {
    const id = req.url.split('?id=')?.[1];

    try {
      await productsCollection.deleteOne({
        id,
      });
      return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], 'Item was deleted');
    } catch (error) {
      return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
    }
  }

  if (req.url?.startsWith('/delete_categories') && req?.url?.includes('?id=')) {
    const id = req.url.split('?id=')?.[1];

    try {
      await categoriesCollection.deleteOne({
        id,
      });
      return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], 'Item was deleted');
    } catch (error) {
      return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
    }
  }

  if (req.url === '/new_product' && req.method === 'POST') {
    return use_req_body(req, async (body) => {

      try {
        const id = get_random_id();
        await productsCollection.insertOne({ ...JSON.parse(body), id });
        return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], [id, 'product was added']);
      } catch (error) {
        return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
      }
    });
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
      .find({ name: new RegExp(query), isParent: false })
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

  if (req.url === '/orders' && req.method === 'GET') {
    const orders_arr = await ordersCollection.find({}).toArray();

    return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], orders_arr);
  }

  if (req.url?.startsWith('/delete_order') && req?.url?.includes('?id=') && req.method === 'GET') {
    const id = req.url.split('?id=')?.[1];

    try {
      await ordersCollection.deleteOne({
        id,
      });
      return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], 'Item was deleted');
    } catch (error) {
      return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
    }
  }

  if (req.url?.startsWith('/orders') && req?.url?.includes('?id=')) {
    const id = req.url.split('?id=')?.[1];

    if (req.method === 'GET') {
      const order = (await ordersCollection.findOne({
        id,
      })) as any;
      return use_res_end(res, [200, { 'Content-Type': 'application/json' }], order);
    }

    if (req.method === 'POST') {
      return use_req_body(req, async (body) => {
        try {
          await ordersCollection.updateOne(
            {
              id,
            },
            { $set: JSON.parse(body) },
            { upsert: false }
          );
          return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], 'All right');
        } catch (error) {
          return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
        }
      });
    }
  }

  if (req.url === '/new_order' && req.method === 'POST') {
    return use_req_body(req, async (body) => {
      try {
        await ordersCollection.insertOne({ ...JSON.parse(body), id: get_random_id() });
        return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], 'Order was added');
      } catch (error) {
        return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
      }
    });
  }

  if (req.url === '/new_category' && req.method === 'POST') {
    return use_req_body(req, async (body) => {
      try {
        await categoriesCollection.insertOne({ ...JSON.parse(body), id: get_random_id() });
        return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], 'Order was added');
      } catch (error) {
        return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
      }
    });
  }
  // if (req.url === '/open_orders' && req.method === 'GET') {
  //   const open_orders_arr = await ordersCollection.find({ status: 'open' }).toArray();

  //   return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], open_orders_arr);
  // }

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

  if (req.url?.startsWith('/parent_category') && req?.url?.includes('?id=')) {
    const id = req.url.split('?id=')?.[1];

    const children_categories = await categoriesCollection.find({ parentId: id }).toArray();

    return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], children_categories);
  }

  if (req.url === '/parent_categories' && req.method === 'GET') {
    const parent_Categories = await categoriesCollection.find({ isParent: true }).toArray();

    return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], parent_Categories);
  }

  if (req.url?.startsWith('/categories') && req?.url?.includes('?id=')) {
    const id = req.url.split('?id=')?.[1];
    if (req.method === 'GET') {
      const caterogy = (await categoriesCollection.findOne({
        id,
      })) as any;
      return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], caterogy);
    }

    if (req.method === 'POST') {
      return use_req_body(req, async (body) => {
        try {
          await categoriesCollection.updateOne(
            {
              id,
            },
            { $set: JSON.parse(body) },
            { upsert: false }
          );
          return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], 'All right');
        } catch (error) {
          return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
        }
      });
    }

    return;
  }

  if (req.url?.startsWith('/products_of_') && req.method === 'GET' && req?.url?.includes('?category')) {
    const id = req.url.split('?category=')?.[1];

    try {
      const products_of_category_arr = await productsCollection.find({ categories: { $all: [id] } }).toArray();
      return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], products_of_category_arr);
    } catch (error) {
      return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
    }
  }

  if (req.url === '/all_parent_categories' && req.method === 'GET') {
    const all_parent_categories_arr = await categoriesCollection.find({ isParent: true }).toArray();

    return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], all_parent_categories_arr);
  }

  if (req.url === '/all_children_categories' && req.method === 'GET') {
    const all_parent_categories_arr = await categoriesCollection.find({ isParent: false }).toArray();

    return use_res_end(res, [status_codes.OK, { 'Content-Type': 'application/json' }], all_parent_categories_arr);
  }

  res.writeHead(status_codes.notFound, { 'Content-Type': 'application/json' });
  res.end('NOT FOUND');
});

const PORT = process.env.PORT || 3030;

server.listen(PORT, async () => {
  console.log('Server was started on ' + PORT + ' port');
});
