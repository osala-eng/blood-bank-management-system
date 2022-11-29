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
      id: 212,
      hospital: 'Complete-EM',
      blood_type: 'Complete-EM',
      donator: 'Complete-EM',
      location: 'Complete-EM' };
  try {
    const _ = await dbInstance.insertRecord(mockRec);
  }
  catch (e){
      console.log(e.message)
  }
});

 afterAll( async()=>{
      server.close();
});


describe('Rettrieve emergency from mongodb', () => {
  test('Expect error 400 if record does not exist', (done) => {
        request(server)
        .post('/emergency/complete')
        .send({})
        .expect(400)
        .end((err, _res) => {
            if(err) return done(err);
            return done();
        });
   });

  test('Retrieve record expect success', async() => {
    const createId = await dbInstance.cacheRecord({
        location: 'Complete-EM',
        type: 'Complete-EM' });

        const res = await request(server)
            .post(`/emergency/complete`)
            .send({id: createId})
        expect(res.status).toBe(200)
    });

    test('Test cors options', (done) => {
        request(server)
        .post('/emergency/complete')
        .send({})
        .expect('Access-Control-Allow-Origin', /\*/)
        .expect('Access-Control-Allow-Methods', /\*/)
        .end((err, _res) => {
            if(err) return done(err);
            return done();
        });
   });
});
