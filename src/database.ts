import {Pool} from 'pg';
import {config, mongoConfig} from './config/config';
import {MongoClient, Collection} from 'mongodb';

export const pool = new Pool(config);


class Mongo {
    conected = false;
    public dbrun: Collection;
    constructor (
        readonly client = new MongoClient(mongoConfig.uri)){
            ( async () => await this.init())();
        };
    async init() {
        await this.client.connect();
        this.conected = true;
        const db = this.client.db(mongoConfig.dbName);
        this.dbrun = db.collection(mongoConfig.tableName);
    };

};

export const mongo = new Mongo();
