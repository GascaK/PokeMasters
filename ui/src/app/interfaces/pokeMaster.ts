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
    activePokemon: PokemonTemplate;

    constructor(public trainerID: number, public instance: ServerService) {

    }

    getCurrentTier(): number {
        if (this.badges < 3){
            this.currentTier=0;
        } else if (this.badges < 6 ){
            this.currentTier=1;
        } else {
            this.currentTier=2;
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

    // catchPokemon(pokeID: number) {
    //     this.instance.changeTrainerPokemonByID(this.trainerID, pokeID);
    // }

    // removePokemon(pokeID: number) {
    //     const indexOfObject = this.pokemon.findIndex( (poke: PokemonTemplate) => {
    //         return poke._id === pokeID;
    //     })
    //     if (indexOfObject !== -1) {
    //         this.pokemon.splice(indexOfObject, 1);
    //     }
    // }

    // getItems() { return this.items; }

    // setItems(newItems: Array<PokeItemsTemplate>) { this.items = newItems; }

    // addItem(newItem: PokeItemsTemplate) { this.items.push(newItem); }

    // async getRandomItem() {
    //     const item: Array<PokeItemsTemplate> = [];
    //     item.push(await this.instance.getShopItem(this.trainerID));
    //     this.instance.instance.post(`/items/${this.trainerID}?item_id=${item[0]._id}`)
    //     .then( () => {
    //         alert(`Item got: ${item[0].name}`);
    //     });

    //     return item[0];
    // }

    // removeItem(itemID: number) {
    //     const IndexOfObject = this.items.findIndex( (item: PokeItemsTemplate) => {
    //         return item._id === itemID;
    //     })
    //     if (IndexOfObject !== -1) {
    //         this.items.splice(IndexOfObject, 1);
    //     }

    //     this.instance.deleteTrainerItemByID(this.trainerID, itemID);
    // }

    // setBench(one: PokemonTemplate, two: PokemonTemplate) {
    // }

    // async getShop(numberOfItems: number): Promise<Array<PokeItemsTemplate>>{
    //     const shop: Array<PokeItemsTemplate> = [];
    //     for(var i=0; i<numberOfItems; i++){
    //         const item = await this.instance.getShopItem(this.trainerID)
    //         .then( (shopItem) => {
    //             shop.push(shopItem);
    //         })
    //     }
    //     return shop;
    // }

    async saveState(): Promise<void>{
        console.log('b4 save', this);
        this.instance.save(this);
    }
}