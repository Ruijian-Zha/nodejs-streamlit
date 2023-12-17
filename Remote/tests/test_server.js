const request = require('supertest');
const app = require('../../server');

describe('Test /open-url endpoint', () => {
  test('It should open a valid URL and upload a screenshot', async () => {
    const response = await request(app)
      .get('/open-url')
      .query({ url: 'https://example.com' });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('URL is opened in Chrome and screenshot uploaded');
  });

  test('It should return an error if no URL is provided', async () => {
    const response = await request(app)
      .get('/open-url');

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('No URL provided.');
  });

  test('It should return an error if an error occurs while opening the URL or taking a screenshot', async () => {
    const response = await request(app)
      .get('/open-url')
      .query({ url: 'https://invalid-url.com' });

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('An error occurred while opening the URL or taking a screenshot.');
  });
});
