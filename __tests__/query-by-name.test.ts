import request from 'supertest';
import {BloodRecords} from '../src/types/types';
import app from '../src/app';

describe('Test get query by name', () => {
  test('Get by id is correct expect 200', async () => {
    request(app)
        .get('/get-blood/hospital/Royal Infirmary')
        .expect('Content-Type', /application\/json; charset=utf-8/)
        .expect(200)
        .end((err, res) => {
            if(err) return err;
            const rows = JSON.parse(res.body) as BloodRecords;
            expect(rows.length > 1).toBe(true);
        });
  });

  test('Get by name error expect 400', async () => {
    const res = await request(app).get('/get-blood/hospital/not');
    expect(res.statusCode).toBe(400);
    expect(res.text).toEqual('Error');
  });

});