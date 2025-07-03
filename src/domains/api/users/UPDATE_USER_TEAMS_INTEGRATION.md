# Atualização do Update User - Integração com User Teams

## Alterações Realizadas

### 1. Interface `InputUpdateUser`

Adicionado campo opcional `teamId` para permitir adicionar usuário a um time durante a atualização:

```typescript
export type InputUpdateUser = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  teamId?: number; // ✅ NOVO CAMPO
  id_company: number;
  id_user: number;
};
```

### 2. Interface `IUpdateUserGateway`

Adicionados métodos para trabalhar com user-teams:

```typescript
export interface IUpdateUserGateway {
  // ... métodos existentes

  // ✅ NOVOS MÉTODOS
  findTeam(criteria: {
    id?: number;
    id_company?: number;
  }): Promise<TeamEntity | undefined>;
  findUserTeam(criteria: {
    id_user?: number;
    id_team?: number;
    left_at?: Date | undefined;
  }): Promise<UserTeamEntity | undefined>;
  createUserTeam(criteria: {
    id_user: number;
    id_team: number;
    role_in_team?: string;
    joined_at?: Date;
  }): Promise<UserTeamEntity>;
}
```

### 3. Dependencies `IUpdateUserGatewayDependencies`

Adicionados repositórios necessários:

```typescript
export interface IUpdateUserGatewayDependencies {
  userRepository: IUserRepository;
  userTeamRepository: IUserTeamRepository; // ✅ NOVO
  teamRepository: ITeamRepository; // ✅ NOVO
  logging: typeof logger;
}
```

### 4. Gateway `UpdateUserGateway`

Implementados os novos métodos:

```typescript
// Métodos para user-teams
async findTeam(criteria: { id?: number; id_company?: number }): Promise<TeamEntity | undefined>
async findUserTeam(criteria: { id_user?: number; id_team?: number; left_at?: Date | undefined }): Promise<UserTeamEntity | undefined>
async createUserTeam(criteria: { id_user: number; id_team: number; role_in_team?: string; joined_at?: Date }): Promise<UserTeamEntity>
```

### 5. Interactor `UpdateUserInteractor`

Adicionada lógica para processar o `teamId`:

- ✅ Valida se o time existe na mesma empresa
- ✅ Verifica se o usuário já está no time
- ✅ Cria relacionamento user-team se necessário
- ✅ Não falha a operação de update do usuário por causa do time
- ✅ Inclui informações do time na resposta

### 6. Factory `makeUpdateUserController`

Adicionadas as dependências necessárias:

```typescript
const userTeamRepository = new UserTeamRepository({ model: UserTeamModel });
const teamRepository = new TeamRepository({ model: TeamModel });

const gateway = new UpdateUserGateway({
  userRepository,
  userTeamRepository, // ✅ NOVO
  teamRepository, // ✅ NOVO
  logging: logger
});
```

### 7. Schema `updateUserSchema`

Adicionado campo `teamId` com validação:

```typescript
teamId: z.union([z.string(), z.number()])
  .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
  .refine(
    (val) => !isNaN(val) && val > 0,
    'TeamId deve ser um número válido maior que 0'
  )
  .optional();
```

## Como Usar

### Request de Update com TeamId

```bash
PUT /api/users/123
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "João Silva",
  "email": "joao.silva@empresa.com",
  "role": "user",
  "teamId": 456
}
```

### Response de Sucesso com Team Assignment

```json
{
  "message": "Usuário atualizado com sucesso",
  "user": {
    "id": 123,
    "name": "João Silva",
    "email": "joao.silva@empresa.com",
    "role": "user",
    "status": "active",
    "id_company": 1
  },
  "team_assignment": {
    "message": "Usuário adicionado ao time",
    "user_team_id": 789,
    "team_id": 456
  }
}
```

### Response Quando Usuário Já Está no Time

```json
{
  "message": "Usuário atualizado com sucesso",
  "user": {
    "id": 123,
    "name": "João Silva",
    "email": "joao.silva@empresa.com",
    "role": "user",
    "status": "active",
    "id_company": 1
  }
}
```

## Validações Implementadas

1. **Time deve existir na mesma empresa**: Previne adicionar usuário a times de outras empresas
2. **Verificação de duplicata**: Não permite adicionar usuário que já está no time
3. **Fallback gracioso**: Erro no time não impede update do usuário
4. **Role padrão**: Usuário é adicionado como 'member' por padrão

## Logs Implementados

- ✅ Log de início da operação com teamId
- ✅ Log quando time não é encontrado
- ✅ Log quando usuário já está no time
- ✅ Log de sucesso da adição ao time
- ✅ Log de erro na operação de time

## Benefícios

- **Operação atômica**: Update do usuário e adição ao time em uma única chamada
- **Fallback seguro**: Se houver erro no time, o update do usuário ainda funciona
- **Validações robustas**: Múltiplas camadas de validação para garantir integridade
- **Logs detalhados**: Rastreabilidade completa das operações
- **Response informativo**: Cliente sabe se o usuário foi adicionado ao time
