import axios, { Axios } from 'axios';

import { PokemonTemplate, PokeMoveTemplate } from './interfaces/pokemon';
import { PokeItemsTemplate } from './interfaces/items';
import PokemonMaster  from './interfaces/master';

class ServerService {
    instance = axios.create({
        baseURL: 'http://192.168.1.4:5000/',
        timeout: 12000,
        withCredentials: false,
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
        }
    });

    async getPokemonMaster(trainerID: number): Promise<PokemonMaster>{
        const PokemonTrainer = new PokemonMaster(trainerID, this);
        await this.instance.get(`/trainers/${trainerID}`)
        .then(async (res) => {
            const data = JSON.parse(res.data);
            PokemonTrainer.setItems(await this.getTrainerItems(trainerID));
            PokemonTrainer.setPokemon(await this.getTrainerPokemon(trainerID));

            PokemonTrainer.currentTier = data.tier;
            PokemonTrainer.dollars = data.dollars;
            PokemonTrainer.name = data.name;
        });

        console.log('trainer: ', PokemonTrainer);
        return PokemonTrainer;
    }

    async getTrainerItems(trainerID: number): Promise<Array<PokeItemsTemplate>>{
        const res = await this.instance.get<Array<PokeItemsTemplate>>(`/items/${trainerID}`);
        const trainerItems: Array<PokeItemsTemplate> = res.data;

        return trainerItems;
    }

    async getTrainerPokemon(trainerID: number): Promise<Array<PokemonTemplate>>{
        const res = await this.instance.get(`/trainers/${trainerID}/pokedex`);
        const fullDex = JSON.parse(res.data);
        const pokeIDs: Array<number> = [];
        const trainerDex: Array<PokemonTemplate> = [];

        fullDex.forEach( (pokeDexEntry: any) => {
            pokeIDs.push(...pokeDexEntry.ids);
        });

        pokeIDs.forEach( async (pokeID) => {
            await this.instance.get<PokemonTemplate>(`/pokemon/${pokeID}`)
            .then( async (res) => {
                const pokemon = res.data;
                // [pokemon.move1, pokemon.move2].forEach( async (move) => {
                //     const res = await this.instance.get<PokeMoveTemplate>(`/moves/${move}`);
                //     if (pokemon.moves){
                //         pokemon.moves.push(res.data);
                //     } else {
                //         pokemon.moves = [res.data];
                //     }
                // });
                pokemon.moves = [];
                pokemon.moves?.push(await this.getPokemonMove(pokemon.move1));
                pokemon.moves?.push(await this.getPokemonMove(pokemon.move2));
                pokemon.currentHP = pokemon.hp;
                trainerDex.push(pokemon);
            });
        });

        return trainerDex;
    }

    async getPokemonMove(moveID: number): Promise<PokeMoveTemplate>{
        const moveData: Array<PokeMoveTemplate> = [];
        const res = await this.instance.get<PokeMoveTemplate>(`/moves/${moveID}`)
        .then( (res) => {
            moveData.push(res.data);
        });
        return moveData[0];
    }

    async getNewPokemonByID(trainerID: number, pokedex: number): Promise<PokemonTemplate>{
        let pokemon: PokemonTemplate;

        await this.instance.get<PokemonTemplate>(`/pokemon/${trainerID}/${pokedex}`)
        .then( async (res) => {
            pokemon = res.data;
            pokemon.moves = [];
            pokemon.moves.push(await this.getPokemonMove(pokemon.move1));
            pokemon.moves.push(await this.getPokemonMove(pokemon.move2));
        });

        return pokemon!;
    }

    async changeTrainerPokemonByID(trainerID: number, pokeID: number): Promise<void>{
        await this.instance.put(`pokemon/${pokeID}?trainerID=${trainerID}`)
        .then((res) => {
            console.log(`Pokemon: ${pokeID} set to trainer: ${trainerID}`);
        })
        .catch( (err) => {
            console.log('error', err);
        });
    }
    async deleteTrainerItemByID(trainerID: number, itemID: number): Promise<void>{
        await this.instance.put(`/items/${trainerID}?item_id=${itemID}`)
        .then( (res) => {
            console.log(`Item: ${itemID} deleted.`);
        });
    }
}

export default ServerService