import { use_res_end } from './use_res_end.util';
import jwt from 'jsonwebtoken';
import { get_random_id } from './get_random_id.util';
import nodemailer from 'nodemailer';
import status_codes from '../status_codes';
import { get_jwts } from './get_jwts.util';

const [JWT_SECRET_USER] = get_jwts();

export const use_send_mail = async (res: any, { name, email }: { [key: string]: string }, users_collection: any) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: {
      user: 'email8sender@gmail.com',
      pass: '12hgfh12ech1c2fwreyryw2t1gdfrt12ytu12hgfd21tywe65systuqwow3u2p19u0078923178768123867809132hgty71287t',
    },
    secure: true,
  });

  await new Promise((resolve: any, reject: any) => {
    transporter.verify((error: any, success: any) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log('Server is ready to take our messages');
        resolve(success);
      }
    });
  });

  const id = get_random_id();

  const token = jwt.sign({ id }, JWT_SECRET_USER);
  const mailData = {
    to: email,
    subject: `${name} please confirm email`,
    text: `Post link http://localhost:8080/pages/auth_user.html?${token}`,
  };

  await new Promise((resolve: any, reject: any) => {
    transporter.sendMail(mailData, (err: any, info: any) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  })
    .then(async (el) => {
      const is_user_was_incudes = await users_collection.findOne({ id });
      if (!!is_user_was_incudes)
        return use_res_end(
          res,
          [status_codes.serverError, { 'Content-Type': 'text/html' }],
          'Check previuous emails with auth token'
        );

      await users_collection.insertOne({ email, id, name });
      return use_res_end(
        res,
        [status_codes.OK, { 'Content-Type': 'text/html' }],
        'Check your email (and spam propbably)'
      );
    })
    .catch((error) => {
      return use_res_end(res, [status_codes.serverError, { 'Content-Type': 'application/json' }], error);
    });

  // res.status(200).json({ status: 'OK' });
};
