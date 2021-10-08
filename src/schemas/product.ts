import { Schema, model } from 'mongoose';

const ProductSchema = new Schema({
  _id: 'string',
});
export default model('product', ProductSchema);
