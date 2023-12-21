const request = require('supertest');
const jest = require('jest');
const { sendToFlaskServer } = require('../../server.js');

describe('sendToFlaskServer', () => {
  it('returns the correct response for a successful request', async () => {
    const mockResponse = { status: 200, payload: { data: 'test' } };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const response = await sendToFlaskServer('test', 'test', {}, 'test', 'test');
    expect(response).toEqual(mockResponse);
  });

  it('throws an error for an unsuccessful request due to server error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    await expect(sendToFlaskServer('test', 'test', {}, 'test', 'test')).rejects.toThrow('HTTP error! status: 500');
  });

  it('throws an error for an unsuccessful request due to invalid payload', async () => {
    await expect(sendToFlaskServer(null, null, null, null, null)).rejects.toThrow();
  });
});
