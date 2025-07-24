# Como Resolver o Problema dos DataValues do Sequelize

## Problema Identificado

Quando você faz `console.log(user)` com um modelo do Sequelize, ele retorna algo assim:

```javascript
BackofficeUserModel {
  dataValues: { /* dados reais aqui */ },
  _previousDataValues: { /* ... */ },
  uniqno: 1,
  _changed: Set(0) {},
  _options: { /* ... */ },
  isNewRecord: false,
  id: undefined,
  name: undefined,
  // ... todos os campos como undefined
}
```

## Soluções Implementadas

### 1. **Entity Pattern (Recomendado)**

Criamos uma `BackofficeUserEntity` e um `BackofficeUserEntityMapper`:

```typescript
// Usar no repository
const user = await repository.findByIdAsEntity(1);
console.log(user); // Objeto limpo com apenas os dados

// Ou converter manualmente
const userModel = await repository.findById(1);
const userEntity = BackofficeUserEntityMapper.toEntity(userModel);
```

### 2. **Métodos Melhorados no Model**

Adicionamos métodos no modelo para retornar dados limpos:

```typescript
const user = await BackofficeUserModel.findByPk(1);

// Opções disponíveis:
console.log(user.dataValues); // Dados brutos
console.log(user.toJSON()); // Remove metadados
console.log(user.toSafeObject()); // Remove senha e tokens
console.log(user.toPlainObject()); // Apenas dataValues
console.log(user.toPublicObject()); // Dados públicos apenas
```

## Como Usar na Prática

### No Controller (Método Antigo - Problemático)

```typescript
const user = await repository.findById(1);
res.json({ user }); // ❌ Retorna instância completa do Sequelize
```

### No Controller (Método Novo - Correto)

```typescript
// Opção 1: Usar entity (recomendado)
const user = await repository.findByIdAsEntity(1);
res.json({ user }); // ✅ Retorna objeto limpo

// Opção 2: Usar métodos do modelo
const userModel = await repository.findById(1);
res.json({ user: userModel.toSafeObject() }); // ✅ Retorna objeto limpo

// Opção 3: Converter com mapper
const userModel = await repository.findById(1);
const user = BackofficeUserEntityMapper.toPublicEntity(userModel);
res.json({ user }); // ✅ Retorna objeto limpo
```

### No UseCase

```typescript
// Para retornar ao cliente
const user = await this.repository.findByIdAsEntity(userId);
return { success: true, data: user };

// Para uso interno (quando precisa dos métodos do Sequelize)
const userModel = await this.repository.findById(userId);
await userModel.validatePassword(password);
```

## Benefícios das Entities

1. **Dados Limpos**: Sem metadados do Sequelize
2. **Tipagem Forte**: TypeScript completo
3. **Segurança**: Entidades públicas removem dados sensíveis
4. **Consistência**: Sempre o mesmo formato
5. **Performance**: Objetos mais leves para serialização

## Métodos Disponíveis

### Repository

- `findByIdAsEntity()` - Retorna entity
- `findByEmailAsEntity()` - Retorna entity
- `findAllAsEntities()` - Retorna array de entities
- `createAndReturnEntity()` - Cria e retorna entity

### Entity Mapper

- `toEntity()` - Converte para entity completa
- `toPublicEntity()` - Converte para entity pública
- `toEntityArray()` - Converte array
- `hasPermission()` - Verifica permissões
- `canAccess()` - Verifica acesso a recursos

### Model

- `toSafeObject()` - Remove dados sensíveis
- `toPlainObject()` - Apenas dataValues
- `toPublicObject()` - Dados públicos apenas
- `validatePassword()` - Verifica senha

## Recomendação de Uso

1. **Para APIs públicas**: Use `BackofficeUserEntityMapper.toPublicEntity()`
2. **Para uso interno**: Use `BackofficeUserEntityMapper.toEntity()`
3. **Para operações do Sequelize**: Use o model diretamente
4. **Para logs/debug**: Use `model.toSafeObject()`

Dessa forma você resolve o problema dos `dataValues` e ainda ganha tipagem forte e dados mais seguros!
