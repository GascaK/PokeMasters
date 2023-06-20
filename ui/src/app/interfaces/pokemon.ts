import { PokeItemsTemplate } from "./pokeItems";

export interface PokeMoveTemplate {
    _id: number;
    name: string;
    mType: string;
    tier: number;
    hit: number;
    special: string;
}

export interface PokemonTemplate {
    _id: number;
    pokedex: number;
    trainerID: number;
    name: string;
    type1: string;
    type2: string;
    hp: number;
    currentHP?: number;
    tier: number;
    move1: number;
    move2: number;
    moves?: Array<PokeMoveTemplate | null>;
    item?: PokeItemsTemplate | null;
    speed: number;
}