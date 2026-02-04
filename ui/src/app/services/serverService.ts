import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

import { PokeItemsTemplate } from '../interfaces/pokeItems';
import { Trainer, Trades } from '../interfaces/trainer';
import { PokemonTemplate } from '../interfaces/pokemon';
import { CONFIGS } from '../env';

/** Normalized error response for consistent handling */
interface ApiError {
    status: number | null;
    message: string;
    originalError: AxiosError | Error;
}

export class ServerService {
    private instance: AxiosInstance;
    private logger = {
        debug: (msg: string, data?: unknown) => console.debug(`[ServerService] ${msg}`, data),
        error: (msg: string, data?: unknown) => console.error(`[ServerService] ${msg}`, data),
        info: (msg: string, data?: unknown) => console.info(`[ServerService] ${msg}`, data),
    };

    constructor() {
        const baseURL = `${window.location.protocol}//${CONFIGS.hostIP}:${CONFIGS.apiPort}/api/${CONFIGS.apiVersion}`;

        this.instance = axios.create({
            baseURL,
            timeout: 10000,
            withCredentials: false,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.setupInterceptors();
    }

    /**
     * Setup axios interceptors for logging and error normalization
     */
    private setupInterceptors(): void {
        this.instance.interceptors.request.use(
            (config) => {
                this.logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.instance.interceptors.response.use(
            (response) => {
                this.logger.debug(`← ${response.status} ${response.config.url}`);
                return response;
            },
            (error: AxiosError) => {
                const message = error.response?.statusText || error.message || 'Unknown error';
                const status = error.response?.status || null;
                this.logger.error(`✗ ${status || 'Network'} Error: ${message}`, error.response?.data);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Normalize axios errors into a consistent ApiError shape
     */
    private normalizeError(error: AxiosError | Error): ApiError {
        if (axios.isAxiosError(error)) {
            return {
                status: error.response?.status || null,
                message: error.response?.statusText || error.message || 'API error',
                originalError: error
            };
        }
        return {
            status: null,
            message: error.message || 'Unknown error',
            originalError: error
        };
    }

    /**
     * Build URL path with consistent slash handling
     */
    private buildPath(...segments: (string | number)[]): string {
        const parts = segments.map(s => String(s).replace(/^\/+|\/+$/g, ''));
        if (parts.length === 0) return '/';
        let path = '/' + parts[0];
        for (let i = 1; i < parts.length; i++) {
            const seg = parts[i];
            if (seg.startsWith('?') || seg.startsWith('&')) {
                path += seg;
            } else {
                path += '/' + seg;
            }
        }
        return path;
    }

    /**
     * Generic request helper to reduce boilerplate
     */
    private async request<T>(
        promise: Promise<AxiosResponse<T>>
    ): Promise<T> {
        try {
            const response = await promise;
            return response.data;
        } catch (error) {
            const apiError = this.normalizeError(error as AxiosError | Error);
            throw apiError;
        }
    }

    /**
     * Validate that username is a positive integer
     */
    private validateUsername(username: number): void {
        if (!Number.isInteger(username) || username < 0) {
            throw new Error(`Invalid username: ${username}`);
        }
    }

    ////// Player Functions //////
    async findPlayerByName(name: string): Promise<Trainer> {
        if (!name || name.trim().length === 0) {
            throw new Error('Player name cannot be empty');
        }
        const path = this.buildPath('0/player/find', `?name=${encodeURIComponent(name)}`);
        return this.request(this.instance.get<Trainer>(path));
    }

    async getPlayer(username: number): Promise<Trainer> {
        this.validateUsername(username);
        const path = this.buildPath(username, 'player');
        return this.request(this.instance.get<Trainer>(path));
    }

    async createPlayer(name: string): Promise<Trainer> {
        if (!name || name.trim().length === 0) {
            throw new Error('Player name cannot be empty');
        }
        const body = { name };
        const path = this.buildPath('0/player');
        return this.request(this.instance.post<Trainer>(path, body));
    }

    async patchPlayer(username: number, player: Trainer): Promise<Trainer> {
        this.validateUsername(username);
        if (!player) {
            throw new Error('Player object cannot be null');
        }
        const path = this.buildPath(username, 'player');
        return this.request(this.instance.patch<Trainer>(path, player));
    }

    async getTrainerPokemon(username: number): Promise<Array<PokemonTemplate>> {
        this.validateUsername(username);
        const path = this.buildPath(username, 'player/pokemon');
        return this.request(this.instance.get<Array<PokemonTemplate>>(path));
    }

    async getTrainerItems(username: number): Promise<Array<PokeItemsTemplate>> {
        this.validateUsername(username);
        const path = this.buildPath(username, 'player/items');
        return this.request(this.instance.get<Array<PokeItemsTemplate>>(path));
    }

    async deleteTrainerItems(username: number, item: PokeItemsTemplate): Promise<void> {
        this.validateUsername(username);
        if (!item || !item.id) {
            throw new Error('Invalid item: missing id');
        }
        const path = this.buildPath(username, 'player/items') + `?id=${item.id}`;
        await this.request(this.instance.delete<void>(path));
    }

    ////// Pokemon Functions //////
    async encounterStarters(username: number): Promise<Array<PokemonTemplate>> {
        this.validateUsername(username);
        const path = this.buildPath(username, 'player/starters');
        return this.request(this.instance.get<Array<PokemonTemplate>>(path));
    }

    async catchStarters(username: number, pokemon: PokemonTemplate): Promise<PokemonTemplate> {
        this.validateUsername(username);
        if (!pokemon || !pokemon.id) {
            throw new Error('Invalid pokemon: missing id');
        }
        const path = this.buildPath(username, 'player/starters');
        return this.request(this.instance.post<PokemonTemplate>(path, pokemon));
    }

    async getPokemon(id: number): Promise<PokemonTemplate | null> {
        if (id === -1) {
            return null;
        }
        if (!Number.isInteger(id) || id < 0) {
            throw new Error(`Invalid pokemon id: ${id}`);
        }
        const path = this.buildPath('0/pokemon') + `?id=${id}`;
        return this.request(this.instance.get<PokemonTemplate>(path));
    }

    async encounterRandomPokemon(
        username: number,
        tier: number,
        items: Array<PokeItemsTemplate>,
        type: string | null = null
    ): Promise<PokemonTemplate> {
        this.validateUsername(username);
        if (![1, 2, 3, 4].includes(tier)) {
            throw new Error(`Invalid tier: ${tier}. Must be 1, 2, 3, or 4`);
        }
        if (!Array.isArray(items)) {
            throw new Error('Items must be an array');
        }
        const body = {
            items,
            tier,
            encounter_type: type
        };
        const path = this.buildPath(username, 'pokemon/encounter');
        return this.request(this.instance.post<PokemonTemplate>(path, body));
    }

    async catchRandomPokemon(
        username: number,
        pokemon_id: number,
        items: Array<PokeItemsTemplate>,
        escapeChance: number = 0.15
    ): Promise<PokemonTemplate> {
        this.validateUsername(username);
        if (!Number.isInteger(pokemon_id) || pokemon_id < 0) {
            throw new Error(`Invalid pokemon_id: ${pokemon_id}`);
        }
        if (!Array.isArray(items)) {
            throw new Error('Items must be an array');
        }
        if (escapeChance < 0 || escapeChance > 1) {
            throw new Error('escapeChance must be between 0 and 1');
        }
        const body = {
            pokemon_id,
            items,
            escape: escapeChance
        };
        const path = this.buildPath(username, 'pokemon/encounter');
        return this.request(this.instance.put<PokemonTemplate>(path, body));
    }

    async evolvePokemon(
        username: number,
        ids: Array<number>
    ): Promise<PokemonTemplate> {
        this.validateUsername(username);
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('ids must be a non-empty array');
        }
        const path = this.buildPath(username, 'pokemon/evolve');
        return this.request(this.instance.put<PokemonTemplate>(path, ids));
    }

    async deletePokemon(
        username: number,
        id: number
    ): Promise<void> {
        this.validateUsername(username);
        if (!Number.isInteger(id) || id < 0) {
            throw new Error(`Invalid pokemon id: ${id}`);
        }
        const path = this.buildPath(username, 'pokemon/flee') + `?id=${id}`;
        await this.request(this.instance.delete<void>(path));
    }

    ////// Item Functions //////
    async getItems(username: number, id: number): Promise<PokeItemsTemplate> {
        this.validateUsername(username);
        if (!Number.isInteger(id) || id < 0) {
            throw new Error(`Invalid item id: ${id}`);
        }
        const path = this.buildPath(username, 'items') + `?id=${id}`;
        return this.request(this.instance.get<PokeItemsTemplate>(path));
    }

    async starterItems(username: number): Promise<void> {
        this.validateUsername(username);
        const path = this.buildPath(username, 'items/starter');
        await this.request(this.instance.post<void>(path, {}));
    }

    async deleteItems(username: number, item: PokeItemsTemplate): Promise<void> {
        this.validateUsername(username);
        if (!item || !item.id) {
            throw new Error('Invalid item: missing id');
        }
        const path = this.buildPath(username, 'items/delete') + `?id=${item.id}`;
        await this.request(this.instance.delete<void>(path));
    }

    async postItemsRandom(username: number, tier: number = 1): Promise<PokeItemsTemplate> {
        this.validateUsername(username);
        if (![1, 2, 3, 4].includes(tier)) {
            throw new Error(`Invalid tier: ${tier}. Must be 1, 2, 3, or 4`);
        }
        const body = { tier };
        const path = this.buildPath(username, 'items/random');
        return this.request(this.instance.post<PokeItemsTemplate>(path, body));
    }

    async getItemsShop(username: number, tier: number = 1, shop_size: number = 5): Promise<Array<PokeItemsTemplate>> {
        this.validateUsername(username);
        if (![1, 2, 3, 4].includes(tier)) {
            throw new Error(`Invalid tier: ${tier}. Must be 1, 2, 3, or 4`);
        }
        if (!Number.isInteger(shop_size) || shop_size <= 0) {
            throw new Error(`Invalid shop_size: ${shop_size}. Must be a positive integer`);
        }
        const path = this.buildPath(username, 'items/shop') + `?tier=${tier}&shop_size=${shop_size}`;
        return this.request(this.instance.get<Array<PokeItemsTemplate>>(path));
    }

    async postItemsShopBuy(username: number, item: PokeItemsTemplate): Promise<PokeItemsTemplate> {
        this.validateUsername(username);
        if (!item || !item.id) {
            throw new Error('Invalid item: missing id');
        }
        const path = this.buildPath(username, 'items/shop/buy');
        return this.request(this.instance.post<PokeItemsTemplate>(path, item));
    }

    async postItemsShopSell(username: number, item: PokeItemsTemplate): Promise<Trainer> {
        this.validateUsername(username);
        if (!item || !item.id) {
            throw new Error('Invalid item: missing id');
        }
        const path = this.buildPath(username, 'items/shop/sell');
        return this.request(this.instance.post<Trainer>(path, item));
    }

    async postItemsUpgrade(username: number, pokemon_id: number, items: Array<PokeItemsTemplate>): Promise<Trainer> {
        this.validateUsername(username);
        if (!Number.isInteger(pokemon_id) || pokemon_id < 0) {
            throw new Error(`Invalid pokemon_id: ${pokemon_id}`);
        }
        if (!Array.isArray(items)) {
            throw new Error('Items must be an array');
        }
        const body = {
            pokemon_id,
            items
        };
        const path = this.buildPath(username, 'pokemon/upgrade');
        return this.request(this.instance.post<Trainer>(path, body));
    }

    ////// Trade Functions //////
    async getTrades(username: number): Promise<Array<Trades>> {
        this.validateUsername(username);
        const path = this.buildPath(username, 'trades/all');
        return this.request(this.instance.get<Array<Trades>>(path));
    }

    async updateTrades(username: number, trade: Trades): Promise<Trades> {
        this.validateUsername(username);
        if (!trade) {
            throw new Error('Trade object cannot be null');
        }
        const path = this.buildPath(username, 'trades/update');
        return this.request(this.instance.patch<Trades>(path, trade));
    }

    async updatePokemonOwner(id: number, trainer: number): Promise<void> {
        if (!Number.isInteger(id) || id < 0) {
            throw new Error(`Invalid pokemon id: ${id}`);
        }
        this.validateUsername(trainer);
        const body = {
            owner: trainer,
            pokemon_id: id
        };
        const path = this.buildPath('0/pokemon/trade');
        await this.request(this.instance.patch<void>(path, body));
    }

    async startTrade(username: number, pokemon: PokemonTemplate): Promise<Trades> {
        this.validateUsername(username);
        if (!pokemon || !pokemon.id) {
            throw new Error('Invalid pokemon: missing id');
        }
        const body = {
            id_one: pokemon.id,
            id_two: -1,
            state_one: 1,
            state_two: 0
        };
        const path = this.buildPath(username, 'trades/create');
        return this.request(this.instance.post<Trades>(path, body));
    }
}

export default ServerService;