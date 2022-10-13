import { useState } from 'react';
import PokemonMaster from '../interfaces/master';

export interface Props {
    trainer: PokemonMaster;
}

const Main = (props: Props) => {
    const trainer = props.trainer;
    console.log(trainer);
    
    return (<>
    <div className='row'>
        <div className='col'><h2 className='text-center'>{trainer.name}</h2></div>
    </div>
    </>)
}

export default Main;