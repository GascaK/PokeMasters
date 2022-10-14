import PokemonMaster from "../interfaces/master";
import { PokemonTemplate } from "../interfaces/pokemon";
import Pokedex from "./Pokedex";

export interface Props {
    trainer: PokemonMaster;
    callBack: any;
}
const Menu = (props: Props) => {
    const pokedex = props.trainer.getPokemon();

    const setActive = (pokemon: string) => {
        const newMon: PokemonTemplate = JSON.parse(pokemon);
        props.callBack(newMon);
    }

    return (<>
        <div className='row'><Pokedex pokedex={pokedex} trainerID={props.trainer.trainerID} callBack={setActive}/></div>
        {/* <div className='row'><Backpack trainer={trainer} text={'Backpack'} /></div> */}
        {/* <div className='row'><VisitCity trainer={trainer} text={'Enter the City'} /></div> */}
        {/* <div className='row'><WildEncounter trainer={trainer} tier={tier} text={'Encounter'} /></div> */}
    </>)
}

export default Menu;