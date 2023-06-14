import axios, { Axios } from 'axios';

import { PokeItemsTemplate } from '../interfaces/pokeItems';
import { PokemonMaster } from '../interfaces/pokeMaster';
import { PokemonTemplate, PokeMoveTemplate } from '../interfaces/pokemon';

export class ServerService {
    instance = axios.create({
        baseURL: 'http://127.0.0.1:5000/',
        timeout: 12000,
        withCredentials: false,
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
        }
    });

    async getPokemonMaster(trainerID: number): Promise<PokemonMaster>{
        const trainer = new PokemonMaster(trainerID, this);
        await this.instance.get(`/trainers/${trainerID}`)
            .then(async (res) => {
                const data = JSON.parse(res.data);
                // trainer.items = await this.getTrainerItems(trainerID);
                // trainer.pokemon = await this.getTrainerPokemon(trainerID);
                trainer.dollars = data.dollars;
                trainer.name = data.name;
                trainer.badges = data.badges;
                trainer.getCurrentTier();
                trainer.activePokemon = await this.getPokemonByID(data.poke1);
                trainer.pokemon = await this.getTrainerPokemon(trainerID);
            });
        return trainer;
    }

    // async getTrainerItems(trainerID: number): Promise<Array<PokeItemsTemplate>>{
    //     const res = await this.instance.get<Array<PokeItemsTemplate>>(`/items/${trainerID}`);
    //     const trainerItems: Array<PokeItemsTemplate> = res.data;
    //     return trainerItems;
    // }

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
                pokemon.moves = [];
                pokemon.moves.push(await this.getPokemonMove(pokemon.move1));
                pokemon.moves.push(await this.getPokemonMove(pokemon.move2));
                pokemon.currentHP = pokemon.hp;
                trainerDex.push(pokemon);
            });
        });
        return trainerDex;
    }

    async getPokemonByID(id: number): Promise<PokemonTemplate> {
        let pokemon: PokemonTemplate;
        await this.instance.get<PokemonTemplate>(`/pokemon/${id}`)
            .then( async (res) => {                                   
                const pokemon: PokemonTemplate = res.data;
                pokemon.currentHP = pokemon.hp;
                pokemon.moves?.push(await this.getPokemonMove(res.data.move1));
                pokemon.moves?.push(await this.getPokemonMove(res.data.move2));
            })
            .catch( (err) => {
                console.log(err);
            });
        return pokemon!;
    }

    async getNewPokemonByPokedex(trainerID: number, pokedex: number): Promise<PokemonTemplate>{
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

    async postPokemonByID(id: number, trainerID: number): Promise<boolean> {
        let status: boolean;
        await this.instance.put(`/pokemon/${id}?trainerID=${trainerID}`)
            .then( (res) => {
                console.log(res);
                status = true;
            })
            .catch( (err) => {
                console.log(err);
                status = false;
            });
        return status!;
    }

    ////// Pokemon Functions //////
    // async encounterRandomPokemon(tier: number): Promise<PokemonTemplate | null>{
    //     if(![1, 2, 3].includes(tier)){
    //         return null;
    //     }

    //     let pokemon: PokemonTemplate | null = null;
    //     await this.instance.get<PokemonTemplate>(`/trainers/999/pokemon?tier=${tier}`)
    //     .then(async (res) => {
    //         pokemon = res.data;
    //         pokemon.currentHP = pokemon.hp;
    //         pokemon.moves?.push(await this.getPokemonMove(pokemon.move1));
    //         pokemon.moves?.push(await this.getPokemonMove(pokemon.move2));
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     });
    //     return pokemon;
    // }

    // async catchPokemon(trainerID: number, pokemonID: number): Promise<void> {
    //     await this.instance.put(`pokemon/${pokemonID}?trainerID=${trainerID}`)
    //     .then((res) => {
    //         console.log(`Pokemon: ${pokemonID} set to trainer: ${trainerID}`);
    //     })
    //     .catch( (err) => {
    //         console.log('error', err);
    //     });
    // }

    async getPokemonMove(moveID: number): Promise<PokeMoveTemplate | null>{
        let moveData: PokeMoveTemplate | null = null;
        await this.instance.get<PokeMoveTemplate>(`/moves/${moveID}`)
        .then( (res) => {
            moveData = res.data;
        })
        .catch( (err) => {
            console.log(err);
        });
        return moveData;
    }

    // ////// Shop Items //////
    // async getItem(trainerID: number, store: boolean = true): Promise<PokeItemsTemplate | null>{
    //     let item: PokeItemsTemplate | null = null;
    //     await this.instance.get<PokeItemsTemplate>(`/items/${trainerID}?store=${store}`)
    //     .then( (res) => {
    //         item = res.data;
    //     });
    //     return item;
    // }

    // async deleteTrainerItemByID(trainerID: number, itemID: number): Promise<void>{
    //     await this.instance.put(`/items/${trainerID}?item_id=${itemID}`)
    //     .then( () => {
    //         console.log(`Item: ${itemID} deleted.`);
    //     });
    // }

    async save(t: PokemonMaster): Promise<void>{
        const url = `/trainers/${t.trainerID}?badges=${t.badges}&tier=${t.currentTier}&dollars=${t.dollars}`;
        await this.instance.post(url)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

export default ServerService