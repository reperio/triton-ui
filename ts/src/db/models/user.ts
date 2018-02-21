import {v4} from 'uuid';

import {BaseModel} from './baseModel';

export class User extends BaseModel {
    public id: string; 
    public username: string;
    public password: string;
    public firstName: string;
    public lastName: string;
    
    static get tableName() {
        return 'users';
    }

    $beforeInsert(context: any) {
        const parent = super.$beforeInsert(context);

        return Promise.resolve(parent)
            .then(() => {
                this.id = v4();
            });
    }

    static get jsonSchema() {
        return {
            type: 'Object',
            properties: {
                id: {type: 'string'},
                username: {type: 'string'},
                password: {type: 'string'},
                firstName: {type: 'string'},
                lastName: {type: 'string'},
                createdAt: {type: 'string'},
                updatedAt: {type: 'string'}
            }
        };
    }
}