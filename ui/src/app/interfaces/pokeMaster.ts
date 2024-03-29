import ServerService from '../services/serverService';

import { PokeItemsTemplate } from './pokeItems';
import { PokemonTemplate } from './pokemon';
import { Trainer } from "./trainer";


export class PokemonMaster implements Trainer{
    name: string = "";
    currentTier: number = 0;
    dollars: number = 0;
    pokemon: Array<PokemonTemplate> = [];
    items: Array<PokeItemsTemplate> = [];
    badges: number = 0;
    activePokemon: PokemonTemplate | undefined;
    benchOne?: PokemonTemplate;
    benchTwo?: PokemonTemplate;
    evolveMinimum = 3;

    constructor(public trainerID: number, public instance: ServerService) {

    }

    getCurrentTier(): number {
        if (this.badges < 3){
            this.currentTier=1;
        } else if (this.badges < 6 ){
            this.currentTier=2;
        } else {
            this.currentTier=3;
        }
        return this.currentTier;
    }

    spendDollars(cost: number): boolean {
        if (this.dollars < cost){
            return false;
        } else {
            this.dollars -= cost;
            return true;
        }
    }

    getDollars(pay: number): void {
        this.dollars += pay;
    }

    getBadges(): number {
        return this.badges;
    }

    setBadges(badges: number): void {
        this.badges = badges;
    }

    saveAll(): void {
        this.instance.save(this);
    }

    async evolvePokemon(pokemonToDelete: Array<PokemonTemplate>): Promise<number> {
        let evolutionID = pokemonToDelete[0].pokedex + 1;

        pokemonToDelete.forEach( (pokemon) => {
            this.instance.changePokemonTrainerByID(pokemon._id, 999);
            let index = this.pokemon.indexOf(pokemon, 0);
            if (index > -1) {
                this.pokemon.splice(index, 1);
            }
        });

        let evolvedPokemon = await this.instance.getNewPokemonByPokedex(this.trainerID, evolutionID);
        let evolvedPokemonID = evolvedPokemon._id;
        this.pokemon.push(evolvedPokemon);
        return evolvedPokemonID;
    }

    async encounterRandomPokemonByTier(tier: number): Promise<PokemonTemplate> {
        let pokemonToCatch: PokemonTemplate;
        await this.instance.encounterRandomPokemon(tier)
            .then( (pokemon) => {
                pokemonToCatch = pokemon!;
            })
            .catch( (err) => {
                console.log("Unable to encounter pokemon.")
            });
        return pokemonToCatch!;
    }

    catchPokemon(wildPokemon: PokemonTemplate) {
        this.pokemon.push(wildPokemon);
        this.instance.changePokemonTrainerByID(wildPokemon._id, this.trainerID);
    }

    async getRandomItem(): Promise<PokeItemsTemplate> {
        const item = await this.instance.getItem(this.trainerID, false);
        await this.instance.buyItem(this.trainerID, item._id);
        this.items.push(item);
        console.log(`Got Item!: ${item.name}`);
        return item;
    }

    async buyItem(item: PokeItemsTemplate) {
        await this.instance.buyItem(this.trainerID, item._id);
        this.items.push(item);
        console.log(`Got Item!: ${item.name}`);
    }

    removeItem(itemID: number) {
        const IndexOfObject = this.items.findIndex( (item: PokeItemsTemplate) => {
            return item._id === itemID;
        })
        if (IndexOfObject !== -1) {
            this.items.splice(IndexOfObject, 1);
        }

        this.instance.deleteTrainerItemByID(this.trainerID, itemID);
    }

    // setBench(one: PokemonTemplate, two: PokemonTemplate) {
    // }

    async getShop(numberOfItems: number): Promise<Array<PokeItemsTemplate>>{
        const shop: Array<PokeItemsTemplate> = [];
        for(var i=0; i<numberOfItems; i++){
            await this.instance.getItem(this.trainerID)
                .then( (shopItem) => {
                    let maxPrice = 0;
                    if (this.currentTier == 1) {
                        maxPrice = 500;
                    } else if (this.currentTier == 2) {
                        maxPrice = 1000;
                    } else {
                        maxPrice = 1000000;
                    }
                    if (shopItem.cost >= 0 && shopItem.cost <= maxPrice) {
                        shop.push(shopItem);
                    } else {
                        i--;
                    }
                })
        }
        return shop;
    }

    async saveState(): Promise<void>{
        this.instance.save(this);
    }
}