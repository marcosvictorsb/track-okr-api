import { IPresenter } from "@protocols/presenter";
import { CreateUserCriteria, IUserRepository, UpdateUserCriteria } from "./default.interfaces";
import { DataLogOutput } from "@adapters/services";
import { UserEntity } from "../entity/user.entity";
import { ActiveUserGateway } from "../gateways/active.user.gateway";
import { ActiveUserInteractor } from "../usecases";

export type InputActiveUser = {
  idUser: number;
  password: string;
}

export type ActiveUserInteractorDependencies = {
  gateway: ActiveUserGateway; 
  presenter: IPresenter;
}

export type IActiveUserGatewayDependencies = {
  userRepository: IUserRepository
}

export type ActiveUserControllerDependencies = {
  interactor: ActiveUserInteractor;
}

export interface IActiveUserGateway {
  findUser(criteria: CreateUserCriteria): Promise<UserEntity | undefined>;
  activateUser(data: Partial<UpdateUserCriteria>,
    criteria: UpdateUserCriteria): Promise<boolean>;
  encryptPassword(password: string): string;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}