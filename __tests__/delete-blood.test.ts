import request from 'supertest';
import {InsertSql} from '../src/types/types';
import app from '../src/app';
import {createServer, Server} from 'http';
import {SqlAccess} from '../src/dataTools/sqlAccess';


let server: Server;
beforeAll(async () => {
    const mockRec: InsertSql = {
        id: 201,
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
});

afterAll( ()=>{
    server.close();
});


describe('Delete blood-record', () => {
  test('Delete with a valid id', (done) => {
        request(server)
        .post('/delete-blood')
        .send({id: 201})
        .expect(200)
        .end((err, _res)=> {
            if (err) return done(err);
            return done();
        });
    });

  test('Delete blood with invalid id', (done) => {
        request(server)
        .post('/delete-blood')
        .send({id: NaN})
        .expect(400)
        .end((err, _res) => {
            if(err) return done(err);
            return done();
        });
    });

    test('Send request with no id', (done) => {
        request(server)
        .post('/delete-blood')
        .send({})
        .expect(400)
        .end((err, _) => {
            if(err) return done(err);
            return done();
        });
    });

    test('Test cors options', (done)=>{
        request(server)
        .post('/delete-blood')
        .send({})
        .expect('Access-Control-Allow-Origin', /\*/)
        .expect('Access-Control-Allow-Methods', /\*/)
        .end((err, _) => {
            if (err) return done(err);
            done();
        });
    });
});