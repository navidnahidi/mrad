import axios from 'axios';
import AWS from 'aws-sdk';
import { createReadStream } from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import { filterStations, normalizeCSVHeaders } from './utils';

const OUTPUT_FILENAME = 'stations.csv';
const BUCKET_NAME = 'bikes'

// @todo remove all logic thatt uses TEST env by mocking S3
const s3 = new AWS.S3(process.env.TEST && {
    endpoint: 'http://s3.localhost.localstack.cloud:4566',
    s3ForcePathStyle: true,
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'us-east-1',
});

export const handler = async (request, h) => {
    try {
        const response = await axios.get('https://gbfs.divvybikes.com/gbfs/en/station_information.json');
        const stations = response.data.data.stations;

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

        // @todo remove all logic thatt uses TEST env by mocking S3
        if (process.env.TEST) {
            s3.api.globalEndpoint = 's3.localhost.localstack.cloud';
            await s3.createBucket({ Bucket: BUCKET_NAME }, function (err, data) {
                if (err) {
                    console.log("Error", err);
                } else {
                    console.log("Bucket created successfully", data.Location);
                }
            }).promise();

        }

        await s3.upload(params).promise();

        return h.response('File uploaded successfully').code(200);
    } catch (error) {
        console.error('An error occurred:', error);
        return h.response(`An error occurred (${error.message})`).code(500);
    }
};

export default handler;

