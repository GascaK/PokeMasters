import axios, { Axios } from 'axios';

import { PokeItemsTemplate } from '../interfaces/pokeItems';
import { PokemonMaster } from '../interfaces/pokeMaster';
import { PokemonTemplate, PokeMoveTemplate } from '../interfaces/pokemon';

export class ServerService {
    instance = axios.create({
        baseURL: 'http://192.168.1.22:5000/',
        timeout: 12000,
        withCredentials: false,
        headers: {
        'Content-Type': 'text/plain'
        }
    });

    async getPokemonMaster(trainerID: number): Promise<PokemonMaster>{
        const trainer = new PokemonMaster(trainerID, this);
        await this.instance.get(`/trainers/${trainerID}`)
            .then(async (res) => {
                const data = JSON.parse(res.data);
                trainer.dollars = data.dollars;
                trainer.name = data.name;
                trainer.badges = data.badges;
                trainer.getCurrentTier();
                trainer.activePokemon = await this.getPokemonByID(data.poke1);
                trainer.pokemon = await this.getTrainerPokemon(trainerID);
                trainer.items = await this.getTrainerItems(trainerID);
                if (data.poke2) {
                    trainer.benchOne = await this.getPokemonByID(data.poke2);
                }
                if (data.poke3) {
                    trainer.benchTwo = await this.getPokemonByID(data.poke3);
                }
            });
        return trainer;
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
                pokemon.moves = [];
                pokemon.moves.push(await this.getPokemonMove(pokemon.move1));
                pokemon.moves.push(await this.getPokemonMove(pokemon.move2));
                pokemon.currentHP = pokemon.hp;
                trainerDex.push(pokemon);
            });
        });
        return trainerDex;
    }

    ////// Pokemon Functions //////
    async encounterRandomPokemon(tier: number): Promise<PokemonTemplate | undefined>{
        if(![1, 2, 3, 4].includes(tier)){
            throw new Error("Invalid Tier");
        }
        const res = await this.instance.get<PokemonTemplate>(`/trainers/999/pokemon?tier=${tier}`);
        if (res) {
            const pokemon = res.data;
            pokemon.currentHP = pokemon.hp;
            pokemon.moves = [];
            pokemon.moves.push(await this.getPokemonMove(pokemon.move1));
            pokemon.moves.push(await this.getPokemonMove(pokemon.move2));
            console.log("Pokemon");
            console.log(pokemon);
            return pokemon;
        } else {
            console.log("Error returning Pokemon.");
            return;
        }
    }
    // Release Pokemon.
    async changePokemonTrainerByID(id: number, trainerID: number): Promise<boolean> {
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

    async getPokemonByID(id: number): Promise<PokemonTemplate> {
        let pokemon: PokemonTemplate;
        await this.instance.get<PokemonTemplate>(`/pokemon/${id}`)
            .then( async (res) => {                                   
                pokemon = res.data;
                pokemon.currentHP = pokemon.hp;
                pokemon.moves = [];
                pokemon.moves.push(await this.getPokemonMove(pokemon.move1));
                pokemon.moves.push(await this.getPokemonMove(pokemon.move2));
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

    async getPokemonMove(moveID: number): Promise<PokeMoveTemplate>{
        let moveData: PokeMoveTemplate;
        await this.instance.get<PokeMoveTemplate>(`/moves/${moveID}`)
        .then( (res) => {
            moveData = res.data;
        })
        .catch( (err) => {
            console.log(err);
        });
        return moveData!;
    }

    // ////// Shop Items //////
    async getItem(trainerID: number, store: boolean = true): Promise<PokeItemsTemplate>{
        const item = await this.instance.get<PokeItemsTemplate>(`/items/${trainerID}?store=${store}`);
        return item.data;
    }

    async buyItem(trainerID: number, itemID: number) {
        await this.instance.post(`/items/${trainerID}?item_id=${itemID}`)
            .catch( (err) => {
                console.log(err);
            });
    }

    async deleteTrainerItemByID(trainerID: number, itemID: number): Promise<void>{
        await this.instance.put(`/items/${trainerID}?item_id=${itemID}`)
        .then( () => {
            console.log(`Item: ${itemID} deleted.`);
        });
    }

    async save(t: PokemonMaster): Promise<void>{
        let url = `/trainers/${t.trainerID}?badges=${t.badges}&tier=${t.currentTier}&dollars=${t.dollars}`;
        if (t.activePokemon) {
            url += `&poke1=${t.activePokemon._id}`;
        } else {
            url += "&poke1=0";
        }
        if (t.benchOne) {
            url += `&poke2=${t.benchOne._id}`;
        } else {
            url += "&poke2=0";
        }
        if (t.benchTwo) {
            url += `&poke3=${t.benchTwo._id}`;
        } else {
            url += "&poke3=0";
        }

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