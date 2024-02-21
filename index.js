import Hapi from '@hapi/hapi';
import axios from 'axios';
import AWS from 'aws-sdk';
import R from 'rambda';
import { createReadStream } from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

const OUTPUT_FILENAME = 'stations.csv';
const BUCKET_NAME = 'DIVVY_BIKES'

const s3 = new AWS.S3();

const server = Hapi.server({
    port:  3000,
    host: 'localhost'
});

const filterStations = R.pipe(
    R.map(station => R.omit(['rental_methods', 'rental_uris'], station)),
    R.map(station => ({
        externalId: station.external_id,
        stationId: station.station_id,
        legacyId: station.legacy_id,
        ...R.omit(['external_id', 'station_id', 'legacy_id'], station)
    })),
    R.filter(station => station.capacity <  12)
);

/**
 * @todo figure out if there is a preference for how we want to output the headers and
 * potentially values
 */
const normalizeCSVHeaders = R.pipe(
    R.defaultTo([{}]),
    R.head,
    R.keys,
    R.map(
      key => ({ id: key, title: key })
    ),
);
  

server.route({
    method: 'GET',
    path: '/api/stations',
    handler: async (request, h) => {
        try {
            const response = await axios.get('https://gbfs.divvybikes.com/gbfs/en/station_information.json');
            const stations = response?.data?.data?.stations ?? [];

            const modifiedStations = filterStations(stations);

            const csvWriter = createObjectCsvWriter({
                path: OUTPUT_FILENAME,
                header: normalizeCSVHeaders(modifiedStations)
            });

            await csvWriter.writeRecords(modifiedStations);

            const params = {
                Bucket: BUCKET_NAME,
                Key: OUTPUT_FILENAME,
                Body: createReadStream(OUTPUT_FILENAME)
            };

            await s3.upload(params).promise();

            return h.response('File uploaded successfully').code(200);
        } catch (error) {
            console.error('An error occurred:', error);
            return h.response(`An error occurred (${error.message})`).code(500);
        }
    }
});

const init = async () => {
    try {
        await server.start();
        console.log(`Server running on ${server.info.uri}`);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
