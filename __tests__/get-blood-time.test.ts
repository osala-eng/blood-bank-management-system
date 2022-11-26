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

describe('Test get query by time', () => {
  test('Expect results for correct time format', (done) => {
    request(server)
    .get('/get-blood/time/2022-09-28T12:14:19')
    .expect(200)
    .end((err, res) => {
        if (err) return done(err);
        const rows = res.body as BloodRecords;
        expect(rows.length > 0).toBe(true);
        done();
    });
  });

  test('Get by time invalid format', (done) => {
    request(server)
    .get('/get-blood/time/not')
    .expect(400)
    .end((err, _) => {
        if (err) return done(err);
        done();
    });
  });

});