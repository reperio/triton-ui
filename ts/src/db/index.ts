import * as Knex from 'knex';
import {Model} from 'objection';
import Winston, {LoggerInstance} from 'winston';

import * as KnexConfig from './knexfile';

export class UnitOfWork {
    private _knex: Knex;
    private _logger: LoggerInstance;
    public _transaction: Knex.Transaction;

    constructor(logger: LoggerInstance) {
        this._logger = logger;
        const env = process.env.NODE_ENV || 'development';

        this._logger.info(`Loading ${env} database`);
        const dbConfig: any = KnexConfig;
        this._knex = Knex(dbConfig[env]);

        // automatic debug logging for queries
        this._knex.on('query', (query: Knex.QueryBuilder) => this._logger.debug(query.toSQL().sql));

        // automatic logging and rollback of transactions when queries throw errors
        this._knex.on('query-error', (err: Error) => {
            if (this.inTransaction) {
                this.rollbackTransaction();
            }
            this._logger.error(JSON.stringify(err));
        });

        this._logger.info(`${env} database loaded successfully`);
    }

    // transaction helpers
    async beginTransaction() {
        if (this._transaction !== null) {
            throw new Error('Cannot begin transaction, a transaction already exists for this unit of work');
        }
        
        await new Promise(resolve => {
            this._knex.transaction(trx => {
                this._transaction = trx;
                resolve();
            });
        });
    }

    async commitTransaction() {
        if (this._transaction === null) {
            throw new Error('Cannot commit transaction, a transaction does not exist for this unit of work');
        }
        await this._transaction.commit();
        this._transaction = null;
    }

    async rollbackTransaction() {
        if (this._transaction === null) {
            throw new Error('Cannot rollback transaction, a transaction does not exist for this unit of work');
        }
        await this._transaction.rollback();
        this._transaction = null;
    }

    get inTransaction() {
        return this._transaction !== null;
    }
}