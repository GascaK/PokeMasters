import { useEffect, useState } from 'react';
import instance from '../serverService'


const Type = (props) => {
    const type = "type " + props.type;
    return (<>
        <div className={type}>
            {props.type}
        </div>
    </>)
}

const Move = (props) => {
    const atkUrl = '/moves/' + props.atk;
    let data = {};
    const [loaded, setLoaded] = useState(<h4>Loading Moves..</h4>);

    useEffect(() => {
        instance.get(atkUrl)
        .then( (res) => {
            data = res.data;
            console.log(data);
            const type = "type " + data.mType;
            setLoaded(<>
            <div>
                <div className={type} style={{padding: 8 + 'px', display: "inline-block"}}>
                    {data.name}
                </div>
                <span>
                    <div>1xd{data.hit} S: {data.special}</div>
                </span>
            </div>
            </>);
        })
        .catch((err) => {
            console.log(err);
        });
    }, [props.atk]);


    return (<>
        {loaded}
    </>)
    
}

const Card = (props) => {
    let name = props.data.name;
    let type1 = props.data.type1;
    let type2 = props.data.type2;
    let move1 = props.data.move1;
    let move2 = props.data.move2;
    let maxHP = props.data.hp;
    let speed = props.data.speed;
    let speedText = speed;
    if (props.data.speed > 0){
        speedText = "+" + speed;
    }

    const [health, setHealth] = useState(maxHP);

    return (<>
        <div className="center">
            <h2>{name} sp {speedText}</h2>
        </div>
        <div>
            <Type type={type1} />
            <Type type={type2} />
        </div>
        <div>
            <button onClick={() => setHealth((lastHP) => lastHP - 1)} >-</button>
            <span> {health} / {maxHP} </span>
            <button onClick={() => setHealth((lastHP) => lastHP + 1)}>+</button>
            <button onClick={() => setHealth(maxHP)}>HEAL</button>
        </div>
        <div>
            <Move atk={move1} />
            <Move atk={move2} />
        </div>
    </>)
}

const Pokemon = () => {
    const pokeUrl = "pokemon/6";

    const [loaded, setLoaded] = useState(<h1>Loading..</h1>);
    useEffect(() => {
        instance.get(pokeUrl)
        .then( (response) => {
            let data = response.data;
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