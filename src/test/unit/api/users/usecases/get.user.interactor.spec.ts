import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUserInteractor } from '@domains/api/users/usecases/get.user.interactor';
import { GetUserGateway } from '@domains/api/users/gateways/get.user.gateway';
import { IPresenter } from '@protocols/presenter';
import { GetUserTeamInteractor } from '@domains/common/user-teams/usecases';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { UserTeamEntity } from '@domains/common/user-teams/entity/user-team.entity';
import { UserStatus, InputGetUser } from '@domains/api/users/interfaces';

describe('GetUserInteractor', () => {
  let interactor: GetUserInteractor;
  let mockGateway: Partial<GetUserGateway>;
  let mockPresenter: Partial<IPresenter>;
  let mockGetUserTeamInteractor: Partial<GetUserTeamInteractor>;

  const mockUser: UserEntity = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password_hash: 'hashed_password',
    role: 'admin',
    status: UserStatus.ACTIVE,
    id_company: 1,
    created_at: new Date(),
    updated_at: null,
    deleted_at: null
  };

  const mockInput: InputGetUser = {
    id_user: 1,
    id_company: 1
  };

  beforeEach(() => {
    mockGateway = {
      loggerInfo: vi.fn(),
      loggerError: vi.fn(),
      findUser: vi.fn(),
      findUsers: vi.fn(),
      findUserTeams: vi.fn()
    };

    mockPresenter = {
      ok: vi.fn().mockReturnValue({ status: 200, body: [] }),
      forbidden: vi.fn().mockReturnValue({ status: 403, body: 'Forbidden' }),
      serverError: vi
        .fn()
        .mockReturnValue({ status: 500, body: 'Server Error' })
    };

    mockGetUserTeamInteractor = {};

    interactor = new GetUserInteractor({
      gateway: mockGateway as GetUserGateway,
      presenter: mockPresenter as IPresenter,
      getUserTeamInteractor: mockGetUserTeamInteractor as GetUserTeamInteractor
    });
  });

  describe('Error Flows', () => {
    it('should return forbidden when user does not belong to the company', async () => {
      // Arrange
      const userFromDifferentCompany = { ...mockUser, id_company: 2 };
      vi.mocked(mockGateway.findUser!).mockResolvedValue(
        userFromDifferentCompany
      );

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockGateway.findUser).toHaveBeenCalledWith({
        id: mockInput.id_user,
        id_company: mockInput.id_company
      });
      expect(mockGateway.loggerInfo).toHaveBeenCalledWith(
        'Usuário não pertence a empresa informada',
        {
          id_user: mockInput.id_user,
          id_company: mockInput.id_company
        }
      );
      expect(mockPresenter.forbidden).toHaveBeenCalledWith(
        'Usuário não pertence a empresa informada'
      );
    });

    it('should return empty array when no users are found', async () => {
      // Arrange
      vi.mocked(mockGateway.findUser!).mockResolvedValue(mockUser);
      vi.mocked(mockGateway.findUsers!).mockResolvedValue([]);

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockGateway.findUsers).toHaveBeenCalledWith({
        id_company: mockInput.id_company
      });
      expect(mockGateway.loggerInfo).toHaveBeenCalledWith(
        'Nenhum usuário encontrado'
      );
      expect(mockPresenter.ok).toHaveBeenCalledWith([]);
    });

    it('should return empty array when users is undefined', async () => {
      // Arrange
      vi.mocked(mockGateway.findUser!).mockResolvedValue(mockUser);
      vi.mocked(mockGateway.findUsers!).mockResolvedValue(undefined);

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockGateway.loggerInfo).toHaveBeenCalledWith(
        'Nenhum usuário encontrado'
      );
      expect(mockPresenter.ok).toHaveBeenCalledWith([]);
    });

    it('should return users with null team_id when no valid user IDs are found', async () => {
      // Arrange
      const usersWithoutIds = [
        { ...mockUser, id: undefined },
        { ...mockUser, id: null }
      ] as UserEntity[];
      vi.mocked(mockGateway.findUser!).mockResolvedValue(mockUser);
      vi.mocked(mockGateway.findUsers!).mockResolvedValue(usersWithoutIds);

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockGateway.loggerInfo).toHaveBeenCalledWith(
        'Nenhum usuário com ID válido encontrado'
      );
      expect(mockPresenter.ok).toHaveBeenCalledWith(
        usersWithoutIds.map((user) => ({ ...user, current_team_id: null }))
      );
    });

    it('should handle errors and return server error', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      vi.mocked(mockGateway.findUser!).mockRejectedValue(error);

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockGateway.loggerError).toHaveBeenCalledWith(
        'Erro ao buscar usuários',
        { error }
      );
      expect(mockPresenter.serverError).toHaveBeenCalledWith(
        'Erro ao buscar usuários'
      );
    });

    it('should handle error when findUsers throws exception', async () => {
      // Arrange
      const error = new Error('Database error');
      vi.mocked(mockGateway.findUser!).mockResolvedValue(mockUser);
      vi.mocked(mockGateway.findUsers!).mockRejectedValue(error);

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockGateway.loggerError).toHaveBeenCalledWith(
        'Erro ao buscar usuários',
        { error }
      );
      expect(mockPresenter.serverError).toHaveBeenCalledWith(
        'Erro ao buscar usuários'
      );
    });

    it('should handle error when findUserTeams throws exception', async () => {
      // Arrange
      const users = [mockUser, { ...mockUser, id: 2 }];
      const error = new Error('User teams fetch failed');

      vi.mocked(mockGateway.findUser!).mockResolvedValue(mockUser);
      vi.mocked(mockGateway.findUsers!).mockResolvedValue(users);
      vi.mocked(mockGateway.findUserTeams!).mockRejectedValue(error);

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockGateway.loggerError).toHaveBeenCalledWith(
        'Erro ao buscar usuários',
        { error }
      );
      expect(mockPresenter.serverError).toHaveBeenCalledWith(
        'Erro ao buscar usuários'
      );
    });
  });

  describe('Success Flows', () => {
    it('should return users sorted by status with team information', async () => {
      // Arrange
      const users = [
        { ...mockUser, id: 1, status: UserStatus.INACTIVE },
        { ...mockUser, id: 2, status: UserStatus.ACTIVE },
        { ...mockUser, id: 3, status: UserStatus.PENDING_ACTIVATION }
      ];

      const userTeams = [
        new UserTeamEntity({
          id_user: 1,
          id_team: 10,
          role_in_team: 'member',
          deleted_at: undefined
        }),
        new UserTeamEntity({
          id_user: 2,
          id_team: 20,
          role_in_team: 'member',
          deleted_at: undefined
        }),
        new UserTeamEntity({
          id_user: 3,
          id_team: 30,
          role_in_team: 'member',
          deleted_at: new Date()
        }) // deleted team
      ];

      vi.mocked(mockGateway.findUser!).mockResolvedValue(mockUser);
      vi.mocked(mockGateway.findUsers!).mockResolvedValue(users);
      vi.mocked(mockGateway.findUserTeams!).mockResolvedValue(userTeams);

      const expectedResult = [
        { ...users[1], current_team_id: 20 }, // ACTIVE first
        { ...users[2], current_team_id: null }, // PENDING_ACTIVATION second (deleted team)
        { ...users[0], current_team_id: 10 } // INACTIVE last
      ];

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockGateway.loggerInfo).toHaveBeenCalledWith(
        'Iniciando a busca dos usuários',
        { requestTxt: JSON.stringify(mockInput) }
      );
      expect(mockGateway.findUsers).toHaveBeenCalledWith({
        id_company: mockInput.id_company
      });
      expect(mockGateway.findUserTeams).toHaveBeenCalledWith({
        idsUser: expect.arrayContaining([1, 2, 3])
      });
      expect(mockPresenter.ok).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle users with mixed status values correctly', async () => {
      // Arrange
      const users = [
        { ...mockUser, id: 1, status: undefined as unknown as string },
        { ...mockUser, id: 2, status: UserStatus.ACTIVE },
        { ...mockUser, id: 3, status: null as unknown as string }
      ];

      const userTeams = [
        new UserTeamEntity({
          id_user: 2,
          id_team: 20,
          role_in_team: 'member',
          deleted_at: undefined
        })
      ];

      vi.mocked(mockGateway.findUser!).mockResolvedValue(mockUser);
      vi.mocked(mockGateway.findUsers!).mockResolvedValue(users);
      vi.mocked(mockGateway.findUserTeams!).mockResolvedValue(userTeams);

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockPresenter.ok).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 2, current_team_id: 20 }),
          expect.objectContaining({ id: 1, current_team_id: null }),
          expect.objectContaining({ id: 3, current_team_id: null })
        ])
      );
    });

    it('should return users with null team_id when no user teams are found', async () => {
      // Arrange
      const users = [mockUser];
      vi.mocked(mockGateway.findUser!).mockResolvedValue(mockUser);
      vi.mocked(mockGateway.findUsers!).mockResolvedValue(users);
      vi.mocked(mockGateway.findUserTeams!).mockResolvedValue([]);

      const expectedResult = [{ ...mockUser, current_team_id: null }];

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockPresenter.ok).toHaveBeenCalledWith(expectedResult);
    });

    it('should filter out deleted user teams', async () => {
      // Arrange
      const users = [{ ...mockUser, id: 1 }];
      const userTeams = [
        new UserTeamEntity({
          id_user: 1,
          id_team: 10,
          role_in_team: 'member',
          deleted_at: new Date()
        }), // deleted
        new UserTeamEntity({
          id_user: 1,
          id_team: 20,
          role_in_team: 'member',
          deleted_at: undefined
        }) // active
      ];

      vi.mocked(mockGateway.findUser!).mockResolvedValue(mockUser);
      vi.mocked(mockGateway.findUsers!).mockResolvedValue(users);
      vi.mocked(mockGateway.findUserTeams!).mockResolvedValue(userTeams);

      const expectedResult = [{ ...users[0], current_team_id: 20 }];

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockPresenter.ok).toHaveBeenCalledWith(expectedResult);
    });

    it('should work correctly when findUser returns null (user not found initially)', async () => {
      // Arrange
      const users = [mockUser];
      vi.mocked(mockGateway.findUser!).mockResolvedValue(
        null as unknown as UserEntity
      );
      vi.mocked(mockGateway.findUsers!).mockResolvedValue(users);
      vi.mocked(mockGateway.findUserTeams!).mockResolvedValue([]);

      const expectedResult = [{ ...mockUser, current_team_id: null }];

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockPresenter.ok).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle large number of users efficiently', async () => {
      // Arrange
      const users = Array.from({ length: 100 }, (_, i) => ({
        ...mockUser,
        id: i + 1,
        email: `user${i + 1}@example.com`,
        status:
          i % 3 === 0
            ? UserStatus.ACTIVE
            : i % 3 === 1
              ? UserStatus.PENDING_ACTIVATION
              : UserStatus.INACTIVE
      }));

      const userTeams = users.slice(0, 50).map(
        (user, i) =>
          new UserTeamEntity({
            id_user: user.id!,
            id_team: 100 + i,
            role_in_team: 'member',
            deleted_at: undefined
          })
      );

      vi.mocked(mockGateway.findUser!).mockResolvedValue(mockUser);
      vi.mocked(mockGateway.findUsers!).mockResolvedValue(users);
      vi.mocked(mockGateway.findUserTeams!).mockResolvedValue(userTeams);

      // Act
      await interactor.execute(mockInput);

      // Assert
      expect(mockGateway.findUserTeams).toHaveBeenCalledWith({
        idsUser: users.map((u) => u.id)
      });
      expect(mockPresenter.ok).toHaveBeenCalled();
      const resultData = vi.mocked(mockPresenter.ok).mock
        .calls[0]?.[0] as UserEntity[];
      expect(resultData).toHaveLength(100);
    });

    it('should sort users correctly by status priority', async () => {
      // Arrange
      const users = [
        { ...mockUser, id: 1, name: 'User 1', status: UserStatus.INACTIVE },
        {
          ...mockUser,
          id: 2,
          name: 'User 2',
          status: UserStatus.PENDING_ACTIVATION
        },
        { ...mockUser, id: 3, name: 'User 3', status: UserStatus.ACTIVE },
        { ...mockUser, id: 4, name: 'User 4', status: UserStatus.INACTIVE },
        { ...mockUser, id: 5, name: 'User 5', status: UserStatus.ACTIVE }
      ];

      vi.mocked(mockGateway.findUser!).mockResolvedValue(mockUser);
      vi.mocked(mockGateway.findUsers!).mockResolvedValue(users);
      vi.mocked(mockGateway.findUserTeams!).mockResolvedValue([]);

      // Act
      await interactor.execute(mockInput);

      // Assert
      const resultData = vi.mocked(mockPresenter.ok).mock
        .calls[0]?.[0] as UserEntity[];

      // Check that ACTIVE users come first
      expect(resultData[0].status).toBe(UserStatus.ACTIVE);
      expect(resultData[1].status).toBe(UserStatus.ACTIVE);

      // Then PENDING_ACTIVATION
      expect(resultData[2].status).toBe(UserStatus.PENDING_ACTIVATION);

      // Finally INACTIVE
      expect(resultData[3].status).toBe(UserStatus.INACTIVE);
      expect(resultData[4].status).toBe(UserStatus.INACTIVE);
    });
  });
});
