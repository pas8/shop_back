import { use_connect } from './use_connect.util';

export const get_collections = () => {
  const db = use_connect();

  return [
    db.collection('products'),
    db.collection('categories'),
    db.collection('orders'),
    db.collection('users'),
    db.collection('feedback'),
  ];
};
