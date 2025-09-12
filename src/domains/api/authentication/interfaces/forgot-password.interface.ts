import { HttpResponse } from '@protocols/http';

export type InputForgotPassword = {
  email: string;
};

export type ForgotPasswordControllerDependencies = {
  interactor: {
    execute(input: InputForgotPassword): Promise<HttpResponse>;
  };
};
