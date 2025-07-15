#!/usr/bin/env node

// Scaffold Generator para Clean Architecture
// Este arquivo usa sintaxe CommonJS e deve ser executado diretamente com Node.js

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class ScaffoldGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.basePath = './src/domains/api';
  }

  async run() {
    try {
      console.log('🚀 Gerador de Scaffold para Clean Architecture\n');

      const featureName = await this.askQuestion(
        'Nome da feature (ex: Task, Project): '
      );
      if (!featureName) {
        console.log('❌ Nome da feature é obrigatório');
        process.exit(1);
      }

      const domainChoice = await this.askQuestion(
        'Usar domínio existente? (s/N): '
      );
      let domainName = '';

      if (
        domainChoice.toLowerCase() === 's' ||
        domainChoice.toLowerCase() === 'sim'
      ) {
        const domains = await this.getExistingDomains();
        if (domains.length === 0) {
          console.log('❌ Nenhum domínio encontrado. Criando novo domínio...');
          domainName = await this.askQuestion('Nome do novo domínio: ');
        } else {
          console.log('Domínios existentes:');
          domains.forEach((domain, index) => {
            console.log(`${index + 1}. ${domain}`);
          });
          const domainIndex = await this.askQuestion(
            'Escolha o número do domínio: '
          );
          const selectedIndex = parseInt(domainIndex) - 1;
          if (selectedIndex >= 0 && selectedIndex < domains.length) {
            domainName = domains[selectedIndex];
          } else {
            console.log('❌ Opção inválida');
            process.exit(1);
          }
        }
      } else {
        domainName = await this.askQuestion('Nome do novo domínio: ');
      }

      if (!domainName) {
        console.log('❌ Nome do domínio é obrigatório');
        process.exit(1);
      }

      await this.generateScaffold(featureName, domainName);
      console.log('✅ Scaffold gerado com sucesso!');
    } catch (err) {
      console.error('❌ Erro:', err.message);
    } finally {
      this.rl.close();
    }
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async getExistingDomains() {
    try {
      const domains = await fs.readdir(this.basePath);
      return domains.filter(async (domain) => {
        const stat = await fs.stat(path.join(this.basePath, domain));
        return stat.isDirectory();
      });
    } catch (error) {
      return [];
    }
  }

  async generateScaffold(featureName, domainName) {
    const domainPath = path.join(this.basePath, domainName);
    const featurePath = path.join(domainPath, this.kebabCase(featureName));

    // Criar estrutura de pastas
    const folders = [
      'controllers',
      'entity',
      'factories',
      'gateways',
      'interfaces',
      'model',
      'repository',
      'routers',
      'schemas',
      'usecases'
    ];

    console.log(
      `\n📁 Criando estrutura para ${featureName} em ${domainName}...`
    );

    // Verificar se a feature já existe
    try {
      await fs.access(featurePath);
      console.log('⚠️  Feature já existe! Continuando...');
    } catch {
      // Feature não existe, ok para criar
    }

    // Criar pastas
    for (const folder of folders) {
      const folderPath = path.join(featurePath, folder);
      await fs.mkdir(folderPath, { recursive: true });
      console.log(`✓ Criada pasta: ${folder}`);
    }

    // Gerar arquivos
    await this.generateFiles(featureName, featurePath);
  }

  async generateFiles(featureName, featurePath) {
    const lowerFeature = this.kebabCase(featureName);
    const camelFeature = this.camelCase(featureName);
    const pascalFeature = this.pascalCase(featureName);

    console.log('\n📄 Gerando arquivos...');

    // Entity
    await this.createFile(
      path.join(featurePath, 'entity', `${lowerFeature}.entity.ts`),
      this.generateEntityContent(pascalFeature)
    );

    // Model
    await this.createFile(
      path.join(featurePath, 'model', `${lowerFeature}.model.ts`),
      this.generateModelContent(pascalFeature, lowerFeature)
    );

    // Interfaces
    await this.createFile(
      path.join(featurePath, 'interfaces', 'index.ts'),
      this.generateInterfacesIndexContent(lowerFeature)
    );

    await this.createFile(
      path.join(featurePath, 'interfaces', 'default.interfaces.ts'),
      this.generateDefaultInterfacesContent(pascalFeature)
    );

    await this.createFile(
      path.join(
        featurePath,
        'interfaces',
        `create.${lowerFeature}.interface.ts`
      ),
      this.generateCreateInterfaceContent(
        pascalFeature,
        lowerFeature,
        camelFeature
      )
    );

    await this.createFile(
      path.join(featurePath, 'interfaces', `get.${lowerFeature}.interface.ts`),
      this.generateGetInterfaceContent(
        pascalFeature,
        lowerFeature,
        camelFeature
      )
    );

    await this.createFile(
      path.join(
        featurePath,
        'interfaces',
        `update.${lowerFeature}.interface.ts`
      ),
      this.generateUpdateInterfaceContent(
        pascalFeature,
        lowerFeature,
        camelFeature
      )
    );

    await this.createFile(
      path.join(
        featurePath,
        'interfaces',
        `delete.${lowerFeature}.interface.ts`
      ),
      this.generateDeleteInterfaceContent(
        pascalFeature,
        lowerFeature,
        camelFeature
      )
    );

    // Repository
    await this.createFile(
      path.join(featurePath, 'repository', `${lowerFeature}.repository.ts`),
      this.generateRepositoryContent(pascalFeature, lowerFeature)
    );

    // Gateways
    await this.createFile(
      path.join(featurePath, 'gateways', `create.${lowerFeature}.gateway.ts`),
      this.generateGatewayContent('Create', pascalFeature)
    );

    await this.createFile(
      path.join(featurePath, 'gateways', `get.${lowerFeature}.gateway.ts`),
      this.generateGatewayContent('Get', pascalFeature)
    );

    await this.createFile(
      path.join(featurePath, 'gateways', `update.${lowerFeature}.gateway.ts`),
      this.generateGatewayContent('Update', pascalFeature)
    );

    await this.createFile(
      path.join(featurePath, 'gateways', `delete.${lowerFeature}.gateway.ts`),
      this.generateGatewayContent('Delete', pascalFeature)
    );

    // Use Cases (Interactors)
    await this.createFile(
      path.join(featurePath, 'usecases', 'index.ts'),
      this.generateUseCasesIndexContent(lowerFeature)
    );

    await this.createFile(
      path.join(
        featurePath,
        'usecases',
        `create.${lowerFeature}.interactor.ts`
      ),
      this.generateInteractorContent('Create', pascalFeature, lowerFeature)
    );

    await this.createFile(
      path.join(featurePath, 'usecases', `get.${lowerFeature}.interactor.ts`),
      this.generateInteractorContent('Get', pascalFeature, lowerFeature)
    );

    await this.createFile(
      path.join(
        featurePath,
        'usecases',
        `update.${lowerFeature}.interactor.ts`
      ),
      this.generateInteractorContent('Update', pascalFeature, lowerFeature)
    );

    await this.createFile(
      path.join(
        featurePath,
        'usecases',
        `delete.${lowerFeature}.interactor.ts`
      ),
      this.generateInteractorContent('Delete', pascalFeature, lowerFeature)
    );

    // Controllers
    await this.createFile(
      path.join(featurePath, 'controllers', 'index.ts'),
      this.generateControllersIndexContent(lowerFeature)
    );

    await this.createFile(
      path.join(
        featurePath,
        'controllers',
        `create.${lowerFeature}.controller.ts`
      ),
      this.generateControllerContent('Create', pascalFeature)
    );

    await this.createFile(
      path.join(
        featurePath,
        'controllers',
        `get.${lowerFeature}.controller.ts`
      ),
      this.generateControllerContent('Get', pascalFeature)
    );

    await this.createFile(
      path.join(
        featurePath,
        'controllers',
        `update.${lowerFeature}.controller.ts`
      ),
      this.generateControllerContent('Update', pascalFeature)
    );

    await this.createFile(
      path.join(
        featurePath,
        'controllers',
        `delete.${lowerFeature}.controller.ts`
      ),
      this.generateControllerContent('Delete', pascalFeature)
    );

    // Factories
    await this.createFile(
      path.join(featurePath, 'factories', 'index.ts'),
      this.generateFactoriesIndexContent(lowerFeature)
    );

    await this.createFile(
      path.join(featurePath, 'factories', `create.${lowerFeature}.factory.ts`),
      this.generateFactoryContent('Create', pascalFeature, lowerFeature)
    );

    await this.createFile(
      path.join(featurePath, 'factories', `get.${lowerFeature}.factory.ts`),
      this.generateFactoryContent('Get', pascalFeature, lowerFeature)
    );

    await this.createFile(
      path.join(featurePath, 'factories', `update.${lowerFeature}.factory.ts`),
      this.generateFactoryContent('Update', pascalFeature, lowerFeature)
    );

    await this.createFile(
      path.join(featurePath, 'factories', `delete.${lowerFeature}.factory.ts`),
      this.generateFactoryContent('Delete', pascalFeature, lowerFeature)
    );

    // Schemas
    await this.createFile(
      path.join(featurePath, 'schemas', 'index.ts'),
      this.generateSchemasIndexContent(lowerFeature)
    );

    await this.createFile(
      path.join(featurePath, 'schemas', `create.${lowerFeature}.schema.ts`),
      this.generateSchemaContent('create', pascalFeature)
    );

    await this.createFile(
      path.join(featurePath, 'schemas', `update.${lowerFeature}.schema.ts`),
      this.generateSchemaContent('update', pascalFeature)
    );

    // Router
    await this.createFile(
      path.join(featurePath, 'routers', 'index.ts'),
      this.generateRouterContent(pascalFeature, lowerFeature, camelFeature)
    );

    console.log('✅ Todos os arquivos foram gerados!');
  }

  async createFile(filePath, content) {
    try {
      await fs.access(filePath);
      console.log(`⚠️  Arquivo já existe: ${path.basename(filePath)}`);
    } catch {
      await fs.writeFile(filePath, content);
      console.log(`✓ Criado: ${path.basename(filePath)}`);
    }
  }

  // Utility functions
  kebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  camelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  pascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Content generators
  generateEntityContent(pascalFeature) {
    return `export class ${pascalFeature}Entity {
  public readonly id?: number;
  public readonly name: string;
  public readonly description?: string;
  public readonly id_company: number;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;
  public readonly deleted_at?: Date | null;

  constructor(params: {
    id?: number;
    name: string;
    description?: string;
    id_company: number;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.id_company = params.id_company;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }
}
`;
  }

  generateModelContent(pascalFeature, lowerFeature) {
    return `import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';
import Company from '@domains/api/companies/model/company.model';

interface ${pascalFeature}ModelAttributes {
  id?: number;
  name: string;
  description?: string;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class ${pascalFeature}Model
  extends Model<${pascalFeature}ModelAttributes>
  implements ${pascalFeature}ModelAttributes
{
  declare id?: number;
  declare name: string;
  declare description?: string;
  declare id_company: number;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
}

${pascalFeature}Model.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    description: { 
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_company: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Company,
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: '${lowerFeature}s',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  }
);

${pascalFeature}Model.belongsTo(Company, { foreignKey: 'id_company' });

export default ${pascalFeature}Model;
`;
  }

  generateInterfacesIndexContent(lowerFeature) {
    return `export * from './default.interfaces';
export * from './create.${lowerFeature}.interface';
export * from './get.${lowerFeature}.interface';
export * from './update.${lowerFeature}.interface';
export * from './delete.${lowerFeature}.interface';
`;
  }

  generateDefaultInterfacesContent(pascalFeature) {
    return `import { ${pascalFeature}Entity } from '../entity/${this.kebabCase(pascalFeature)}.entity';
import ${pascalFeature}Model from '../model/${this.kebabCase(pascalFeature)}.model';
import { ModelStatic } from 'sequelize';

export interface Find${pascalFeature}Criteria {
  id?: number;
  name?: string;
  id_company?: number;
  limit?: number;
  offset?: number;
}

export interface Create${pascalFeature}Criteria {
  name: string;
  description?: string;
  id_company: number;
}

export interface Update${pascalFeature}Criteria {
  id: number;
  name?: string;
  description?: string;
}

export interface Delete${pascalFeature}Criteria {
  id: number;
  id_company: number;
}

export interface I${pascalFeature}Repository {
  create(criteria: Create${pascalFeature}Criteria): Promise<${pascalFeature}Entity>;
  findOne(criteria: Find${pascalFeature}Criteria): Promise<${pascalFeature}Entity | null>;
  findMany(criteria: Find${pascalFeature}Criteria): Promise<${pascalFeature}Entity[]>;
  update(criteria: Update${pascalFeature}Criteria): Promise<boolean>;
  delete(criteria: Delete${pascalFeature}Criteria): Promise<boolean>;
}

export interface ${pascalFeature}RepositoryDependencies {
  model: ModelStatic<${pascalFeature}Model>;
}
`;
  }

  generateCreateInterfaceContent(pascalFeature, lowerFeature, camelFeature) {
    return `import { IPresenter } from '@protocols/presenter';
import {
  Create${pascalFeature}Criteria,
  I${pascalFeature}Repository
} from './default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { ${pascalFeature}Entity } from '../entity/${lowerFeature}.entity';
import { Create${pascalFeature}Gateway } from '../gateways/create.${lowerFeature}.gateway';
import { Create${pascalFeature}Interactor } from '../usecases';
import { UserCompanyValidationInteractor } from '@domains/common';

export type InputCreate${pascalFeature} = {
  name: string;
  description?: string;
  id_company: number;
  id_user: number;
};

export type Create${pascalFeature}InteractorDependencies = {
  gateway: Create${pascalFeature}Gateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type Create${pascalFeature}ControllerDependencies = {
  interactor: Create${pascalFeature}Interactor;
};

export type Create${pascalFeature}GatewayDependencies = {
  logging: DataLogOutput;
  ${camelFeature}Repository: I${pascalFeature}Repository;
};
`;
  }

  generateGetInterfaceContent(pascalFeature, lowerFeature, camelFeature) {
    return `import { IPresenter } from '@protocols/presenter';
import {
  Find${pascalFeature}Criteria,
  I${pascalFeature}Repository
} from './default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { Get${pascalFeature}Gateway } from '../gateways/get.${lowerFeature}.gateway';
import { Get${pascalFeature}Interactor } from '../usecases';
import { UserCompanyValidationInteractor } from '@domains/common';

export type InputGet${pascalFeature} = {
  id?: number;
  id_company: number;
  id_user: number;
  limit?: number;
  offset?: number;
};

export type Get${pascalFeature}InteractorDependencies = {
  gateway: Get${pascalFeature}Gateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type Get${pascalFeature}ControllerDependencies = {
  interactor: Get${pascalFeature}Interactor;
};

export type Get${pascalFeature}GatewayDependencies = {
  logging: DataLogOutput;
  ${camelFeature}Repository: I${pascalFeature}Repository;
};
`;
  }

  generateUpdateInterfaceContent(pascalFeature, lowerFeature, camelFeature) {
    return `import { IPresenter } from '@protocols/presenter';
import {
  Update${pascalFeature}Criteria,
  I${pascalFeature}Repository
} from './default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { Update${pascalFeature}Gateway } from '../gateways/update.${lowerFeature}.gateway';
import { Update${pascalFeature}Interactor } from '../usecases';
import { UserCompanyValidationInteractor } from '@domains/common';

export type InputUpdate${pascalFeature} = {
  id: number;
  name?: string;
  description?: string;
  id_company: number;
  id_user: number;
};

export type Update${pascalFeature}InteractorDependencies = {
  gateway: Update${pascalFeature}Gateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type Update${pascalFeature}ControllerDependencies = {
  interactor: Update${pascalFeature}Interactor;
};

export type Update${pascalFeature}GatewayDependencies = {
  logging: DataLogOutput;
  ${camelFeature}Repository: I${pascalFeature}Repository;
};
`;
  }

  generateDeleteInterfaceContent(pascalFeature, lowerFeature, camelFeature) {
    return `import { IPresenter } from '@protocols/presenter';
import {
  Delete${pascalFeature}Criteria,
  I${pascalFeature}Repository
} from './default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { Delete${pascalFeature}Gateway } from '../gateways/delete.${lowerFeature}.gateway';
import { Delete${pascalFeature}Interactor } from '../usecases';
import { UserCompanyValidationInteractor } from '@domains/common';

export type InputDelete${pascalFeature} = {
  id: number;
  id_company: number;
  id_user: number;
};

export type Delete${pascalFeature}InteractorDependencies = {
  gateway: Delete${pascalFeature}Gateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type Delete${pascalFeature}ControllerDependencies = {
  interactor: Delete${pascalFeature}Interactor;
};

export type Delete${pascalFeature}GatewayDependencies = {
  logging: DataLogOutput;
  ${camelFeature}Repository: I${pascalFeature}Repository;
};
`;
  }

  generateRepositoryContent(pascalFeature, lowerFeature) {
    return `import ${pascalFeature}Model from '@domains/api/${lowerFeature}s/model/${lowerFeature}.model';
import { ${pascalFeature}Entity } from '@domains/api/${lowerFeature}s/entity/${lowerFeature}.entity';
import { ModelStatic } from 'sequelize';
import {
  Create${pascalFeature}Criteria,
  Delete${pascalFeature}Criteria,
  Find${pascalFeature}Criteria,
  I${pascalFeature}Repository,
  Update${pascalFeature}Criteria,
  ${pascalFeature}RepositoryDependencies
} from '@domains/api/${lowerFeature}s/interfaces';

export class ${pascalFeature}Repository implements I${pascalFeature}Repository {
  protected model: ModelStatic<${pascalFeature}Model>;

  constructor(params: ${pascalFeature}RepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(criteria: Find${pascalFeature}Criteria): Record<string, any> {
    const whereConditions: Record<string, any> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.name) {
      whereConditions['name'] = criteria.name;
    }

    if (criteria.id_company) {
      whereConditions['id_company'] = criteria.id_company;
    }

    return whereConditions;
  }

  async create(criteria: Create${pascalFeature}Criteria): Promise<${pascalFeature}Entity> {
    const created = await this.model.create({
      name: criteria.name,
      description: criteria.description,
      id_company: criteria.id_company
    });

    return new ${pascalFeature}Entity({
      id: created.id,
      name: created.name,
      description: created.description,
      id_company: created.id_company,
      created_at: created.created_at,
      updated_at: created.updated_at,
      deleted_at: created.deleted_at
    });
  }

  async findOne(criteria: Find${pascalFeature}Criteria): Promise<${pascalFeature}Entity | null> {
    const whereConditions = this.getConditions(criteria);
    
    const found = await this.model.findOne({
      where: whereConditions
    });

    if (!found) return null;

    return new ${pascalFeature}Entity({
      id: found.id,
      name: found.name,
      description: found.description,
      id_company: found.id_company,
      created_at: found.created_at,
      updated_at: found.updated_at,
      deleted_at: found.deleted_at
    });
  }

  async findMany(criteria: Find${pascalFeature}Criteria): Promise<${pascalFeature}Entity[]> {
    const whereConditions = this.getConditions(criteria);
    
    const found = await this.model.findAll({
      where: whereConditions,
      limit: criteria.limit,
      offset: criteria.offset
    });

    return found.map(item => new ${pascalFeature}Entity({
      id: item.id,
      name: item.name,
      description: item.description,
      id_company: item.id_company,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at
    }));
  }

  async update(criteria: Update${pascalFeature}Criteria): Promise<boolean> {
    const updateData = {};
    
    if (criteria.name !== undefined) updateData.name = criteria.name;
    if (criteria.description !== undefined) updateData.description = criteria.description;

    const [affectedRows] = await this.model.update(updateData, {
      where: { id: criteria.id }
    });

    return affectedRows > 0;
  }

  async delete(criteria: Delete${pascalFeature}Criteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: {
        id: criteria.id,
        id_company: criteria.id_company
      }
    });

    return affectedRows > 0;
  }
}
`;
  }

  generateGatewayContent(operation, pascalFeature) {
    return `import { DataLogOutput } from '@adapters/services';
import { ${operation}${pascalFeature}GatewayDependencies } from '../interfaces';
import { I${pascalFeature}Repository } from '../interfaces';

export class ${operation}${pascalFeature}Gateway {
  protected logging: DataLogOutput;
  protected ${this.camelCase(pascalFeature)}Repository: I${pascalFeature}Repository;

  constructor(params: ${operation}${pascalFeature}GatewayDependencies) {
    this.logging = params.logging;
    this.${this.camelCase(pascalFeature)}Repository = params.${this.camelCase(pascalFeature)}Repository;
  }

  loggerInfo(message: string, data?: any): void {
    this.logging.logInfo(message, data);
  }

  loggerError(message: string, error?: any): void {
    this.logging.logError(message, error);
  }

  // TODO: Implementar métodos específicos do gateway
}
`;
  }

  generateInteractorContent(operation, pascalFeature, lowerFeature) {
    return `import { HttpResponse } from '@protocols/http';
import {
  ${operation}${pascalFeature}InteractorDependencies,
  Input${operation}${pascalFeature}
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { ${operation}${pascalFeature}Gateway } from '../gateways/${operation.toLowerCase()}.${lowerFeature}.gateway';
import { UserCompanyValidationInteractor } from '@domains/common';

export class ${operation}${pascalFeature}Interactor {
  protected gateway: ${operation}${pascalFeature}Gateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: ${operation}${pascalFeature}InteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: Input${operation}${pascalFeature}): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando ${operation.toLowerCase()} ${lowerFeature}', input);

      const validation = await this.userCompanyValidator.execute({
        id_user: input.id_user,
        id_company: input.id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerInfo('Usuário ou empresa inválidos', {
          id_user: input.id_user,
          id_company: input.id_company
        });
        return this.presenter.clientError('Usuário ou empresa inválidos');
      }

      // TODO: Implementar lógica de negócio do ${operation.toLowerCase()}
      
      this.gateway.loggerInfo('${operation} ${lowerFeature} executado com sucesso');
      return this.presenter.ok({ message: '${operation} ${lowerFeature} executado com sucesso' });
    } catch (error) {
      this.gateway.loggerError('Erro ao executar ${operation.toLowerCase()} ${lowerFeature}', error);
      return this.presenter.serverError(error);
    }
  }
}
`;
  }

  generateControllerContent(operation, pascalFeature) {
    return `import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  ${operation}${pascalFeature}ControllerDependencies,
  Input${operation}${pascalFeature}
} from '../interfaces';
import { ${operation}${pascalFeature}Interactor } from '../usecases';
import { Response } from 'express';

export class ${operation}${pascalFeature}Controller {
  protected interactor: ${operation}${pascalFeature}Interactor;

  constructor(params: ${operation}${pascalFeature}ControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async ${operation.toLowerCase()}${pascalFeature}(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: Input${operation}${pascalFeature} = {
      ...request.body,
      ...request.params,
      ...request.query,
      id_company: request.user.id_company,
      id_user: request.user.id
    };
    
    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
`;
  }

  generateFactoryContent(operation, pascalFeature, lowerFeature) {
    return `import { logger } from '@configs/logger';
import { ${operation}${pascalFeature}Gateway } from '../gateways/${operation.toLowerCase()}.${lowerFeature}.gateway';
import ${pascalFeature}Model from '../model/${lowerFeature}.model';
import { ${pascalFeature}Repository } from '../repository/${lowerFeature}.repository';
import { ${operation}${pascalFeature}Interactor } from '../usecases';
import { Presenter } from '@protocols/presenter';
import { ${operation}${pascalFeature}Controller } from '../controllers/';
import { userCompanyValidatiorInteractor } from '@domains/common/validations/factories';

const ${this.camelCase(pascalFeature)}Repository = new ${pascalFeature}Repository({
  model: ${pascalFeature}Model
});

const params = {
  logging: logger,
  ${this.camelCase(pascalFeature)}Repository
};

const ${operation.toLowerCase()}${pascalFeature}Gateway = new ${operation}${pascalFeature}Gateway(params);

const interactor = new ${operation}${pascalFeature}Interactor({
  gateway: ${operation.toLowerCase()}${pascalFeature}Gateway,
  presenter: new Presenter(),
  userCompanyValidator: userCompanyValidatiorInteractor
});

export const ${operation.toLowerCase()}${pascalFeature}Controller = new ${operation}${pascalFeature}Controller({
  interactor
});
`;
  }

  generateUseCasesIndexContent(lowerFeature) {
    return `export * from './create.${lowerFeature}.interactor';
export * from './get.${lowerFeature}.interactor';
export * from './update.${lowerFeature}.interactor';
export * from './delete.${lowerFeature}.interactor';
`;
  }

  generateControllersIndexContent(lowerFeature) {
    return `export * from './create.${lowerFeature}.controller';
export * from './get.${lowerFeature}.controller';
export * from './update.${lowerFeature}.controller';
export * from './delete.${lowerFeature}.controller';
`;
  }

  generateFactoriesIndexContent(lowerFeature) {
    return `export * from './create.${lowerFeature}.factory';
export * from './get.${lowerFeature}.factory';
export * from './update.${lowerFeature}.factory';
export * from './delete.${lowerFeature}.factory';
`;
  }

  generateSchemasIndexContent(lowerFeature) {
    return `export * from './create.${lowerFeature}.schema';
export * from './update.${lowerFeature}.schema';
`;
  }

  generateSchemaContent(operation, pascalFeature) {
    return `import { z } from 'zod';

export const ${operation}${pascalFeature}Schema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional()
  })
});

export type ${operation.charAt(0).toUpperCase() + operation.slice(1)}${pascalFeature}Schema = z.infer<typeof ${operation}${pascalFeature}Schema>;
`;
  }

  generateRouterContent(pascalFeature, lowerFeature, camelFeature) {
    return `import { Response, Router } from 'express';
import * as factories from '@domains/api/${lowerFeature}s/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { create${pascalFeature}Schema, update${pascalFeature}Schema } from '../schemas';

const {
  create${pascalFeature}Controller,
  get${pascalFeature}Controller,
  update${pascalFeature}Controller,
  delete${pascalFeature}Controller
} = factories;

const router = Router();

router.post(
  '/',
  authMiddleware,
  validateSchema(create${pascalFeature}Schema),
  (request: UserPayload, response: Response) =>
    create${pascalFeature}Controller.create${pascalFeature}(request, response)
);

router.get('/', authMiddleware, (request: UserPayload, response: Response) =>
  get${pascalFeature}Controller.get${pascalFeature}(request, response)
);

router.put(
  '/:id',
  authMiddleware,
  validateSchema(update${pascalFeature}Schema),
  (request: UserPayload, response: Response) =>
    update${pascalFeature}Controller.update${pascalFeature}(request, response)
);

router.delete('/:id', authMiddleware, (request: UserPayload, response: Response) =>
  delete${pascalFeature}Controller.delete${pascalFeature}(request, response)
);

export { router as ${camelFeature}Router };
`;
  }
}

// Executar o gerador se for chamado diretamente
if (require.main === module) {
  const generator = new ScaffoldGenerator();
  generator.run();
}

module.exports = ScaffoldGenerator;
