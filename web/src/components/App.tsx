import { useEffect, useState } from 'react';

import PokemonMaster from '../interfaces/master';
import ServerService from '../serverService';
import Login from "./Login";
import Main from './Main';


const App = () => {
    const instance = new ServerService();
    const changeUser = async (newUser: number) => {
        refreshMaster(newUser);
    }

    const [renderData, setRenderData] = useState(<><Login callback={changeUser}></Login></>);

    const refreshMaster = async (trainerID: number) => {
        await instance.getPokemonMaster(trainerID)
        .then( (trainer) => {
            setRenderData(<><Main trainer={trainer} instance={instance} refreshMaster={refreshMaster}></Main></>)
        });
    }


    return (<>
        <div>{renderData}</div>
    </>)
}

export default App;