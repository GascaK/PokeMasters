import { useState } from 'react';

import Menu from './Menu';
import Pokemon from './Pokemon';
import Bench from './Bench';

const Main = (props) => {
    const data = props.data;
    const [active, setActive] = useState(data.poke1);
    const [bench1, setBench1] = useState(data.poke2);
    const [bench2, setBench2] = useState(data.poke3);

    const setTeam = (newActive) => {
        console.log('Setting Active', newActive);
        if(newActive === bench1) {
            setBench1(active);
        } else if (newActive === bench2) {
            setBench2(active);
        } else {
            return
        }
        setActive(newActive);
    }

    return (<>
        <div className='row'>
            <div className='col'><h2 className='text-center'>{data.name}</h2></div>
        </div>
        <div className='row'>
            <div className='col'><Pokemon trainer={props.trainer} active={active} /></div>
        </div>
        <div className='row'>
            <div className='col'><h3 className='text-center'>Bench</h3></div>
        </div>
        <div className='row'>
            <div className='col'><Bench trainer={props.trainer} bench={bench1} callBack={setTeam}/></div>
            <div className='col'><Bench trainer={props.trainer} bench={bench2} callBack={setTeam}/></div>
        </div>
        <div className='row'>
            <div className='col'><h3 className='text-center'>Menu</h3></div>
        </div>
        <div className='row'>
            <div className='col'><Menu trainer={props.trainer} tier={data.tier} /></div>
        </div>
    </>)
}

export default Main