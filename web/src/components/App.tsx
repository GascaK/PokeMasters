import { useEffect, useState } from 'react';

import PokemonMaster from '../interfaces/master';
import ServerService from '../serverService';
import Login from "./Login";
import Main from './Main';


const App = () => {
    const instance = new ServerService();

    const changeUser = async (newUser: number) => {
        console.log("User", newUser);
        await instance.getPokemonMaster(newUser)
        .then( (trainer) => {
            setRenderData(<><Main trainer={trainer}></Main></>)
        });
        
    }
    const [renderData, setRenderData] = useState(<><Login callback={changeUser}></Login></>);

    return (<>
        <div>{renderData}</div>
    </>)
}

export default App;