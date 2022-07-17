import { PokeServer } from './server';

const server = new PokeServer(3000);

server.start().then(() => {}).catch(() => {});