import request from 'supertest';
import {InsertSql} from '../src/types/types';
import app from '../src/app';
import {createServer, Server} from 'http';
import {SqlAccess} from '../src/dataTools/sqlAccess';

const dbInstance = new SqlAccess();
const server: Server = createServer(app);
jest.setTimeout(40000);
beforeAll( async() => {
    const mockRec: InsertSql = {
      id: 233,
      hospital: 'User-Info',
      blood_type: 'B positive',
      donator: 'User-Info',
      location: 'User-Info' };
  try {
    const _ = await dbInstance.insertRecord(mockRec);
  }
  catch (e){
      console.log(e.message)
  }
});

 afterAll( async()=>{
      server.close();
      try {
        await dbInstance.deleteRecord(233);
    }
    catch (e){
        console.log(e.message);
    }
});

describe('Get user info with given id', () => {
  test('Retrieve record', async() => {
        const res = await request(server).get(`/info/${233}`);
        expect(res.status).toBe(200);
    });
  test('Expect error 400 if record does not exist', (done) => {
        request(server)
        .get('/info/not')
        .expect(400)
        .end((err, _res) => {
            if(err) return done(err);
            return done();
        });
   });
});
