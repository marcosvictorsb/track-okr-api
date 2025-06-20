import { HttpResponse } from './http';
 
export interface IPresenter {
  ok(response?: unknown): HttpResponse;
  created(response?: unknown): HttpResponse;
  noContent(message?: string): HttpResponse;
  badRequest(message?: string): HttpResponse;
  unauthorized(message?: string): HttpResponse;
  forbidden(message?: string): HttpResponse;
  unprocessableEntity(message?: string): HttpResponse;
  notFound(message?: string): HttpResponse;
  conflict(message?: string): HttpResponse;
  serverError(error?: unknown): HttpResponse;
}

export class Presenter implements IPresenter {
  ok(response?: unknown): HttpResponse {
    return {
      status: 200,
      body: response ?? null
    };
  }

  created(response?: unknown): HttpResponse {
    return {
      status: 201,
      body: response ?? null
    };
  }

  noContent(message?: string): HttpResponse {
    return {
      status: 204,
      body: message ? { message } : null
    };
  }

  badRequest(message?: string): HttpResponse {
    return {
      status: 400,
      body: { message: message ?? 'Bad request' }
    };
  }

  unauthorized(message?: string): HttpResponse {
    return {
      status: 401,
      body: { message: message ?? 'Unauthorized' }
    };
  }

  forbidden(message?: string): HttpResponse {
    return {
      status: 403,
      body: { message: message ?? 'Forbidden' }
    };
  }

  unprocessableEntity(message?: string): HttpResponse {
    return {
      status: 422,
      body: { message: message ?? 'Unprocessable entity' }
    };
  }

  notFound(message?: string): HttpResponse {
    return {
      status: 404,
      body: { message: message ?? 'Not found' }
    };
  }

  conflict(message?: string): HttpResponse {
    return {
      status: 409,
      body: { message: message ?? 'Conflict' }
    };
  }

  serverError(error?: unknown): HttpResponse {
    return {
      status: 500,
      body: {
        error:
          error ??
          'Ocorreu um erro interno no servidor. Tente novamente mais tarde.'
      }
    };
  }
}