import request from 'supertest';
import {InsertSql, CacheSql} from '../src/types/types';
import app from '../src/app';
import {createServer, Server} from 'http';
import {SqlAccess} from '../src/dataTools/sqlAccess';
import {mongo} from '../src/database';

const dbInstance = new SqlAccess();
const server: Server = createServer(app);
jest.setTimeout(20000)
beforeAll( async() => {
    const mockRec: InsertSql = {
      id: 210,
      hospital: 'Create-Test',
      blood_type: 'Create-Test',
      donator: 'Create-Test',
      location: 'Create-Test' };
  try {
    const _ = await dbInstance.insertRecord(mockRec);
  }
  catch (e){
      console.log(e.message);
  }
});

 afterAll( async()=>{
      server.close();
      try {
        await mongo.collection.deleteMany({location: 'Create-Test'});
    }
    catch (e){
        console.log(e.message);
    }
});

const singleReq: CacheSql = {
    location: 'Create-Test',
    type: 'Create-Test' };

describe('Create a cache in nosql database', () => {
  test('Cache record', (done) => {
        request(server)
        .post('/emergency/create')
        .send(singleReq)
        .end((err, res)=> {
            if (err) return done(err);
            expect(res).toBeDefined
            expect(res.status).toBe(200)
            return done()
        });
    });

  test('Expect error 400 if correct data is not given', (done) => {
        request(server)
        .post('/emergency/create')
        .send({dumbtest: 'not'})
        .expect(400)
        .end((err, _res) => {
            if(err) return done(err);
            return done();
        });
    });

    test('Test cors options method * and access ctrl *', (done)=>{
        request(server)
        .post('/emergency/create')
        .send({})
        .expect('Access-Control-Allow-Origin', /\*/)
        .expect('Access-Control-Allow-Methods', /\*/)
        .end((err, _) => {
            if (err) return done(err);
            done();
        });
    });

    test('Data is removed from sql table after caching', async () => {
        const record = await dbInstance.recordExist(210);
        expect(record).toBe(false);
    });

});
