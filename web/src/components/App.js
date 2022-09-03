import { useEffect, useState } from 'react';
import instance from '../serverService';

import Menu from './Menu';
import Pokemon from './Pokemon';

const App = () => {
    const [trainer, setTrainer] = useState(-1)
    const [load, setLoad] = useState(<><h1>Loading..</h1></>);

    useEffect(() => {
        console.log(trainer);
        if (trainer === -1) {
        setLoad(<>
            <button onClick={() => setTrainer(0)}>Kevin</button>
            <button onClick={() => setTrainer(2)}>Chris</button>
            <button onClick={() => setTrainer(3)}>Erik</button>
            <button onClick={() => setTrainer(1)}>Kenneth</button>
        </>);
        } else {
        instance.get(`trainers/${trainer}`)
        .then((res) => {
            const data = JSON.parse(res.data);
            console.log('TrainerData', data.tier);
            setLoad(<>
                <Menu trainer={trainer} tier={data.tier} />
                <Pokemon trainer={trainer} active={data.poke1}/>
            </>)``
        })
        .catch(() => {});
        }
    }, [trainer]);

    return (load)
}

export default App