import request from 'supertest';

import app from '../src/app';

describe('Test app.ts', () => {
  it('Get response at root is correct', async () => {
    request(app)
      .get('/')
      .expect('Content-Type', /text\/html; charset=utf-8/)
      .expect(200)
      .end((err, res) => {
        if(err) return err
        expect(res.text).toEqual('Welcome to SkillReactor')
      });
  });

  test('Get unknown route to return 404', async () => {
    const res = await request(app).get('/no-route');
    expect(res.statusCode).toBe(404);
  })

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