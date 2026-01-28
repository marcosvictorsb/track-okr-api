// tests/controllers/activateUser.controller.spec.ts
import { ActivateUserController } from '@domains/api/users/controllers';
import { makeResponseMock } from '@test/mocks/response.mocks.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

export const activateUserInteractorMock = {
  execute: vi.fn()
};

describe('ActivateUserController', () => {
  let controller: ActivateUserController;

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new ActivateUserController({
      interactor: activateUserInteractorMock as any
    });
  });

  it('deve ativar usuário e retornar status e body corretos', async () => {
    const request: any = {
      params: { id: '10' },
      user: {
        id: 1,
        id_company: 99
      }
    };

    const response = makeResponseMock();

    activateUserInteractorMock.execute.mockResolvedValue({
      status: 200,
      body: { success: true }
    });

    await controller.activateUser(request, response);

    expect(activateUserInteractorMock.execute).toHaveBeenCalledWith({
      id_user_to_activate: 10,
      id_company: 99,
      id_user: 1
    });

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ success: true });
  });
});
