/* eslint-disable @typescript-eslint/no-empty-object-type */
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

interface User {
  id?: number;
  id_company?: number;
}

interface RequestParams {
  id?: number | string;
}

export interface RequestMock extends UserPayload {}
