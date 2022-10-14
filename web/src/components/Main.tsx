import { useState, useEffect } from 'react';

import PokemonMaster from '../interfaces/master';
import Pokemon from './Pokemon';
import Menu from './Menu';
import { PokemonTemplate } from '../interfaces/pokemon';

export interface Props {
    trainer: PokemonMaster;
}

const Main = (props: Props) => {
    const [render, setRender] = useState(<><h4>Loading..</h4></>)
    const [refresh, setRefresh] = useState(false);
    const trainer = props.trainer;
    console.log(trainer);

    const setActive = (newActive: PokemonTemplate) => {
        console.log('new', newActive);
        trainer.activePokemon = newActive;
        setRefresh(true);
    }

    useEffect( () => {
        setRender(<>
            <div className='row'>
                <div className='col'><h2 className='text-center'>{trainer.name}</h2></div>
            </div>
            <div className='row'>
                <div className='col'><Pokemon pokemon={trainer.activePokemon}></Pokemon></div>
            </div>
            <div className='row'>
                <div className='col'><Menu trainer={trainer} callBack={setActive}></Menu></div>
            </div>
            </>);
        setRefresh(false);
    }, [refresh]);

    return (render);
}

export default Main;