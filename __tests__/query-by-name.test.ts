import request from 'supertest';
import {BloodRecords, InsertSql} from '../src/types/types';
import app from '../src/app';
import {createServer, Server} from 'http';
import {SqlAccess} from '../src/dataTools/sqlAccess';


let server: Server;
beforeAll( async() => {
  const mockRec: InsertSql = {
    id: 205,
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
      await dbInstance.deleteRecord(205);
  }
  catch (e){
      console.log(e.message);
  }
});

describe('Test get query by name', () => {
  test('Get by id is correct expect 200', async () => {
    const test = await request(server)
    .get('/get-blood/hospital/Test')
    expect(test.statusCode).toBe(200)
    const rows = test.body as BloodRecords;
    expect(rows.length > 0).toBe(true);
    });

  test('Get by name error expect 400', async () => {
    const res = await request(server).get('/get-blood/hospital/not');
    expect(res.statusCode).toBe(400);
    expect(res.text).toEqual('Error');
  });
});
