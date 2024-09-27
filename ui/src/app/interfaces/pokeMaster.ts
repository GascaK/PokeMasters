import ServerService from '../services/serverService';

import { PokeItemsTemplate } from './pokeItems';
import { PokemonTemplate } from './pokemon';
import { Trainer } from "./trainer";


export class PokemonMaster implements Trainer{
    name: string = "";
    dollars: number = 500;
    badges: number = 0;
    pokemon: Array<PokemonTemplate> = [];
    items: Array<PokeItemsTemplate> = [];

    constructor(public id: number, public instance: ServerService) {
        this.build()
    }

    async build(): Promise<void> {
        await this.instance.getPlayer(this.id)
            .then( (res) => {
                this.name = res.name;
                this.dollars = res.dollars;
                this.badges = res.badges;
            })
            .catch( (err) => {
                console.error(err);
                throw err;
            });

        await this.instance.getTrainerPokemon(this.id)
            .then( (res) => {
                this.pokemon = res;
            })
            .catch( (err) => {
                console.error(err);
                throw err;
            });
        
        await this.instance.getTrainerItems(this.id)
            .then( (res) => {
                this.items = res;
            })
            .catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    getCurrentTier(): number {
        let tier = 0
        if (this.badges < 3){
            tier = 1
        } else if (this.badges < 6 ){
            tier = 2;
        } else {
            tier = 3;
        }
        return tier;
    }

    spendDollars(cost: number): number {
        if (this.dollars < cost){
            throw new Error("Not enough dollars.")
        } else {
            this.dollars -= cost;
        }

        this.saveTrainer();
        return this.dollars;
    }

    getDollars(pay: number): void {
        this.dollars += pay;
        this.saveTrainer();
    }

    getBadges(): number {
        return this.badges;
    }

    setBadges(badges: number): void {
        this.badges = badges;
        this.saveTrainer();
    }

    async encounterRandomPokemon(tier: number=1, type: string="", items=[]): Promise<PokemonTemplate> {
        return await this.instance.encounterRandomPokemon(
            this.id,
            tier,
            type,
            items
        ).then( (res) => {
            console.log(res);
            return res;
        }).catch( (err) => {
            console.error(err);
            throw err;
        });
    }

    async catchRandomPokemon(pokemon_id: number, items: Array<PokeItemsTemplate>=[], escape: number=.15): Promise<any>{
        return await this.instance.catchRandomPokemon(
            this.id,
            pokemon_id,
            items,
            escape=escape
        ).then( (res) => {
            console.log(res);
            return res;
        }).catch( (err) => {
            console.error(err);
            throw err;
        });
    }

    async evolvePokemon(ids: Array<number>): Promise<PokemonTemplate>{
        return await this.instance.evolvePokemon(
            this.id,
            ids
        ).then( (res) => {
            console.log(res);
            return res;
        }).catch( (err) => {
            console.error(err);
            throw err;
        });
    }

    async deleteItem(id: number): Promise<void>{
        return await this.instance.deleteItems(
            this.id,
            id
        ).then( (res) => {
            console.log(res);
            return res;
        }).catch( (err) => {
            console.error(err);
            throw err;
        });
    }

    async getRandomItem(tier: number=1): Promise<PokeItemsTemplate> {
        return await this.instance.postItemsRandom(
            this.id,
            tier=tier
        ).then( (res) => {
            console.log(res);
            return res;
        }).catch( (err) => {
            console.error(err);
            throw err;
        });
    }

    async getItemShop(tier: number=1, shop_size: number=5): Promise<Array<PokeItemsTemplate>>{
        return await this.instance.getItemsShop(
            this.id,
            tier=tier,
            shop_size=shop_size
        ).then( (res) => {
            console.log(res);
            return res;
        }).catch( (err) => {
            console.error(err);
            throw err;
        });
    }

    async buyItem(item: PokeItemsTemplate): Promise<PokeItemsTemplate>{
        return await this.instance.postItemsShopBuy(
            this.id,
            item
        ).then( (res) => {
            console.log(res);
            return res;
        }).catch( (err) => {
            console.error(err);
            throw err;
        });
    }

    async sellItem(item: PokeItemsTemplate): Promise<Trainer> {
        return await this.instance.postItemsShopSell(
            this.id,
            item
        ).then( (res) => {
            console.log(res);
            return res;
        }).catch( (err) => {
            console.error(err);
            throw err;
        });
    }

    async saveTrainer(): Promise<Trainer>{
        return this.instance.patchPlayer(this.id, this)
            .then( (res) => {
                console.log(res);
                return res;
            })
            .catch( (err) => {
                console.error(err);
                throw err;
            });
    }
}