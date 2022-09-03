import { useEffect, useState } from 'react';

import Menu from './components/Menu';
import Pokemon from './components/Pokemon';

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
        setLoad(<>
            <Menu trainer={trainer}/>
            <Pokemon trainer={trainer} active={8}/>
        </>)
        }
    }, [trainer]);

    return (load)
}

export default App