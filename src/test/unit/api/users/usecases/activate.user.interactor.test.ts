import { InputActivateUser } from '@domains/api/users/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  activateUserInteractor,
  activeUserGateway,
  presenterMock,
  userCompanyValidatorMock
} from '../mocks/active.user.interactor.mock';

describe('ActivateUserInteractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('should return badRequest when company validation is invalid', async () => {
      const input: InputActivateUser = {
        id_user_to_activate: 10,
        id_company: 99,
        id_user: 1
      };
      userCompanyValidatorMock.execute.mockResolvedValueOnce({
        isValid: false
      });
      presenterMock.badRequest.mockReturnValueOnce({
        status: 400,
        body: 'Bad Request'
      });

      const response = await activateUserInteractor.execute(input);

      expect(activeUserGateway.loggerInfo).toHaveBeenCalledWith(
        'Iniciando ativação do usuário',
        {
          data: JSON.stringify({
            id_user_to_activate: input.id_user_to_activate,
            id_company: input.id_company,
            id_user: input.id_user
          })
        }
      );

      expect(userCompanyValidatorMock.execute).toHaveBeenCalledWith({
        id_user: input.id_user,
        id_company: input.id_company
      });

      expect(activeUserGateway.loggerError).toHaveBeenCalledWith(
        'O usuário ou empresa não é válido',
        {
          id_company: input.id_company,
          id_user: input.id_user
        }
      );

      expect(presenterMock.badRequest).toHaveBeenCalledWith(
        'O usuário ou empresa não é válido'
      );

      expect(activeUserGateway.findUser).not.toHaveBeenCalled();
      expect(activeUserGateway.activateUser).not.toHaveBeenCalled();
      expect(activeUserGateway.canActivateUser).not.toHaveBeenCalled();
      expect(presenterMock.ok).not.toHaveBeenCalled();
      expect(presenterMock.notFound).not.toHaveBeenCalled();
      expect(presenterMock.forbidden).not.toHaveBeenCalled();
      expect(presenterMock.serverError).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(response.body).toBe('Bad Request');
    });

    it('should return notFound when requesting user not exist', async () => {
      const input: InputActivateUser = {
        id_user_to_activate: 10,
        id_company: 99,
        id_user: 1
      };
      userCompanyValidatorMock.execute.mockResolvedValueOnce({
        isValid: true
      });
      activeUserGateway.findUser.mockResolvedValueOnce(null);
      presenterMock.badRequest.mockReturnValueOnce({
        status: 400,
        body: 'Bad Request'
      });

      await activateUserInteractor.execute(input);

      expect(activeUserGateway.loggerInfo).toHaveBeenCalledWith(
        'Iniciando ativação do usuário',
        {
          data: JSON.stringify({
            id_user_to_activate: input.id_user_to_activate,
            id_company: input.id_company,
            id_user: input.id_user
          })
        }
      );
      expect(userCompanyValidatorMock.execute).toHaveBeenCalledWith({
        id_user: input.id_user,
        id_company: input.id_company
      });
      expect(activeUserGateway.findUser).toHaveBeenCalledWith({
        id: input.id_user
      });
      expect(activeUserGateway.loggerInfo).toHaveBeenCalledWith(
        'Usuário solicitante não encontrado',
        {
          id_user: input.id_user
        }
      );
      expect(presenterMock.notFound).toHaveBeenCalledWith(
        'Usuário não encontrado'
      );
      expect(activeUserGateway.activateUser).not.toHaveBeenCalled();
      expect(activeUserGateway.canActivateUser).not.toHaveBeenCalled();
      expect(presenterMock.ok).not.toHaveBeenCalled();
      expect(presenterMock.forbidden).not.toHaveBeenCalled();
      expect(presenterMock.serverError).not.toHaveBeenCalled();
    });

    it('should return notFound when user to activate not exist', async () => {
      const input: InputActivateUser = {
        id_user_to_activate: 10,
        id_company: 99,
        id_user: 1
      };
      userCompanyValidatorMock.execute.mockResolvedValueOnce({
        isValid: true
      });
      activeUserGateway.findUser
        .mockResolvedValueOnce({ id: 22 })
        .mockResolvedValueOnce(null);

      presenterMock.badRequest.mockReturnValueOnce({
        status: 400,
        body: 'Bad Request'
      });

      await activateUserInteractor.execute(input);

      expect(activeUserGateway.loggerInfo).toHaveBeenCalledWith(
        'Iniciando ativação do usuário',
        {
          data: JSON.stringify({
            id_user_to_activate: input.id_user_to_activate,
            id_company: input.id_company,
            id_user: input.id_user
          })
        }
      );
      expect(userCompanyValidatorMock.execute).toHaveBeenCalledWith({
        id_user: input.id_user,
        id_company: input.id_company
      });
      expect(activeUserGateway.findUser).toHaveBeenCalledWith({
        id: input.id_user
      });
      expect(activeUserGateway.loggerInfo).toHaveBeenCalledWith(
        'Usuário a ser ativado não encontrado',
        {
          data: JSON.stringify({
            id_user_to_activate: input.id_user_to_activate,
            id_company: input.id_company
          })
        }
      );
      expect(presenterMock.notFound).toHaveBeenCalledWith(
        'Usuário a ser ativado não encontrado'
      );
      expect(activeUserGateway.activateUser).not.toHaveBeenCalled();
      expect(activeUserGateway.canActivateUser).not.toHaveBeenCalled();
      expect(presenterMock.ok).not.toHaveBeenCalled();
      expect(presenterMock.forbidden).not.toHaveBeenCalled();
      expect(presenterMock.serverError).not.toHaveBeenCalled();
    });

    it('should return forbidden when user user cant to be activated', async () => {
      const input: InputActivateUser = {
        id_user_to_activate: 10,
        id_company: 99,
        id_user: 1
      };
      userCompanyValidatorMock.execute.mockResolvedValueOnce({
        isValid: true
      });
      activeUserGateway.findUser
        .mockResolvedValueOnce({ id: 22 })
        .mockResolvedValueOnce({ id: 10 });

      activeUserGateway.canActivateUser.mockResolvedValueOnce({
        canActivateUser: false,
        message: 'No permission'
      });

      await activateUserInteractor.execute(input);

      expect(activeUserGateway.loggerInfo).toHaveBeenCalledWith(
        'Iniciando ativação do usuário',
        {
          data: JSON.stringify({
            id_user_to_activate: input.id_user_to_activate,
            id_company: input.id_company,
            id_user: input.id_user
          })
        }
      );
      expect(userCompanyValidatorMock.execute).toHaveBeenCalledWith({
        id_user: input.id_user,
        id_company: input.id_company
      });
      expect(activeUserGateway.findUser).toHaveBeenCalledWith({
        id: input.id_user
      });
      expect(activeUserGateway.canActivateUser).toBeCalledWith(
        { id: 10 },
        { id: 22 }
      );
      expect(activeUserGateway.loggerInfo).toBeCalledWith(
        'Sem permissão para ativar o usuário',
        {
          data: JSON.stringify({
            id_user_to_activate: input.id_user_to_activate,
            requesting_user: input.id_user,
            message: 'No permission'
          })
        }
      );
      expect(presenterMock.forbidden).toBeCalledWith('No permission');
      expect(activeUserGateway.activateUser).not.toHaveBeenCalled();
      expect(presenterMock.ok).not.toHaveBeenCalled();
      expect(presenterMock.serverError).not.toHaveBeenCalled();
    });

    it('should return serverError when user cant to be activated', async () => {
      const input: InputActivateUser = {
        id_user_to_activate: 10,
        id_company: 99,
        id_user: 1
      };
      userCompanyValidatorMock.execute.mockResolvedValueOnce({
        isValid: true
      });
      activeUserGateway.findUser
        .mockResolvedValueOnce({ id: 22 })
        .mockResolvedValueOnce({ id: 10 });

      activeUserGateway.canActivateUser.mockResolvedValueOnce({
        canActivateUser: true
      });

      activeUserGateway.activateUser.mockResolvedValueOnce(null);

      await activateUserInteractor.execute(input);

      expect(activeUserGateway.loggerInfo).toHaveBeenCalledWith(
        'Iniciando ativação do usuário',
        {
          data: JSON.stringify({
            id_user_to_activate: input.id_user_to_activate,
            id_company: input.id_company,
            id_user: input.id_user
          })
        }
      );
      expect(userCompanyValidatorMock.execute).toHaveBeenCalledWith({
        id_user: input.id_user,
        id_company: input.id_company
      });
      expect(activeUserGateway.findUser).toHaveBeenCalledWith({
        id: input.id_user
      });
      expect(activeUserGateway.canActivateUser).toBeCalledWith(
        { id: 10 },
        { id: 22 }
      );
      expect(activeUserGateway.activateUser).toBeCalledWith({
        id: input.id_user_to_activate
      });

      expect(activeUserGateway.loggerError).toBeCalledWith(
        'Erro ao ativar o usuário',
        {
          data: JSON.stringify({
            id_user_to_activate: input.id_user_to_activate
          })
        }
      );
      expect(presenterMock.serverError).toBeCalledWith(
        'Erro ao ativar o usuário'
      );
      expect(presenterMock.ok).not.toHaveBeenCalled();
    });

    it('should return ok when user can to be activated', async () => {
      const input: InputActivateUser = {
        id_user_to_activate: 10,
        id_company: 99,
        id_user: 1
      };
      userCompanyValidatorMock.execute.mockResolvedValueOnce({
        isValid: true
      });
      activeUserGateway.findUser
        .mockResolvedValueOnce({ id: 22 })
        .mockResolvedValueOnce({ id: 10 });

      activeUserGateway.canActivateUser.mockResolvedValueOnce({
        canActivateUser: true
      });

      activeUserGateway.activateUser.mockResolvedValueOnce({});

      await activateUserInteractor.execute(input);

      expect(activeUserGateway.loggerInfo).toHaveBeenCalledWith(
        'Iniciando ativação do usuário',
        {
          data: JSON.stringify({
            id_user_to_activate: input.id_user_to_activate,
            id_company: input.id_company,
            id_user: input.id_user
          })
        }
      );
      expect(userCompanyValidatorMock.execute).toHaveBeenCalledWith({
        id_user: input.id_user,
        id_company: input.id_company
      });
      expect(activeUserGateway.findUser).toHaveBeenCalledWith({
        id: input.id_user
      });
      expect(activeUserGateway.canActivateUser).toBeCalledWith(
        { id: 10 },
        { id: 22 }
      );
      expect(activeUserGateway.activateUser).toBeCalledWith({
        id: input.id_user_to_activate
      });

      expect(activeUserGateway.loggerInfo).toBeCalledWith(
        'Usuário ativado com sucesso',
        {
          data: JSON.stringify({
            id_user_to_activate: input.id_user_to_activate,
            activated_by: input.id_user
          })
        }
      );
      expect(presenterMock.ok).toBeCalledWith({
        message: 'Usuário ativado com sucesso',
        user_id: input.id_user_to_activate
      });
      expect(presenterMock.serverError).not.toHaveBeenCalled();
      expect(activeUserGateway.loggerError).not.toHaveBeenCalled();
    });

    it('should return (catch) server error when fails methods userCompanyValidator.execute', async () => {
      const input: InputActivateUser = {
        id_user_to_activate: 10,
        id_company: 99,
        id_user: 1
      };
      userCompanyValidatorMock.execute.mockRejectedValueOnce({
        message: 'Error interno',
        stack: 'error_stack'
      });

      await activateUserInteractor.execute(input);

      expect(activeUserGateway.loggerInfo).toHaveBeenCalledWith(
        'Iniciando ativação do usuário',
        {
          data: JSON.stringify({
            id_user_to_activate: input.id_user_to_activate,
            id_company: input.id_company,
            id_user: input.id_user
          })
        }
      );
      expect(userCompanyValidatorMock.execute).toHaveBeenCalledWith({
        id_user: input.id_user,
        id_company: input.id_company
      });
      expect(activeUserGateway.findUser).not.toHaveBeenCalled();
      expect(activeUserGateway.canActivateUser).not.toHaveBeenCalled();
      expect(activeUserGateway.activateUser).not.toHaveBeenCalled();
      expect(presenterMock.ok).not.toHaveBeenCalled();
      expect(activeUserGateway.loggerError).toHaveBeenCalledWith(
        'Erro ao ativar o usuário',
        {
          error: 'Error interno',
          stack: 'error_stack'
        }
      );
      expect(presenterMock.serverError).toHaveBeenCalledWith(
        'Erro ao ativar o usuário'
      );
    });
  });
});
