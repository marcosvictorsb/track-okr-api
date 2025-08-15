import { MixGetCompanyPermissions } from '@adapters/gateways/api/permissions/get.company.permissions.gateway';
import {
  GetCompanyPermissionsGatewayDependencies,
  IGetCompanyPermissionsGateway
} from '../interfaces/get.company.permissions.interface';
import { logger } from '@configs/logger';

export class GetCompanyPermissionsGateway
  extends MixGetCompanyPermissions
  implements IGetCompanyPermissionsGateway
{
  logging: typeof logger;

  constructor(params: GetCompanyPermissionsGatewayDependencies) {
    super(params);
    this.logging = params.logging;
  }
}
