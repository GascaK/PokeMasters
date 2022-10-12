import axios, { Axios } from 'axios';

import { PokemonTemplate, PokeMoveTemplate } from './interfaces/pokemon';
import { PokeItemsTemplate } from './interfaces/items';
import PokemonMaster  from './interfaces/master';

class ServerService {
    instance = axios.create({
        baseURL: 'http://192.168.1.28:5000/',
        timeout: 1000,
        withCredentials: false,
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
        }
    });

    async getPokemonMaster(trainerID: number): Promise<PokemonMaster>{
        const res = await this.instance.get(`/trainers/${trainerID}`);
        const PokemonTrainer = new PokemonMaster(trainerID);

        PokemonTrainer.setItems(await this.getTrainerItems(trainerID));
        PokemonTrainer.setPokemon(await this.getTrainerPokemon(trainerID));

        return PokemonTrainer;
    }

    async getTrainerItems(trainerID: number): Promise<Array<PokeItemsTemplate>>{
        const res = await this.instance.get<Array<PokeItemsTemplate>>(`/items/${trainerID}`);
        const trainerItems: Array<PokeItemsTemplate> = res.data;

        return trainerItems;
    }

    async getTrainerPokemon(trainerID: number): Promise<Array<PokemonTemplate>>{
        const res = await this.instance.get(`/trainers/${trainerID}/pokedex`);
        const fullDex = res.data;
        const pokeIDs: Array<number> = [];
        const trainerDex: Array<PokemonTemplate> = [];

        fullDex.forEach( (pokeDexEntry: any) => {
            pokeIDs.push(...pokeDexEntry.ids);
        });

        pokeIDs.forEach( async (pokeID) => {
            const res = await this.instance.get<PokemonTemplate>(`/pokemon/${pokeID}`);
            const pokemon = res.data;
            [pokemon.move1, pokemon.move2].forEach( async (move) => {
                const res = await this.instance.get<PokeMoveTemplate>(`/moves/${move}`);
                pokemon.moves?.push(res.data);
            });
            pokemon.currentHP = pokemon.hp;

            trainerDex.push(pokemon);
        });

        return trainerDex;
    }
}

export default ServerService