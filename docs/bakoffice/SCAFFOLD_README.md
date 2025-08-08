# Scaffold Generator para Clean Architecture

Este script gera automaticamente a estrutura de arquivos e pastas para um novo fluxo (feature) seguindo a Clean Architecture do projeto.

## Como usar

### Executar o script

```bash
node scaffold.js
```

### O que o script solicita:

1. **Nome da feature** (ex: Task, Project, etc.)
2. **Domínio**: Se deseja usar um domínio existente ou criar um novo
3. **Seleção do domínio**: Se escolher usar existente, mostra uma lista numerada

### Exemplo de uso:

```bash
$ node scaffold.js

🚀 Gerador de Scaffold para Clean Architecture

Nome da feature (ex: Task, Project): Task
Usar domínio existente? (s/N): s
Domínios existentes:
1. api
2. common
3. webhooks
Escolha o número do domínio: 1

📁 Criando estrutura para Task em api...
✓ Criada pasta: controllers
✓ Criada pasta: entity
✓ Criada pasta: factories
✓ Criada pasta: gateways
✓ Criada pasta: interfaces
✓ Criada pasta: model
✓ Criada pasta: repository
✓ Criada pasta: routers
✓ Criada pasta: schemas
✓ Criada pasta: usecases

📄 Gerando arquivos...
✓ Criado: task.entity.ts
✓ Criado: task.model.ts
✓ Criado: index.ts
✓ Criado: default.interfaces.ts
...
✅ Todos os arquivos foram gerados!
✅ Scaffold gerado com sucesso!
```

## Estrutura gerada

O script cria a seguinte estrutura para cada feature:

```
src/domains/api/{feature-name}/
├── controllers/
│   ├── index.ts
│   ├── create.{feature}.controller.ts
│   ├── get.{feature}.controller.ts
│   ├── update.{feature}.controller.ts
│   └── delete.{feature}.controller.ts
├── entity/
│   └── {feature}.entity.ts
├── factories/
│   ├── index.ts
│   ├── create.{feature}.factory.ts
│   ├── get.{feature}.factory.ts
│   ├── update.{feature}.factory.ts
│   └── delete.{feature}.factory.ts
├── gateways/
│   ├── create.{feature}.gateway.ts
│   ├── get.{feature}.gateway.ts
│   ├── update.{feature}.gateway.ts
│   └── delete.{feature}.gateway.ts
├── interfaces/
│   ├── index.ts
│   ├── default.interfaces.ts
│   ├── create.{feature}.interface.ts
│   ├── get.{feature}.interface.ts
│   ├── update.{feature}.interface.ts
│   └── delete.{feature}.interface.ts
├── model/
│   └── {feature}.model.ts
├── repository/
│   └── {feature}.repository.ts
├── routers/
│   └── index.ts
├── schemas/
│   ├── index.ts
│   ├── create.{feature}.schema.ts
│   └── update.{feature}.schema.ts
└── usecases/
    ├── index.ts
    ├── create.{feature}.interactor.ts
    ├── get.{feature}.interactor.ts
    ├── update.{feature}.interactor.ts
    └── delete.{feature}.interactor.ts
```

## Arquivos gerados

Cada arquivo é criado com:

- **Classes/interfaces correspondentes** ao nome do arquivo
- **Conteúdo inicial** com declaração da classe/interface, nome correto e construtor (se aplicável)
- **Importações necessárias** para compilar (mesmo que sejam placeholders)
- **Estrutura seguindo** o padrão dos fluxos existentes no domínio

### Camadas da Clean Architecture:

- **Controller**: Coordena a entrada e chama o usecase
- **UseCase (Interactor)**: Contém a regra de negócio principal
- **Gateways**: Comunicação com integrações externas
- **Repository**: Acesso a banco de dados
- **Model**: Estrutura de dados de persistência
- **Entity**: Regras da entidade de domínio
- **Interfaces**: Contratos para dependências
- **Factory**: Instanciação e injeção de dependências
- **Router**: Define rotas da feature
- **Schemas**: Validação de dados com Zod

## Características

- ✅ **Reutilizável**: Não é específico para um fluxo
- ✅ **Seguro**: Não sobrescreve arquivos existentes
- ✅ **Validação**: Verifica se diretórios existem antes de criar
- ✅ **Padrão consistente**: Segue a arquitetura dos fluxos existentes
- ✅ **Nomenclatura automática**: Converte nomes em kebab-case, camelCase e PascalCase conforme necessário

## TODOs após gerar

Após executar o scaffold, você precisará:

1. **Implementar a lógica de negócio** nos Interactors
2. **Completar os métodos** dos Gateways
3. **Ajustar as interfaces** conforme suas necessidades específicas
4. **Configurar o roteamento** no arquivo principal da aplicação
5. **Criar migrations** do banco de dados se necessário
6. **Implementar testes** unitários para as camadas

## Exemplo de personalização

```typescript
// No Interactor, substituir o TODO:
async execute(input: InputCreateTask): Promise<HttpResponse> {
  // Validações...

  // Lógica específica do negócio
  const task = await this.gateway.taskRepository.create({
    name: input.name,
    description: input.description,
    id_company: input.id_company
  });

  return this.presenter.ok(task);
}
```
