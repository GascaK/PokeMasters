import ServerService from '../services/serverService';

import { PokeItemsTemplate } from './pokeItems';
import { PokemonTemplate } from './pokemon';
import { PokeTeam, Bench } from './pokeTeam';
import { Trainer } from "./trainer";


export class PokemonMaster implements Trainer{
    name: string = "";
    dollars: number = 500;
    badges: number = 0;
    pokemon: Array<PokemonTemplate> = [];
    items: Array<PokeItemsTemplate> = [];
    xpItems: Array<string> = [];

    team: PokeTeam;

    constructor(public id: number, public instance: ServerService) {
        this.build()
        this.team = new PokeTeam();
        this.team.active = new Bench();
        this.team.benchOne = new Bench();
        this.team.benchTwo = new Bench();
        this.xpItems = ['XP: Hp Up', 'XP: Speed Up', 'XP: Special Up', 'XP: Physical Up'];
    }

    async build(): Promise<void> {
        this.reloadPlayer();
        this.reloadPokemon();
        this.reloadItems();
    }

    async reloadPlayer(): Promise<void>{
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
    }
    async reloadPokemon(): Promise<void>{
        await this.instance.getTrainerPokemon(this.id)
            .then( (res) => {
                this.pokemon = res;
            })
            .catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async reloadItems(): Promise<void>{
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

    async encounterRandomPokemon(tier: number=1, items=[], type: string=""): Promise<PokemonTemplate> {
        return await this.instance.encounterRandomPokemon(
            this.id,
            tier,
            items,
            type
        ).then( (res) => {
            return res;
        }).catch( (err) => {
            console.error(err);
            throw err;
        });
    }

    async catchRandomPokemon(pokemon_id: number, items: Array<PokeItemsTemplate>=[], escapeChance: number=.15): Promise<any>{
        return await this.instance.catchRandomPokemon(
            this.id,
            pokemon_id,
            items,
            escapeChance=escapeChance
        ).then( (res) => {
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
            return res;
        }).catch( (err) => {
            console.error(err);
            throw err;
        });
    }

    async sellItem(item: PokeItemsTemplate): Promise<Trainer> {
        return await this.instance.postItemsShopSell(this.id, item)
            .then( (res) => {
                return res;
            }).catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async saveTrainer(): Promise<Trainer>{
        return this.instance.patchPlayer(this.id, this)
            .then( (res) => {
                return res;
            })
            .catch( (err) => {
                console.error(err);
                throw err;
            });
    }

    async updateXp(): Promise<PokeItemsTemplate>{
        if (this.team.active.pokemon === undefined){
            throw new Error("No active pokemon");
        }

        let name = "";
        if (Math.random() < .20) {
            name = Math.random() < .5? this.xpItems[0] : this.xpItems[1];
        } else {
            name = Math.random() < .5? this.xpItems[2]: this.xpItems[3];
        }
        const cost = ( name.toLowerCase().includes("special") || name.toLowerCase().includes("physical") ) ? 5: 1;

        const item: PokeItemsTemplate = {
            id: 0,
            owner: this.id,
            name: name,
            cost: cost,
            text: "XP Only Item",
            tier: 1
        };
        console.log('UpdateXP', item);

        await this.instance.postItemsUpgrade(this.id, this.team.active.pokemon!.id, [item]);
        return item;
    }
   
    
}