import jwt from 'jsonwebtoken';
import { use_res_end } from './use_res_end.util';
import status_codes from '../status_codes';

export const use_jwt_verify = (secret: string, token: string, res: any) => {
  let err: any;
  let dec: any;
  jwt.verify(token, secret, (error: any, decoded: any) => {
    if (!!error) {
      err = error;
    }
    return dec = decoded ;
  });

  if (!!err) {
    return [null, ()=>use_res_end(res, [status_codes.unauthorized, { 'Content-Type': 'application/json' }], err)];
  } else {
    return [dec, null];
  }
};
