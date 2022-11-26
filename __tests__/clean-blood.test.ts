import request from 'supertest';
import {BloodRecords} from '../src/types/types';
import app from '../src/app';
import {createServer, Server} from 'http';


let server: Server;
beforeAll(() => {
    server  = createServer(app);
})
afterAll(()=>{
    server.close();
});

describe('Test clean blood endpoint', () => {
  test('Expect success for correct time format', (done) => {
    request(server)
    .post('/clean-blood')
    .send({expiry: '3031-12-28T12:14:19'})
    .expect(200)
    .end((err, res) => {
        if (err) return done(err);
        expect(res.text).toEqual('Success')
        done();
    });
  });

  test('Clean blood with invalid format', (done) => {
    request(server)
    .post('/clean-blood')
    .send({expiry: 'not'})
    .expect(400)
    .end((err, _) => {
        if (err) return done(err);
        done();
    });
  });

  test('Test cors origin and methods to be *', (done) => {
    request(server)
    .post('/clean-blood')
    .send({})
    .expect(400)
    .expect('Access-Control-Allow-Origin', /\*/)
    .expect('Access-Control-Allow-Methods', /\*/)
    .end((err, _) => {
        if (err) return done(err);
        done();
    });
  });

});