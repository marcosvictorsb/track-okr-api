// import { Sequelize, Transaction } from 'sequelize';

// export interface ITransactionMixin {
//   startTransaction(): Promise<Transaction>;
//   commitTransaction(transaction: Transaction): Promise<void>;
//   rollbackTransaction(transaction: Transaction): Promise<void>;
// }

// export function TransactionMixin<T extends new (...args: any[]) => {}>(
//   Base: T
// ) {
//   return class extends Base {
//     private sequelize: Sequelize;

//     constructor(...args: any[]) {
//       super(...args);
//       const params = args[0];
//       this.sequelize = params.sequelize;
//     }

//     async startTransaction(): Promise<Transaction> {
//       return await this.sequelize.transaction();
//     }

//     async commitTransaction(transaction: Transaction): Promise<void> {
//       return await transaction.commit();
//     }

//     async rollbackTransaction(transaction: Transaction): Promise<void> {
//       return await transaction.rollback();
//     }
//   };
// }
