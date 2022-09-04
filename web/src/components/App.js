import { useEffect, useState } from 'react';
import instance from '../serverService';
import Button from 'react-bootstrap/Button';

import Menu from './Menu';
import Pokemon from './Pokemon';

const App = () => {
    const [trainer, setTrainer] = useState(-1)
    const [load, setLoad] = useState(<><h1>Loading..</h1></>);

    useEffect(() => {
        if (trainer === -1) {
        setLoad(<>
            <Button onClick={() => setTrainer(1)}>Kevin</Button>
            <Button onClick={() => setTrainer(3)}>Chris</Button>
            <Button onClick={() => setTrainer(4)}>Erik</Button>
            <Button onClick={() => setTrainer(2)}>Kenneth</Button>
        </>);
        } else {
        instance.get(`trainers/${trainer}`)
        .then((res) => {
            const data = JSON.parse(res.data);
            setLoad(<>
            <div className='row'>
                <div className='col'><h2 className='text-center'>{data.name}</h2></div>
            </div>
            <div className='row'>
                <div className='col'><Pokemon trainer={trainer} active={data.poke1}/></div>
            </div>
            <div className='row'>
                <div className='col'><Menu trainer={trainer} tier={data.tier} /></div>
            </div>
            </>);
        })
        .catch((err) => console.log(err));
        }
    }, [trainer]);

    return (load)
}

export default App