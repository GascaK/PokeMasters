import { PokeItemsTemplate } from './pokeItems';
import { PokemonTemplate } from './pokemon';


export interface Trainer {
    trainerID: number;
    name: string;
    currentTier: number;
    dollars: number;
    pokemon: Array<PokemonTemplate>;
    items: Array<PokeItemsTemplate>
    badges: number;
}