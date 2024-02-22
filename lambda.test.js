import { jest } from '@jest/globals'
import axios from 'axios';
import { handler } from './lambda';
import AWS from 'aws-sdk';

jest.mock('axios');

// @todo fix issue with this mock not working
const mockS3 = {
  upload: jest.fn().mockReturnThis(),
  promise: jest.fn().mockResolvedValue({}),
  createBucket: jest.fn().mockReturnThis(),
  waitFor: jest.fn().mockReturnThis(),
  promise: jest.fn().mockResolvedValue({ Location: 'http://s3.localhost.localstack.cloud:4566/bikes' })
};

jest.doMock('aws-sdk', () => {
  return {
    S3: jest.fn(() => mockS3),
    mockS3
  };
});

describe('handler', () => {
  it('should fetch data, process it, and upload to S3', async () => {
    const mockData = {
      data: {
        data: {
          stations: [
            { capacity: 10, external_id: '1', station_id: 'A', legacy_id: 'L1' },
            { capacity: 15, external_id: '2', station_id: 'B', legacy_id: 'L2' }
          ]
        }
      }
    };
    axios.get = jest.fn();
    axios.get.mockResolvedValue(mockData);
    const event = {};
    const context = {};
    const h = { response: jest.fn().mockReturnThis(), code: jest.fn() };

    await handler(event, h);

    expect(h.response).toHaveBeenCalledWith('File uploaded successfully');
    expect(h.code).toHaveBeenCalledWith(200);
  });

  it('should handle errors', async () => {
    const error = new Error('Network error');
    axios.get = jest.fn();
    axios.get.mockRejectedValue(error);
    const event = {};
    const context = {};
    const h = { response: jest.fn().mockReturnThis(), code: jest.fn() };

    await handler(event, h);

    expect(h.response).toHaveBeenCalledWith(`An error occurred (${error.message})`);
    expect(h.code).toHaveBeenCalledWith(500);
  });
});