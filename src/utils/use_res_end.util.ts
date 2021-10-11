import { OutgoingHttpHeader, ServerResponse } from 'http';

export const use_res_end = (
  res: ServerResponse,
  headerArguments: [number, { 'Content-Length'?: string; 'Content-Type'?: string }],
  content: any
) => {
  res.writeHead(...headerArguments);
  res.end(JSON.stringify(content));
};
