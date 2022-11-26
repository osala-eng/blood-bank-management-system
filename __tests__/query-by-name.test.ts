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

describe('Test get query by name', () => {
  test('Get by id is correct expect 200', async () => {
    const test = await request(server)
    .get('/get-blood/hospital/Royal Infirmary')
    expect(test.statusCode).toBe(200)
    const rows = test.body as BloodRecords;
    expect(rows.length > 1).toBe(true);
    });

  test('Get by name error expect 400', async () => {
    const res = await request(server).get('/get-blood/hospital/not');
    expect(res.statusCode).toBe(400);
    expect(res.text).toEqual('Error');
  });

});