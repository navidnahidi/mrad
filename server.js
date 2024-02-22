import Hapi from '@hapi/hapi';
import { handler } from './lambda.js';

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler
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

export { server };