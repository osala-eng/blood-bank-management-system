import request from 'supertest';
import {UpdateSql} from '../src/types/types';
import app from '../src/app';
import {createServer, Server} from 'http';


let server: Server;
beforeAll(async () => {
    server  = createServer(app);
})
afterAll(async ()=>{
    server.unref()
});
const singleReq: UpdateSql = {
    id: 5,
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
        .end((err, res) => {
            if(err) return done(err);
            console.log(res)
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
        .end((err, _) => {
            if(err) return done(err);
            return done();
        });
    });

});