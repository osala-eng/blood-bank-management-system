import request  from 'supertest';
import app from '../src/app';
import {createServer} from 'http';
import {isMongoConnected} from '../src/utils/utils';
import { SqlAccess } from '../src/dataTools/sqlAccess';

const server = createServer(app);
let id: number;
beforeAll(async() => {
    const _ = await isMongoConnected;
})
afterAll(async () => {
    const dbInstance = new SqlAccess();
    await dbInstance.deleteRecord(id);
})

jest.setTimeout(40000);
describe('Donate Blood and info', () =>{
    describe('Donate blood test', ()=>{
        test('Expect new blood donation to return code 200 with sql ID', async ()=>{
            const res = await request(server)
            .post('/donate')
            .send({ location: 'Kenya Hospital',
                    type: 'B Negative',
                    hospital: 'Hospital Kenya',
                    donator: 'Jest Test'});
            expect(res.statusCode).toBe(200);
            expect(res.text).toBeDefined;
            id = +res.text;
        });
        test('Expect new blood donation to return code 200 with sql ID', async ()=>{
            const res = await request(server)
            .post('/donate')
            .send({});
            expect(res.statusCode).toBe(400);
            expect(res.text).toBeDefined;
            id = +res.text;
        });
    });
    describe('Info test', () => {
        test('Make a post request to the info endpoint', async ()=>{
            const res = await request(server).get('/info');
            expect(res.statusCode).toBe(200);
            expect(res.body).toBeDefined;
        });
    });
});
