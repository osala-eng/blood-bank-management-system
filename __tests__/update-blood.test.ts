import request from 'supertest';
import {UpdateSql, InsertSql} from '../src/types/types';
import app from '../src/app';
import {createServer, Server} from 'http';
import {SqlAccess} from '../src/dataTools/sqlAccess';


let server: Server;
beforeAll( async() => {
    const mockRec: InsertSql = {
      id: 206,
      hospital: 'Test',
      blood_type: 'Test',
      donator: 'Test',
      location: 'Test' };
  try {
      const dbInstance = new SqlAccess();
      await dbInstance.insertRecord(mockRec);
  }
  catch (e){
      console.log(e.message);
  }
      server  = createServer(app);
  })
  afterAll( async()=>{
      server.close();
      try {
        const dbInstance = new SqlAccess();
        await dbInstance.deleteRecord(206);
    }
    catch (e){
        console.log(e.message);
    }
  });
const singleReq: UpdateSql = {
    id: 206,
    donator: 'Jane Smith'
};

const multiReq = {...singleReq, hospital: 'Dummy Hospital' }

describe('post to /update-blood', () => {
  test('update a single field', (done) => {
        request(server)
        .post('/update-blood')
        .send(singleReq)
        .expect(201)
        .expect('Access-Control-Allow-Origin', /\*/)
        .end((err, _res)=> {
            if (err) return done(err);
            return done()
        });
    });

  test('Update multiple fields', (done) => {
        request(server)
        .post('/update-blood')
        .send(multiReq)
        .expect(201)
        .expect('Access-Control-Allow-Origin', /\*/)
        .end((err, _res) => {
            if(err) return done(err);
            return done();
        });
    });

    test('Error 400 if id is not provided', (done) => {
        request(server)
        .post('/update-blood')
        .send({donator: 'Jane Doe'})
        .expect(400)
        .expect('Access-Control-Allow-Origin', /\*/)
        .end((err, _) => {
            if(err) return done(err);
            return done();
        });
    });

    test('Error 400 if id is does not exist', (done) => {
        request(server)
        .post('/update-blood')
        .send({id: 100, donator: 'Jane Doe'})
        .expect(400)
        .expect('Access-Control-Allow-Origin', /\*/)
        .expect('Access-Control-Allow-Methods', /\*/)
        .end((err, _) => {
            if(err) return done(err);
            return done();
        });
    });

    test('Test cors options', (done)=>{
        request(server)
        .post('/update-blood')
        .send({})
        .expect('Access-Control-Allow-Origin', /\*/)
        .expect('Access-Control-Allow-Methods', /\*/)
        .end((err, _) => {
            if (err) return done(err);
            done();
        });
    });

});
