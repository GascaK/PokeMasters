import { PokemonTemplate } from "../interfaces/pokemon";
import { PokeItemsTemplate } from "../interfaces/items";
import PokemonMaster from "../interfaces/master";

import Pokedex from "./Pokedex";
import Backpack from "./Backpack";
import VisitCity from "./VisitCity";
import TallGrass from "./TallGrass";

export interface Props {
    trainer: PokemonMaster;
    callBack: any;
    refresh: any;
}
const Menu = (props: Props) => {
    const pokedex = props.trainer.getPokemon();

    const setActive = (pokemon: string) => {
        const newMon: PokemonTemplate = JSON.parse(pokemon);
        props.callBack(newMon);
    }
    const useItem = (item: PokeItemsTemplate) => {
        props.trainer.removeItem(item._id);
        props.refresh();
    }
    const refreshAll = () => {
        props.refresh();
    }

    return (<>
        <div className='row'>
            <div className='col'><h3 className='text-center'>Menu</h3></div>
        </div>
        <div className='row'><Pokedex pokedex={pokedex} trainerID={props.trainer.trainerID} callBack={setActive}/></div>
        <div className='row'><Backpack items={props.trainer.getItems()} useItemCallBack={useItem}/></div>
        <div className='row'><VisitCity trainer={props.trainer} refresh={refreshAll}/></div>
        <div className='row'><TallGrass trainer={props.trainer} refresh={refreshAll}/></div>
    </>)
}

export default Menu;