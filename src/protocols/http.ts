import { Request } from 'express';

export type HttpResponse = {
  status: number;
  body: unknown;
};

// Option 1: Add a 'user' property to the request, which is a common pattern
export interface CustomRequest extends Request {
  user?: {
    id: number;
    // add other user properties if needed
  };
}
