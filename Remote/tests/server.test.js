const request = require('supertest');
const server = require('../../server.js');

describe('/open-url', () => {
  it('responds with 200 for valid user input', async () => {
    const response = await request(server).get('/open-url').query({ url: 'http://www.google.com', user_input: 'test' });
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('URL is opened in Chrome and screenshot uploaded');
  });

  it('responds with 400 for missing user input', async () => {
    const response = await request(server).get('/open-url').query({ url: 'http://www.google.com' });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('No user input provided.');
  });

  it('responds with 500 for invalid user input', async () => {
    const response = await request(server).get('/open-url').query({ url: 'http://www.google.com', user_input: 'invalid' });
    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('An error occurred while opening the URL or taking a screenshot.');
  });
});

describe('/upload-screenshot', () => {
  it('responds with 200 for a successful request', async () => {
    const response = await request(server).post('/upload-screenshot').send({ image: 'valid_image' });
    expect(response.statusCode).toBe(200);
    expect(response.body.url).toContain('https://');
  });

  it('responds with 500 for a request that results in an error', async () => {
    const response = await request(server).post('/upload-screenshot').send({ image: 'invalid_image' });
    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('An error occurred while uploading the screenshot.');
  });
});

describe('/accessibility-tree', () => {
  it('responds with 200 for a successful request', async () => {
    const response = await request(server).get('/accessibility-tree');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
  });

  it('responds with 500 for a request that results in an error', async () => {
    const response = await request(server).get('/accessibility-tree');
    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('An error occurred while retrieving the accessibility tree.');
  });
});
