import { PokeItemsTemplate } from "./pokeItems";
import { PokemonTemplate } from "./pokemon";

export class Bench {
    pokemon: PokemonTemplate | null;
    item: PokeItemsTemplate | null;
    currentHP: number = 0;
    maxHP: number = 0;
    speed: number = 0;
}

export class PokeTeam {
    active: Bench;
    benchOne: Bench;
    benchTwo: Bench;
}