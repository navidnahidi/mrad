const axios = require('axios');
const AWS = require('aws-sdk');
jest.mock('axios');
jest.mock('aws-sdk');

describe('API test', () => {
    it('should return stations data', async () => {
        const mockData = {
            data: {
                stations: [
                    { rental_methods: [], rental_uris: [], external_id: '1', station_id: '1', legacy_id: '1', capacity:  10 },
                    // Add more mock data as necessary
                ]
            }
        };

        axios.get.mockResolvedValue(mockData);

        const response = await axios.get('https://gbfs.divvybikes.com/gbfs/en/station_information.json');
        expect(response.data.stations[0].externalId).toBe('1');
        expect(response.data.stations[0].stationId).toBe('1');
        expect(response.data.stations[0].legacyId).toBe('1');
        expect(response.data.stations[0].capacity).toBe(10);
    });
});
