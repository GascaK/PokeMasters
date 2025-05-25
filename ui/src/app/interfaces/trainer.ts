import { PokeItemsTemplate } from './pokeItems';
import { PokemonTemplate } from './pokemon';


export interface Trainer {
    id?: number;
    name: string;
    badges: number;
    dollars: number;
    pokemon?: Array<PokemonTemplate>;
    items?: Array<PokeItemsTemplate>
}

export interface Trades {
    id?: number;
    id_one: number;
    id_two: number;
    state_one: number;
    state_two: number;
}