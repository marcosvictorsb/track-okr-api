/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';

interface Response {
  status?: any;
  json?: any;
}

export function makeResponseMock() {
  const res: Response = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}
