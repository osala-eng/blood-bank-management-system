import { BloodRecords, InsertSql, NULL, UpdateSql } from '../types/types';
import { pool } from '../database';

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
    insertRecord = async (data: InsertSql): Promise<void> => {
        const recs: Array<string| Date | number> = [data.id];
        recs.push(data.hospital, data.blood_type, data.location, data.donator);
        const sql =
            `insert into bloodbankmanagementsystem_sql_user_jashon
            (id, hospital, blood_type, location, donator, date, expiry)
            values ($1, $2, $3, $4, $5, $6, $7)`;
        const month = 6;
        const [date , expiry] = [new Date(), new Date()];
        expiry.setMonth(expiry.getMonth() + month);
        recs.push(date, expiry);
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

    querybyBloodType = async (type: string): Promise<BloodRecords> => {
        const sql =`
        select * from bloodbankmanagementsystem_sql_user_jashon
        where blood_type = $1`;
        return (await pool.query(sql, [type])).rows as BloodRecords;
    };

    async deleteExpired(expiry: Date): Promise<void> {
        const sql =
            `delete from bloodbankmanagementsystem_sql_user_jashon where expiry >= $1`;
        await pool.query(sql, [expiry]);
    };
};
