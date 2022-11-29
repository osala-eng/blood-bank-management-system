import request from 'supertest';
import {InsertSql} from '../src/types/types';
import app from '../src/app';
import {createServer, Server} from 'http';
import {SqlAccess} from '../src/dataTools/sqlAccess';

const dbInstance = new SqlAccess();
const server: Server = createServer(app);
let sqlId: number;
jest.setTimeout(40000);
beforeAll( async() => {
    const mockRec: InsertSql = {
      id: 213,
      hospital: 'Cancel-EM',
      blood_type: 'Cancel-EM',
      donator: 'Cancel-EM',
      location: 'Cancel-EM' };
  try {
    const _ = await dbInstance.insertRecord(mockRec);
  }
  catch (e){
      console.log(e.message)
  }
});

 afterAll( async()=>{
    const _ = await dbInstance.deleteRecord(sqlId);
      server.close();
});


describe('Cancel an emergency', () => {
    describe('Initial run', () => {
        test('Expect error 400 if id is not provided', (done) => {
            request(server)
            .post('/emergency/cancel')
            .send({})
            .expect(400)
            .end((err, _res) => {
                if(err) return done(err);
                return done();
            });
         });
        test('Cancel an emergency expect success', async() => {
            const createId = await dbInstance.cacheRecord({
            location: 'Cancel-EM',
            type: 'Cancel-EM' });

            const res = await request(server)
                .post(`/emergency/cancel`)
                .send({id: createId})
                sqlId = +res.text;
            expect(res.status).toBe(200);
        });
    });
    describe('Next run', () => {
        test('Expect record back in sql table', async () => {
            const recordExists = await dbInstance.recordExist(sqlId);
            expect(recordExists).toBe(true);
        });
        test('Test cors options', (done) => {
            request(server)
            .post('/emergency/cancel')
            .send({})
            .expect('Access-Control-Allow-Origin', /\*/)
            .expect('Access-Control-Allow-Methods', /\*/)
            .end((err, _res) => {
                if(err) return done(err);
                return done();
            });
        });
    });
});
