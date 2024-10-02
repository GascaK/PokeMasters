import { PokeItemsTemplate } from "./pokeItems";


export interface PokeBaseTemplate {
    dex_id: number;
    name: string;
    tier: number;
    catch_rate: number;
    hp: number;
    speed: number;
    special: number;
    physical: number;
    types: Array<string>;
    evolutions: Array<number>;
}

export interface PokeStatsTemplate {
    name: string;
    mod: number;
    value: number;
}

export interface PokeSpriteTemplate{
    shiny: boolean;
    sprite_url: string;
}

export interface PokeSpecialTemplate{
    id: number,
    name: string;
    text: string;
}

export interface PokeMoveTemplate {
    id: number;
    name: string;
    move_type: string;
    tier: number;
    hit: string;
    special: PokeSpecialTemplate;
}

export interface PokemonTemplate {
    id: number;
    owner: number;
    moves: Array<PokeMoveTemplate>;
    stats: Array<PokeStatsTemplate>;
    items?: Array<PokeItemsTemplate>;
    sprite: PokeSpriteTemplate;
    base: PokeBaseTemplate;
}