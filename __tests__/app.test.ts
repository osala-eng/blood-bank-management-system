import request from 'supertest';

import app from '../src/app';

describe('Test app.ts', () => {
  test('Get response is correct', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Welcome to SkillReactor');
  });

  test('Get by id is correct expect 200', async () => {
    const res = await request(app).get('/get-blood/id/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined
  });

  test('Get by id is wrong expect 400', async () => {
    const res = await request(app).get('/get-blood/id/K');
    expect(res.statusCode).toBe(400);
    expect(res.text).toEqual('Error');
  });

});