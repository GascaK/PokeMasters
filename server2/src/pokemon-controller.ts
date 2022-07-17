import { Controller, Get, Put } from '@overnightjs/core';
import { Request, Response } from 'express';

import * as fs from 'fs';

@Controller('pokemon')
export class PokemonController {
    private filepath = 'assets/pokemonData.json';

    @Get('pokeID/:pokeID')
    async getPokemonByID(request: Request, response: Response) {

    }

    @Get('random/:tier')
    async getRandomPokemonByTier(request: Request, response: Response) {

    }
}