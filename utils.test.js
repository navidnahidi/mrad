import { jest } from '@jest/globals'
import { filterStations, normalizeCSVHeaders } from './utils';

describe('filterStations', () => {
  it('should filter stations with capacity less than 12', () => {
    const stations = [
      { capacity: 10, external_id: '1', station_id: 'A', legacy_id: 'L1' },
      { capacity: 15, external_id: '2', station_id: 'B', legacy_id: 'L2' }
    ];
    const filtered = filterStations(stations);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].externalId).toBe('1');
    expect(filtered[0].stationId).toBe('A');
  });

  it('should return an empty array when all capacity is greater than 12', () => {
    const stations = [
      { capacity: 13, external_id: '1', station_id: 'A', legacy_id: 'L1' },
      { capacity: 15, external_id: '2', station_id: 'B', legacy_id: 'L2' }
    ];
    const filtered = filterStations(stations);
    expect(filtered).toEqual([]);
  });
});

describe('normalizeCSVHeaders', () => {
  it('should return the headers from the first object', () => {
    const data = [
      { column1: 'data1', column2: 'data2' },
      { column1: 'data3', column2: 'data4' }
    ];
    const headers = normalizeCSVHeaders(data);
    expect(headers).toEqual([
      { id: 'column1', title: 'column1' },
      { id: 'column2', title: 'column2' }
    ]);
  });
});