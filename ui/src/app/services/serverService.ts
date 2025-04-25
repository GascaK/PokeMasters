import axios from 'axios';

import { PokeItemsTemplate } from '../interfaces/pokeItems';
import { Trainer } from '../interfaces/trainer';
import { PokemonTemplate } from '../interfaces/pokemon';
import { CONFIGS } from '../env';

interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresIn: number;
}

export class ServerService {
    private cache: Map<string, CacheItem<any>> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    instance = axios.create({
        baseURL: `http://${CONFIGS.hostIP}/api/v1`,
        timeout: 10000,
        withCredentials: false,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    private getCacheKey(endpoint: string, params?: any): string {
        return `${endpoint}${params ? JSON.stringify(params) : ''}`;
    }

    private getFromCache<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > cached.expiresIn) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    private setCache<T>(key: string, data: T, expiresIn: number = this.CACHE_DURATION): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresIn
        });
    }

    private clearCache(): void {
        this.cache.clear();
    }

    ////// Player Functions //////
    async findPlayerByName(name: string): Promise<Trainer> {
        const cacheKey = this.getCacheKey('player/find', { name });
        const cached = this.getFromCache<Trainer>(cacheKey);
        if (cached) return cached;

        return await this.instance.get<Trainer>(`0/player/find?name=${name}`)
            .then(async (res) => {
                this.setCache(cacheKey, res.data);
                return res.data;
            }).catch((err) => {
                console.error(err);
                throw err;
            });
    }

    async getPlayer(username: number): Promise<Trainer> {
        const cacheKey = this.getCacheKey(`player/${username}`);
        const cached = this.getFromCache<Trainer>(cacheKey);
        if (cached) return cached;

        return await this.instance.get<Trainer>(`${username}/player/`)
            .then(async (res) => {
                this.setCache(cacheKey, res.data);
                return res.data;
            }).catch((err) => {
                console.error(err);
                throw err;
            });
    }

    async createPlayer(name: string): Promise<Trainer>{
        const body = name;
        return await this.instance.post<Trainer>(`0/player/`, body)
            .then(async (res) => {
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async patchPlayer(username: number, player: Trainer): Promise<Trainer> {
        const body = player;
        this.clearCache(); // Clear cache as player data is modified

        return await this.instance.patch<Trainer>(`${username}/player/`, body)
            .then(async (res) => {
                return res.data;
            }).catch((err) => {
                console.error(err);
                throw err;
            });
    }

    async getTrainerPokemon(username: number): Promise<Array<PokemonTemplate>> {
        const cacheKey = this.getCacheKey(`player/pokemon/${username}`);
        const cached = this.getFromCache<Array<PokemonTemplate>>(cacheKey);
        if (cached) return cached;

        return await this.instance.get<Array<PokemonTemplate>>(`${username}/player/pokemon`)
            .then(async (res) => {
                this.setCache(cacheKey, res.data);
                return res.data;
            }).catch((err) => {
                console.error(err);
                throw err;
            });
    }

    async getTrainerItems(username: number): Promise<Array<PokeItemsTemplate>> {
        const cacheKey = this.getCacheKey(`player/items/${username}`);
        const cached = this.getFromCache<Array<PokeItemsTemplate>>(cacheKey);
        if (cached) return cached;

        return await this.instance.get<Array<PokeItemsTemplate>>(`${username}/player/items`)
            .then(async(res) => {
                this.setCache(cacheKey, res.data);
                return res.data;
            }).catch((err) => {
                console.error(err);
                throw err;
            });
    }

    async deleteTrainerItems(username: number, item: PokeItemsTemplate): Promise<void> {
        this.clearCache(); // Clear cache as items are modified
        return await this.instance.delete<void>(`${username}/player/items?id=${item.id}`)
            .then(async(res) => {
                return res.data;
            }).catch((err) => {
                console.error(err);
                throw err;
            });
    }

    ////// Pokemon Functions //////
    async encounterStarters(username: number): Promise<Array<PokemonTemplate>>{
        return await this.instance.get<Array<PokemonTemplate>>(`${username}/player/starters`)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            })
    }

    async catchStarters(username: number, pokemon: PokemonTemplate): Promise<PokemonTemplate>{
        return await this.instance.post<PokemonTemplate>(`${username}/player/starters`, pokemon)
            .then( (res) => {
                console.log(res.data);
                return res.data;
            }).catch( (err) => {
                console.error(err);
                throw err;
            })
    }

    async encounterRandomPokemon(
        username: number, 
        tier: number, 
        items: Array<PokeItemsTemplate>,
        type: string | null=null
    ): Promise<PokemonTemplate> {
        if(![1, 2, 3, 4].includes(tier)){
            throw new Error("Invalid Tier");
        }

        const body = {
            "items": items,
            "tier": tier,
            "encounter_type": type
        }
        console.log("body", body);
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
        escapeChance: number = .15
    ): Promise<any> {
        const body = {
            "pokemon_id": pokemon_id,
            "items": items,
            "escape": escapeChance
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

    async starterItems(username: number): Promise<void>{
        return await this.instance.post<void>(`${username}/items/starter`)
            .then( () => {
                console.log("Balls added.")
            })
    }

    async deleteItems(username: number, item: PokeItemsTemplate): Promise<void>{
        return await this.instance.delete<void>(`${username}/items/delete?id=${item.id}`)
            .then(async (res) => {
                console.log(res.data);
                return res.data;
            })
            .catch( (err) => {
                console.error(err);
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
        const url = `${username}/items/shop?tier=${tier}&shop_size=${shop_size}`;

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

    async postItemsUpgrade(username: number, pokemon_id: number, items: Array<PokeItemsTemplate>): Promise<Trainer>{
        const body = {
            "pokemon_id": pokemon_id,
            "items": items
        }

        return await this.instance.post<Trainer>(`${username}/pokemon/upgrade`, body)
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