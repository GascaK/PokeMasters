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