import { PoolConfig } from 'pg';

export const config: PoolConfig = {
    host: 'SG-SharedPostgres-3990-pgsql-master.servers.mongodirector.com',
    user: 'u3dc2a9a52d009c4909cd048d85d2c701',
    password: 'fb8d0457c313',
    database: 'cfa259bd41e124729f7dd8edd5bb5c76' };


export const mongoConfig = {
    uri: `mongodb://u3dc2a9a52d009c4909cd048d85d2c701:fb8d0457c313@SG-SharedMongo-54216.servers.mongodirector.com:27017/cfa259bd41e124729f7dd8edd5bb5c76`,
    dbName: `cfa259bd41e124729f7dd8edd5bb5c76`,
    tableName: `bloodbankmanagementsystem_mongo_user_jashon` };

export const DateUrl = 'https://components.skillreactor.io/BloodBankManagementSystem/jashon/system/expiry';
export const InfoUrl = `https://components.skillreactor.io/BloodBankManagementSystem/jashon/system/person/info`;
export const CleanUrl = ` https://components.skillreactor.io/BloodBankManagementSystem/jashon/system/clean-blood`;
