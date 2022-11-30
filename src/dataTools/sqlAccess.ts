import { BloodGroups, BloodRecord, BloodRecords,
     BloodTypes, CacheSql, DonateReq, Info, InsertSql,
     MongoBloodRecord, MongoGroups, NULL, UpdateSql, VERIFY }
     from '../types/types';
import { pool, mongo } from '../database';
import { ObjectID } from 'bson';
import { DeleteResult } from 'mongodb';
import { randomInt} from 'crypto';
import { DateUrl } from '../config/config';
import fetch from 'node-fetch';

/**
 * Creates sql query strins
 */
export class SqlStringer{
    sql :string;
    private keys: string[];

    /**
     * Creates a query update string for postgres sql
     * @param data query data object
     */
    getUpdateString(data: UpdateSql){
        this.keys = Object.keys(data);
        this.sql = 'update bloodbankmanagementsystem_sql_user_jashon set ';
        const index = (this.keys.indexOf('id'));
        index !== -1 && this.keys.splice(0,1);
        const lim = 2;
        this.keys.forEach((key, i) => {
            if (i === this.keys.length - 1){
                this.sql += `${key} = $${i + lim} `;
            }
            else {
                this.sql += `${key} = $${i + lim}, `;
            }
        });
        this.sql += 'where id = $1';
    }
};

/**
 * Class to abstract database access from the server
 */
export class SqlAccess extends SqlStringer{
    private readonly dataValues: Array<string | number > = [];

    /**
     * constructor for class to abstract db access
     * @param updateData Object of type interface UpdateSql
     */
    constructor( private readonly updateData?: UpdateSql ){
        super();
    };

    /**
     * Method to run sql update query operation
     */
    async updateQuery (): Promise<void>{
        this.getUpdateString(this.updateData);
        Object.values(this.updateData).forEach(ele => {
            this.dataValues.push(ele);
        });
        await pool.query(this.sql, this.dataValues);
    };

    /**
     * Check if id provided has a record
     * @param id key number
     * @returns boolean
     */
    async recordExist(id: number): Promise<boolean> {
        const sql =
            `select * from bloodbankmanagementsystem_sql_user_jashon where id = $1`;
        const res = await pool.query(sql, [id]);
        return res.rowCount > NULL;
    };

    /**
     * Delete record from the table give id
     * @param id number
     */
    async deleteRecord(id: number): Promise<void> {
        const proced = await this.recordExist(id);
        if(!proced){
            throw new Error (`Record with ${id} does not exist`);
        }
        const sql =
            `delete from bloodbankmanagementsystem_sql_user_jashon where id = $1`;
        await pool.query(sql, [id]);
    };

    /**
     * Insert record into the table
     * @param data table data format
     */
    insertRecord = async (data: InsertSql & UpdateSql): Promise<void> => {
        const recs: Array<string| Date | number> = [data.id];
        recs.push(data.hospital, data.blood_type, data.location, data.donator);
        const sql =
            `insert into bloodbankmanagementsystem_sql_user_jashon
            (id, hospital, blood_type, location, donator, date, expiry)
            values ($1, $2, $3, $4, $5, $6, $7)`;
        if(data.date && data.expiry){
            recs.push(data.date, data.expiry);
        }
        else
        {
            const month = 6;
            const [date , expiry] = [new Date(), new Date()];
            expiry.setMonth(expiry.getMonth() + month);
            recs.push(date, expiry);
        }
        await pool.query(sql, recs);
    };

    /**
     * Query records filtered by time
     * @param time time format
     * @returns promise Blood records
     */
    querybyTime = async (time: Date): Promise<BloodRecords> => {
        const sql = `
            select * from bloodbankmanagementsystem_sql_user_jashon
            where date >= $1`;
        return (await pool.query(sql, [time])).rows as BloodRecords;
    };

    /**
     * Retrieve records of a given blood type
     * @param type blood type
     * @returns Promise records
     */
    querybyBloodType = async (type: string): Promise<BloodRecords> => {
        const sql =`
        select * from bloodbankmanagementsystem_sql_user_jashon
        where blood_type = $1`;
        return (await pool.query(sql, [type])).rows as BloodRecords;
    };

    /**
     * Delete records that have expired filtered by date
     * @param expiry Date in ISO formart
     */
    async deleteExpired(expiry: Date): Promise<void> {
        const sql =
            `delete from bloodbankmanagementsystem_sql_user_jashon
            where expiry <= $1`;
        await pool.query(sql, [expiry]);
    };

    /**
     * Create a record cache to mongo db
     * @param request request blood type and location
     * @returns promise Object Id
     */
    async cacheRecord (request: CacheSql): Promise<ObjectID>{
        const sql =`
            select * from bloodbankmanagementsystem_sql_user_jashon where
            location = $1 and blood_type = $2 and expiry = (select min(expiry)
            from bloodbankmanagementsystem_sql_user_jashon where location = $1
            and blood_type = $2)`;
        const data = await pool.query(sql, [request.location,
            request.type]);
        if(!data.rowCount){
            /* istanbul ignore next */
            throw new Error('No records found');
        }
        const row = data.rows[0] as BloodRecord;
        const id = row.id;
        delete(row.id);
        const mongoRes = await mongo.dbrun.insertOne(row);
        await this.deleteRecord(id);
        return mongoRes.insertedId;
    };

    /**
     * Retrieve a cached emergency
     * @param id 24 digit Object Id string
     * @returns Promise Mongo record
     */
    mongofindById = async (id: string): Promise<MongoBloodRecord> =>{
         const res : MongoBloodRecord =
         await mongo.dbrun.findOne({_id: new ObjectID(id)});
         if(res._id === undefined){
            /* istanbul ignore next */
            throw new Error('Object not found');
         }
        return res;
    };

    /**
     * Delete a single record from mongo DB
     * @param id Object Id
     * @returns Promise Delete results
     */
    mongoDeleteOne = async (id: ObjectID): Promise<DeleteResult> =>
        await mongo.dbrun.deleteOne({_id: id});

    /**
     * Cancels a cached emergency
     * @param id 24 digit id string
     * @returns sql number id
     */
    cancelEmergency = async (id: string): Promise<number> => {
        const mongoId = new ObjectID(id);
        const row = await this.mongofindById(id);
        delete(row._id);
        const max = 999999;
        let newId = randomInt(max);
        /* istanbul ignore next */
        while((await this.recordExist(newId))){
            newId = randomInt(max);
        }
        const sqlRec = {...row, id: newId} as BloodRecord;
        await this.insertRecord(sqlRec);
        await this.mongoDeleteOne(mongoId);
        return newId;
    };

    async getInfo () {
        const sql = `select count(blood_type), blood_type from
        bloodbankmanagementsystem_sql_user_jashon group by blood_type`;
        const bloods = (await pool.query(sql)).rows as BloodGroups;
        const emergency = await mongo.dbrun.aggregate(
            [{  $group: { _id: '$blood_type',
                count: { $sum: 1 }}}]).toArray() as MongoGroups;
        return {bloods, emergency};
    };

    async donateBlod (data: DonateReq) {
        const sql =
        `insert into bloodbankmanagementsystem_sql_user_jashon
        (id, hospital, blood_type, location, donator, date, expiry)
        values ($1, $2, $3, $4, $5, $6, $7)`;
        const max = 999999;
        let id = randomInt(max);
        /* istanbul ignore next */
        while((await this.recordExist(id))){
            id = randomInt(max);
        }
        const recs: Array<string | number | Date> =
            [id, data.hospital, data.type, data.location, data.donator];
        const [date, expiry] = [new Date(), new Date()];
        recs.push(date);
        let years: number;
        await fetch(DateUrl, {
            method: 'POST',
            body: JSON.stringify({
                username: 'jashon',
                type: data.type })})
                .then(res => res.text())
                .then(res => {
                    years = +res;
                });
        expiry.setFullYear(expiry.getFullYear() + years);
        recs.push(expiry);
        await pool.query(sql, recs);
        return id;
    };
};





/**
 * Get info Object
 */
export class BloodInfo implements Info{
    total_blood = 0;
    total_emergencies = 0;
    percentage_emergencies = 0;
    readonly blood_per_type: BloodTypes = {
        'O Positive': 0,
        'O Negative': 0,
        'A Positive': 0,
        'A Negative': 0,
        'B Positive': 0,
        'B Negative': 0,
        'AB Positive': 0,
        'AB Negative': 0  };
    /**
     * Get data from mongoDB and PSQL to update emergencies
     */
    async update(){
        const dbInstance = new SqlAccess();
        const allData = await dbInstance.getInfo();
        allData.bloods.forEach(group => {
            const thisType = group.blood_type as string;
            if(VERIFY.includes(thisType)){
                this.blood_per_type[group.blood_type] += +group.count;
                this.total_blood += +group.count;
            }
        });
        allData.emergency.forEach(group => {
            if(VERIFY.includes(group._id)){
                this.blood_per_type[group._id] += +group.count;
                this.total_blood += +group.count;
                this.total_emergencies += +group.count;
            }
        });
        if(this.total_blood !== 0){
            this.percentage_emergencies =
            +(this.total_emergencies * 100 / this.total_blood).toFixed(1);
        }
        else{
             /* istanbul ignore next */
            this.percentage_emergencies = 0;
        }
    };

    /**
     * returns the computed info
     * @returns This class object implementing info structure
     */
    data = () => this;
};
