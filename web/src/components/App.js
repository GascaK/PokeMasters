import { useEffect, useState } from 'react';
import instance from '../serverService';

import Login from './Login';
import Main from './Main';


const App = () => {
    const [user, setUser] = useState(0);
    const [data, setData] = useState();

    const getData = (trainer) => {
        instance.get(`trainers/${trainer}`)
        .then( (res) => {
            const info = JSON.parse(res.data);
            setData(info);
        })
        .catch((err) => console.log(err));
    }

    const changeUser = (newUser) => {
        getData(newUser);
        setUser(newUser);
    }

    if (!user) {
        return (<>
            <Login callBack={ changeUser } />
        </>)
    } else {
        if (data){
            return (<>
                <Main trainer={user} data={data} />
            </>)
        }
    }
}

export default App