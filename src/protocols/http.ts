import { Request } from 'express';

export type HttpResponse = {
  status: number;
  body: unknown;
};

export interface CustomRequest extends Request {
  user: {
    id: number;
  };
}
