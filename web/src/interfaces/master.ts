import ServerService from '../serverService';
import { PokeItemsTemplate } from './items';
import { PokemonTemplate } from './pokemon';


class PokemonMaster {
    public name: string = "";
    public currentTier: number = 1;
    public dollars: number = 0;
    private pokemon: Array<PokemonTemplate> = [];
    public items: Array<PokeItemsTemplate> = [];
    public badges: number = 0;
    public activePokemon: PokemonTemplate;
    public benchOne: PokemonTemplate;
    public benchTwo: PokemonTemplate;

    constructor(public trainerID: number, public instance: ServerService) {
    }

    increaseTier() { this.currentTier = this.currentTier < 3 ? this.currentTier + 1 : 3;}

    setDollars(newDollars: number) { this.dollars = newDollars; }

    getPokemon() { return this.pokemon; }

    setPokemon(newPokemon: Array<PokemonTemplate>) { this.pokemon = newPokemon; }

    async encounterPokemon(tier: number): Promise<PokemonTemplate> {
        let pokemon: PokemonTemplate | undefined = undefined;

        await this.instance.encounterRandomPokemon(this.trainerID, tier)
        .then( async (res) => {
            pokemon = res;
            pokemon.trainerID = -1;
            pokemon.moves = [];
            pokemon.moves.push(await this.instance.getPokemonMove(pokemon.move1));
            pokemon.moves.push(await this.instance.getPokemonMove(pokemon.move2));
            pokemon.currentHP = pokemon.hp;
        });
        return pokemon!;
    }

    catchPokemon(pokeID: number) {
        const indexOfObject = this.pokemon.findIndex( (poke: PokemonTemplate) => {
            return poke._id === pokeID;
        })
        if (indexOfObject !== -1) {
            this.pokemon.splice(indexOfObject, 1);
            this.instance.changeTrainerPokemonByID(this.trainerID, pokeID);
        }
    }

    removePokemon(pokeID: number) {
        const indexOfObject = this.pokemon.findIndex( (poke: PokemonTemplate) => {
            return poke._id === pokeID;
        })
        if (indexOfObject !== -1) {
            this.pokemon.splice(indexOfObject, 1);
        }
    }

    getItems() { return this.items; }

    setItems(newItems: Array<PokeItemsTemplate>) { this.items = newItems; }

    addItem(newItem: PokeItemsTemplate) { this.items.push(newItem); }

    removeItem(itemID: number) {
        const IndexOfObject = this.items.findIndex( (item: PokeItemsTemplate) => {
            return item._id === itemID;
        })
        if (IndexOfObject !== -1) {
            this.items.splice(IndexOfObject, 1);
        }

        this.instance.deleteTrainerItemByID(this.trainerID, itemID);
    }

    setBench(one: PokemonTemplate, two: PokemonTemplate) {
        this.benchOne = one;
        this.benchTwo = two;
    }

    async getShop(numberOfItems: number): Promise<Array<PokeItemsTemplate>>{
        const shop: Array<PokeItemsTemplate> = [];
        for(var i=0; i<numberOfItems; i++){
            const item = await this.instance.getShopItem(this.trainerID)
            .then( (shopItem) => {
                shop.push(shopItem);
            })
        }
        return shop;
    }
}

export default PokemonMaster;