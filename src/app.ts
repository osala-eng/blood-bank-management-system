import express from 'express';
import { pool } from './database';
import { HTTP } from './types/types';

const app = express();
app.use(express.json());


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

export default app;
