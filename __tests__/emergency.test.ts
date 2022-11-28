import request from 'supertest';
import {InsertSql} from '../src/types/types';
import app from '../src/app';
import {createServer, Server} from 'http';
import {SqlAccess} from '../src/dataTools/sqlAccess';
import {mongo} from '../src/database';

const dbInstance = new SqlAccess();
const server: Server = createServer(app);
jest.setTimeout(40000);
beforeAll( async() => {
    const mockRec: InsertSql = {
      id: 211,
      hospital: 'Emergency-Test',
      blood_type: 'Emergency-Test',
      donator: 'Emergency-Test',
      location: 'Emergency-Test' };
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
        await mongo.collection.deleteMany({location: 'Emergency-Test'});
    }
    catch (e){
        console.log(e.message);
    }
});


describe('Rettrieve emergency from mongodb', () => {
  test('Expect error 400 if record does not exist', (done) => {
        request(server)
        .get('/emergency/not')
        .expect(400)
        .end((err, _res) => {
            if(err) return done(err);
            return done();
        });
   });
  test('Retrieve record expect success', async() => {
    const createId = await dbInstance.cacheRecord({
        location: 'Emergency-Test',
        type: 'Emergency-Test' });
        const res = await request(server).get(`/emergency/${createId}`);
        expect(res.status).toBe(200)
    });
});