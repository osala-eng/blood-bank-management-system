import {Pool} from 'pg';
import {config, mongoConfig} from './config/config';
import {MongoClient, Document, Collection} from 'mongodb';

export const pool = new Pool(config);


class Mongo {
    public collection: Collection<Document>;
    conected = false;
    constructor (
        readonly client = new MongoClient(mongoConfig.uri)){
            this.init();
        };
    async init() {
        await this.client.connect();
        this.conected = true;
        const db = this.client.db(mongoConfig.dbName);
        this.collection = db.collection(mongoConfig.tableName);
    };

};

export const mongo = new Mongo();
