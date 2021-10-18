import { IncomingMessage } from 'http';

export const use_req_body = (req: IncomingMessage, on_req_end: (body: string) => void) => {
  var body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    on_req_end(body);
  });
};
