import { MixGetCompanyPermissions } from '@adapters/gateways/api/permissions/get.company.permissions.gateway';
import { logger } from '@configs/logger';
import {
  GetCompanyPermissionsGatewayDependencies,
  IGetCompanyPermissionsGateway
} from '../interfaces/get.company.permissions.interface';

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
