import { ObjectID } from 'bson';
import express, {Response, Request} from 'express';
import { CleanUrl } from './config/config';
import { pool } from './database';
import { BloodInfo, SqlAccess } from './dataTools/sqlAccess';
import { CacheSql, DonateReq, HTTP, UpdateSql } from './types/types';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use((_req: Request, res: Response, next) =>{
    res.header({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*' });
    next();
});

/**
 * Clean database of expired blood every 5 secs
 */
const cleanInterval = 5000;

setInterval( async () => {
  await fetch(CleanUrl, {
    method: 'POST',
    body: JSON.stringify({
        username: 'jashon',
        expiry: new Date() })});
}, cleanInterval);

/**
 * Root
 */
app.get('/', (_, res) => {
  res.status(HTTP['200']).send('Welcome to SkillReactor');
});

/**
 * Get by id
 */
app.get('/get-blood/id/:id', async (req, res) => {
  const {id} = req.params;
  const sql = 'select * from bloodbankmanagementsystem_sql_user_jashon where id = $1';
  pool.query(sql, [id], (err, data) => {
    if(err || !data.rowCount){
      res.status(HTTP['400']).send('Error');
    }
    else {
      res.status(HTTP['200']).json(data.rows[0]);
    }
  });
});

/**
 * Get by hospital name
 */
 app.get('/get-blood/hospital/:hospital?', async (req, res) => {
  const hospital = req.params.hospital;
  const sql = 'select * from bloodbankmanagementsystem_sql_user_jashon where hospital = $1';
  pool.query(sql, [hospital], (err, data) => {
    if(err || !data.rowCount){
      res.status(HTTP['400']).send('Error');
    }
    else {
      res.status(HTTP['200']).json(data.rows);
    }
  });
});

/**
 * Update blood record
 */
app.post('/update-blood', async (req, res) => {
  try{
    const updateData = req.body as UpdateSql;
    if(updateData.id === undefined){
      throw new Error('id must be provided');
    }
    const dbInstance = new SqlAccess(updateData);

    if(!(await dbInstance.recordExist(updateData.id))){
      throw new Error('Record not found');
    }

    await dbInstance.updateQuery();
    res.status(HTTP['201']).send();
  }
  catch(e){
    res.status(HTTP['400']).json(e.message);
  };
});

/**
 * Delete blood record
 */
app.post('/delete-blood', async(req, res) => {
  try{
    const {id} = req.body as {id: number};
    if(id === undefined){
      throw new Error('id must be provided');
    }
    const dbInstance = new SqlAccess();
    await dbInstance.deleteRecord(id);
    res.status(HTTP['200']).send();
  }
  catch(e){
    res.status(HTTP['400']).send(e.message);
  }
});

/**
 * Query by time
 */
app.get('/get-blood/time/:time', async(req, res) => {
  try {
    const {time} = req.params;
    const timefmt = new Date(time);
    const dbInstance = new SqlAccess();
    const rows = await dbInstance.querybyTime(timefmt);
    res.status(HTTP['200']).json(rows);
  }
  catch(e){
    res.status(HTTP['400']).send(e.message);
  }
});

/**
 * Query blood type
 */
app.get('/get-blood/type/:type', async(req, res)=>{
  try{
    const {type} = req.params;
    const dbInstance = new SqlAccess();
    const rows = await dbInstance.querybyBloodType(type);
    if(!rows.length){
      throw new Error(`no records with ${type} found`);
    }
    res.status(HTTP['200']).json(rows);
  }
  catch(e){
    res.status(HTTP['400']).send(e.message);
  }
});

/**
 * Clean filtered by expiry
 */
app.post('/clean-blood', async (req, res) => {
    try{
      const {expiry} = req.body as {expiry: string};
      const expiryDate = new Date(expiry);
      const dbInstance = new SqlAccess();
      await dbInstance.deleteExpired(expiryDate);
      res.status(HTTP['200']).send('Success');
    }
    catch(e){
      res.status(HTTP['400']).send(e.message);
    }
});

/**
 * Emergency create
 */
app.post('/emergency/create', async(req, res) => {
  try{
    const reqData = req.body as CacheSql;
    if(!reqData.type || !reqData.location){
      throw new Error('invalid request params');
    }
    const dbInstance = new SqlAccess();
    const reqId =  await dbInstance.cacheRecord(reqData);
    res.status(HTTP['200']).send(reqId);
  }
  catch(e){
    res.status(HTTP['400']).send(e.message);
  }
});

/**
 * Retrieve Emergency
 */
app.get('/emergency/:id', async(req, res) => {
  try{
    const {id} = req.params;
    const dbInstance = new SqlAccess();
    const data = await dbInstance.mongofindById(id);
    res.status(200).json(data);
  }
  catch(e){
    res.status(400).send(e.message);
  }
});

/**
 * Complete emergency
 */

app.post('/emergency/complete', async(req, res) => {
  try{
    const {id} = req.body;
    if(!id) {
      throw new Error('Id is required');
    }
    const dbInstance = new SqlAccess();
    const data = await dbInstance.mongoDeleteOne(new ObjectID(id));
    res.status(200).send(data);
  }
  catch(e){
    res.status(400).send(e.message);
  }
});

/**
 * Cancel an emergency
 */
app.post('/emergency/cancel', async(req, res) => {
  try{
    const {id} = req.body;
    if(!id){
      throw new Error('Id is requred');
    }
    const dbInstance = new SqlAccess();
    const sqlId = await dbInstance.cancelEmergency(id);
    res.status(200).send(`${sqlId}`);
  }
  catch(e){
    res.status(400).send(e.message);
  }
});

/**
 * Get info
 */
app.get('/info', async(_, res) => {
  try{
    const dataInstance = new BloodInfo();
    await dataInstance.update();
    const rows = dataInstance.data();
    res.status(200).json(rows);
  }
  catch(e){
    /* istanbul ignore next */
    res.status(500).send(e.message);
  }
});

/**
 * Donate blood
 */
app.post('/donate', async(req, res) => {
    try{
      const dbInstance = new SqlAccess();
      const data: DonateReq = req.body;
      if(!data.donator || !data.hospital || !data.location || !data.type){
        throw new Error('All fields must be provided');
      }
      const id = await dbInstance.donateBlod(data);
      res.status(200).send(`${id}`);
    }
    catch(e){
      res.status(400).send(e.message);
    }
});

app.get('/info/:id', async (req, res) => {
    try {
      const {id} = req.params;
      const dbInstance = new SqlAccess();
      const data = await dbInstance.getUserInfo(id);
      res.status(200).send(data);
    }
    catch(e){
      res.status(400).send(e.message);
    }
});

export default app;
