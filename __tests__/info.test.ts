import request  from 'supertest';
import app from '../src/app';
import {mongo} from '../src/database';
import {createServer} from 'http';
import {isMongoConnected} from '../src/utils/utils';

const server = createServer(app);
beforeAll(async() => {
    const _ = await isMongoConnected;
})

jest.setTimeout(40000);
describe('Check if the info end point returns data', () =>{
    test('Make a post request to the info endpoint', async ()=>{
        const res = await request(server).post('/info');
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined;
    })
});