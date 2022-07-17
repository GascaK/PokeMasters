import { Server } from '@overnightjs/core';
//import axios from 'axios';
import * as cors from 'cors';
import * as https from 'https';

import { TrainerController } from './trainer-controller';

export class PokeServer extends Server {

    constructor(private port: number) {
        super(true);
        https.globalAgent.options.rejectUnauthorized = false;
        console.log('Starting');
    }

    public async start(): Promise<void> {

        setInterval(() => {

        }, 1000 * 60 * 15);
        
        this.app.use(cors())
        super.addControllers([
            new TrainerController()
        ]);
        
        this.app.set('etag', false);
        this.app.get('*', (_, res) => {
            res.send('Not implemented.');
        })
        this.app.listen(this.port, 'localhost', () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }
}