import VisitCity from './VisitCity';
import WildEncounter from './WildEncounter';
import Backpack from './Backpack';
import Pokedex from './Pokedex';

const Menu = (props) => {
    const trainer = props.trainer;
    const tier = props.tier;

    return (
        <>
            <div className='row'><Pokedex trainer={trainer} text={'PokeDEX'} /></div>
            <div className='row'><Backpack trainer={trainer} text={'Backpack'} /></div>
            <div className='row'><VisitCity trainer={trainer} text={'Enter the City'} /></div>
            <div className='row'><WildEncounter trainer={trainer} tier={tier} text={'Encounter'} /></div>
        </>
    )
}

export default Menu;