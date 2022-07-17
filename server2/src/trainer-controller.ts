import { Controller, Get, Put } from '@overnightjs/core';
import { Request, Response } from 'express';

import * as fs from 'fs';

@Controller('trainers')
export class TrainerController {
    private filepath = "assets/trainerData.json";

    constructor () {}

    @Get('trainer/:trainerID')
    async getTrainerInfo(request: Request, response: Response){
        try{
            const trainerID = request.params['trainerID'];
            let status = 200;
            let payload = {};

            if (fs.existsSync(this.filepath)) {
                fs.readFile(this.filepath, 'utf-8', (_err, data) => {
                    if (data) {
                        const trainerData = JSON.parse(data);
                        trainerData.forEach((trainer: any) => {
                            if (trainer.id.toString() === trainerID) {
                                payload = trainer;
                            }
                        });

                        if (payload === {}) {
                            status = 204;
                        }
                        response.status(status).json(payload);
                    } else {
                        response.status(204).json({});
                    }
                });
            }
        } catch(e) {
            response.status(200).json({});
        }
    }

    @Put('trainer/:trainerID')
    async putTrainerData(request: Request, response: Response){
        try{
            const trainerID = request.params['trainerID'];
            if (fs.existsSync(this.filepath)) {
                fs.readFile(this.filepath, 'utf-8', (_err, data) => {
                    if (data) {
                        const oldTrainerData = JSON.parse(data);
                        oldTrainerData.forEach((trainer: any) => {
                            if (trainer.id === trainerID) {
                                trainer.dollars = 0;
                                trainer.badges = 0;
                            }
                        });
                    } else {
                        response.status(401).json({"Error": `Unable to retrieve data from filepath ${this.filepath}`})
                    }
                });
            }
        } catch(e) {
            response.status(201).json({"error": `Error ${e} has occured. Data possibly not saved.`})
        }
    }
}