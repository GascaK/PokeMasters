import axios, { Axios } from 'axios';

import { PokeItemsTemplate } from '../interfaces/pokeItems';
import { PokemonMaster } from '../interfaces/pokeMaster';
import { Trainer } from '../interfaces/trainer';
import { PokemonTemplate, PokeMoveTemplate } from '../interfaces/pokemon';

export class ServerService {
    instance = axios.create({
        baseURL: 'http://127.0.0.1:8000/api/v1',
        timeout: 10000,
        withCredentials: false,
        headers: {
        'Content-Type': 'application/json'
        }
    });

    ////// Player Functions //////
    async getPlayer(username: number): Promise<Trainer>{
        return await this.instance.get<Trainer>(`${username}/player`)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async postPlayer(username: number, name: string): Promise<Trainer>{
        const body = name;
        return await this.instance.post<Trainer>(`${username}/player`, body)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async patchPlayer(username: number, player: Trainer): Promise<Trainer>{
        const body = player;

        return await this.instance.patch<Trainer>(`${username}/player`, body)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async getTrainerPokemon(username: number): Promise<Array<PokemonTemplate>>{
        return await this.instance.get<Array<PokemonTemplate>>(`${username}/player/pokemon`)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async getTrainerItems(username: number): Promise<Array<PokeItemsTemplate>>{
        return await this.instance.get<Array<PokeItemsTemplate>>(`${username}/player/items/`)
            .then(async(res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async deleteTrainerItems(username: number, item: PokeItemsTemplate): Promise<void>{
        return await this.instance.delete<void>(`${username}/player/items?id=${item.id}`)
            .then(async(res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    ////// Pokemon Functions //////
    async encounterRandomPokemon(
        username: number, 
        tier: number, 
        type: string | null=null,
        items: Array<PokeItemsTemplate>
    ): Promise<PokemonTemplate> {
        if(![1, 2, 3, 4].includes(tier)){
            throw new Error("Invalid Tier");
        }

        const body = {
            "items": items,
            "tier": tier,
            "encounter_type": type
        }
        return await this.instance.post<PokemonTemplate>(`/${username}/pokemon/encounter`, body)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async catchRandomPokemon(
        username: number,
        pokemon_id: number,
        items: Array<PokeItemsTemplate>,
        escape: number = .15
    ): Promise<any> {
        const body = {
            "pokemon_id": pokemon_id,
            "items": items,
            "escape": escape
        }

        return await this.instance.put<any>(`/${username}/pokemon/encounter`, body)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async evolvePokemon(
        username: number,
        ids: Array<number>
    ): Promise<PokemonTemplate> {
        const body = ids

        return await this.instance.put<PokemonTemplate>(`/${username}/pokemon/evolve`, body)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    ////// Item Functions //////
    async getItems(username: number, id: number): Promise<PokeItemsTemplate>{
        return await this.instance.get<PokeItemsTemplate>(`${username}/items?id=${id}`)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async deleteItems(username: number, id: number): Promise<void>{
        return await this.instance.delete<void>(`${username}/items?id=${id}`)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            })
            .catch( (err) => {
                console.log(err);
                throw err;
            });
    }

    async postItemsRandom(username: number, tier: number=1): Promise<PokeItemsTemplate>{
        const body = tier;

        return await this.instance.post<PokeItemsTemplate>(`${username}/items/random`, body)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            })
            .catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async getItemsShop(username: number, tier: number=1, shop_size: number=5): Promise<Array<PokeItemsTemplate>>{
        const url = `${username}/items/shop?tier=${tier}?shop_size=${shop_size}`;

        return await this.instance.get<Array<PokeItemsTemplate>>(url)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            })
            .catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async postItemsShopBuy(username: number, item: PokeItemsTemplate): Promise<PokeItemsTemplate>{
        const body = item;

        return await this.instance.post<PokeItemsTemplate>(`${username}/items/shop/buy`, body)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            })
            .catch( (err) => {
                console.error(err);
                throw err;
            }); 
    }

    async postItemsShopSell(username: number, item: PokeItemsTemplate): Promise<Trainer>{
        const body = item;

        return await this.instance.post<Trainer>(`${username}/items/shop/sell`, body)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            })
            .catch( (err) => {
                console.error(err);
                throw err;
            }); 
    }
}

export default ServerService