import { Server, createServer} from 'http';
import request from 'supertest';
import app from '../src/app';
import {InsertSql} from '../src/types/types';
import {SqlAccess} from '../src/dataTools/sqlAccess';

jest.setTimeout(20000);

let server: Server
beforeAll( async() => {
  const mockRec: InsertSql = {
    id: 200,
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
      await dbInstance.deleteRecord(200);
  }
  catch (e){
      console.log(e.message);
  }
});

describe('Test app.ts', () => {
  test('Get response at root is correct', (done) => {
    request(app)
      .get('/')
      .expect('Content-Type', /text\/html; charset=utf-8/)
      .expect(200)
      .end((err, res) => {
        if(err) return done(err)
        expect(res.text).toEqual('Welcome to SkillReactor')
        done();
      });
  });

  test('Get unknown route to return 404', async () => {
    const res = await request(app).get('/no-route');
    expect(res.statusCode).toBe(404);
  })

  test('Get by id is correct expect 200', async () => {
    const res = await request(app).get('/get-blood/id/200');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined
  });

  test('Get by id is wrong expect 400', async () => {
    const res = await request(app).get('/get-blood/id/K');
    expect(res.statusCode).toBe(400);
    expect(res.text).toEqual('Error');
  });

});
