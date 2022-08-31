import { useEffect, useState } from 'react';
import AxiosInstance from '../serverService'


const Type = (props) => {
    return (<>
        <div className="type {props.type}">
            <h5>{props.type}</h5>
        </div>
    </>)
}

const Card = (props) => {
    let name = props.data.name;
    let type1 = props.data.type1;
    let type2 = props.data.type2;
    let maxHP = props.data.hp;
    let speed = props.data.speed;

    const [health, setHealth] = useState(maxHP);

    return (<>
        <span className="center">
            <div><h2>{name}</h2></div>
        </span>
        <span>
            <Type type={type1} />
            <Type type={type2} />
        </span>
        <div>
            <button onClick={() => setHealth((lastHP) => lastHP - 1)} >-</button>
            <span> {health} / {maxHP} </span>
            <button onClick={() => setHealth((lastHP) => lastHP + 1)}>+</button>
        </div>
    </>)
}

const Pokemon = () => {
    const instance = AxiosInstance.getInstance()
    const pokeUrl = "pokemon/8";
    let data;

    const [loaded, setLoaded] = useState(<h1>Loading..</h1>);
    useEffect(() => {
        instance.get(pokeUrl)
        .then( (response) => {
            data = response.data;
            console.log(data);
            setLoaded(<Card data={data}/>)
        })
        .catch( (error) => {
            console.log(error);
        });
    }, []);
    

    return (<>
        <div>{loaded}</div>
    </>)
    
}

export default Pokemon