import express from 'express';
import { pool } from './database';
import {queryById} from './config/config';
import { HTTP } from './types/types';

const app = express();
app.use(express.json());
// Connect();


app.get('/', (_, res) => {
  res.status(HTTP['200']).send('Welcome to SkillReactor');
});

/**
 * Get by id
 */
app.get('/get-blood/id/:id', async (req, res) => {
  const id = req.params.id;
  pool.query(`${queryById}${id}`, (err, data) => {
    if(err || !data.rowCount){
      res.status(HTTP['400']).send('Error');
    }
    else {
      res.status(HTTP['200']).json(data.rows[0]);
    }
  });
});

export default app;
