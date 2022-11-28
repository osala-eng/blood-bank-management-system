import request from 'supertest';
import {BloodRecords, InsertSql} from '../src/types/types';
import app from '../src/app';
import {createServer, Server} from 'http';
import {SqlAccess} from '../src/dataTools/sqlAccess';

let server: Server
beforeAll( async() => {
  const mockRec: InsertSql = {
    id: 203,
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
      await dbInstance.deleteRecord(203);
  }
  catch (e){
      console.log(e.message);
  }
});

describe('Test get query by type', () => {
  test('Expect results for correct type', (done) => {
    request(server)
    .get('/get-blood/type/Test')
    .expect(200)
    .end((err, res) => {
        if (err) return done(err);
        const rows = res.body as BloodRecords;
        expect(rows.length > 0).toBe(true);
        done();
    });
  });

  test('Get by type not available', (done) => {
    request(server)
    .get('/get-blood/type/not')
    .expect(400)
    .end((err, _) => {
        if (err) return done(err);
        done();
    });
  });

});
