import { useState, useEffect } from 'react';

import PokemonMaster from '../interfaces/master';
import Pokemon from './Pokemon';
import Menu from './Menu';
import Stats from './Stats';
import { PokemonTemplate } from '../interfaces/pokemon';
import ServerService from '../serverService';

export interface Props {
    trainer: PokemonMaster;
    instance: ServerService;
    refreshMaster: any;
}
const Main = (props: Props) => {
    const [render, setRender] = useState(<><h4>Loading..</h4></>)
    const [refresh, setRefresh] = useState(false);
    let trainer = props.trainer;

    const setActive = async (newActive: PokemonTemplate) => {
        const trainerID = trainer.trainerID;
        await props.instance.getPokemonMaster(trainerID)
        .then( (res) => {
            trainer = res;
            trainer.activePokemon = newActive;
            getRender();
        });
    }

    const refreshCallBack = () => {
        props.refreshMaster(trainer.trainerID);
        setRefresh(true);
    }

    const getRender = () => {
        setRender(<>
            <div className='row'>
                <div className='col'><h2 className='text-center'>{trainer.name}</h2></div>
            </div>
            <div className='row'>
                <div className='col'><Pokemon pokemon={trainer.activePokemon}></Pokemon></div>
            </div>
            <div className='row'>
                <div className='col'><Menu trainer={trainer} callBack={setActive} refresh={refreshCallBack}></Menu></div>
            </div>
            <div className='row'>
                <div className='col'><Stats trainer={trainer} /></div>
            </div>
            </>);
    }

    useEffect( () => {
        getRender();
        setRefresh(false);
    }, [refresh]);

    useEffect( () => {
        getRender();
    }, [trainer]);

    return (render);
}

export default Main;