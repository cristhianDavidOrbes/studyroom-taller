import { readConfig, MODEL } from './config.js';
import { createGateway } from './server.js';

const config = readConfig();
const gateway = createGateway(config);
gateway.server.listen(config.port, '127.0.0.1', () => {
  console.info(JSON.stringify({ event: 'listening', address: '127.0.0.1', port: config.port, model: MODEL, localOnly: true }));
});
gateway.server.on('error', error => { console.error(JSON.stringify({ event: 'server_error', code: (error as NodeJS.ErrnoException).code ?? 'UNKNOWN' })); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void gateway.shutdown(); });
