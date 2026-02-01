import { ActivateUserInteractor } from '@domains/api/users/usecases';
import { vi } from 'vitest';

class MockActivateUserGateway {
  findUser = vi.fn();
  activateUser = vi.fn();
  canActivateUser = vi.fn();
  loggerInfo = vi.fn();
  loggerError = vi.fn();
}

class MockPresenter {
  ok = vi.fn();
  created = vi.fn();
  noContent = vi.fn();
  badRequest = vi.fn();
  unauthorized = vi.fn();
  forbidden = vi.fn();
  unprocessableEntity = vi.fn();
  notFound = vi.fn();
  conflict = vi.fn();
  serverError = vi.fn();
}

export const userCompanyValidatorMock = {
  execute: vi.fn().mockResolvedValue({ isValid: true })
} as any;

export const activeUserGateway = new MockActivateUserGateway();
export const presenterMock = new MockPresenter();

export const activateUserInteractor = new ActivateUserInteractor({
  gateway: activeUserGateway,
  presenter: presenterMock,
  userCompanyValidator: userCompanyValidatorMock
});
