import express, {Response, Request} from 'express';
import { pool } from './database';
import { SqlAccess } from './dataTools/sqlAccess';
import { HTTP, UpdateSql } from './types/types';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use((_req: Request, res: Response, next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    next();
});

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

    dbInstance.updateQuery();
    res.setHeader('Access-Control-Allow-Origin' , '*')
    res.setHeader('Access-Control-Allow-Methods' , '*')
    res.status(HTTP['201']).send();
  }
  catch(e){
    res.setHeader('Access-Control-Allow-Origin' , '*')
    res.setHeader('Access-Control-Allow-Methods' , '*')
    res.status(HTTP['400']).json(e.message);
  }

});
export default app;
