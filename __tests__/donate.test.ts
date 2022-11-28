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
describe('Donate Blood', () =>{
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
    })
});
