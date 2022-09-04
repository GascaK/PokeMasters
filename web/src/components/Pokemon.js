import { useEffect, useState } from 'react';
import instance from '../serverService'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'

const images = require.context('../../public/imgs', true);

export const Type = (props) => {
    const type = "type " + props.type;
    return (<>
        <div className={type}>
            {props.type}
        </div>
    </>)
}

export const Move = (props) => {
    const atkUrl = '/moves/' + props.atk;
    const [loaded, setLoaded] = useState(<h4>Loading Moves..</h4>);

    useEffect(() => {
        instance.get(atkUrl)
        .then( (res) => {
            let data = res.data;
            console.log(data);
            const type = "type " + data.mType + ' col';
            setLoaded(<>
            <div className='row'>
                <div className={type}>
                    <h2>{data.name}</h2>
                </div>
                <div className='col'>
                    <div><h1>1xd{data.hit} S: {data.special}</h1></div>
                </div>
            </div>
            </>);
        })
        .catch((err) => {
            console.log(err);
        });
    }, [atkUrl]);


    return (<>
        {loaded}
    </>)
    
}

const Card = (props) => {
    const pokedex = props.data.pokedex;

    const imgFile = pokedex < 10 ? '00' + pokedex : pokedex < 100 ? '0' + pokedex : pokedex;
    const imgLoc = `${process.env.PUBLIC_URL}/imgs/${imgFile}.png`;

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
    <Container className='border border-4 left'>
        <div className='row'>
            <div className='col'><h1 className='center'>{name}</h1></div>
            <div className='col text-right'><h4>sp {speedText}</h4></div>
        </div>
        <div className='row'>
            <div className='col-4'><Type type={type1} /></div>
            <div className='col-4'><Type type={type2} /></div>
        </div>
        <div className='row'>
            <img src={imgLoc} alt={name} className='img-rounded pokeimage'/>
        </div>
        <div className='row'>
            <Button onClick={() => setHealth((lastHP) => lastHP - 1)} className='col'>-</Button>
            <div className='col text-center'> <h3>{health} / {maxHP}</h3> </div>
            <Button onClick={() => setHealth((lastHP) => lastHP + 1)} className='col'>+</Button>
            <Button onClick={() => setHealth(maxHP)} className='col'>HEAL</Button>
        </div>
        <div className='row'>
            <div className='col'><Move atk={move1} /></div>
        </div>
        <div className='col'>
            <div className='col'><Move atk={move2} /></div>
        </div>
    </Container>
    </>)
}

const Pokemon = (props) => {
    const pokeUrl = "pokemon/" + props.active;

    const [loaded, setLoaded] = useState(<h1>Loading..</h1>);
    useEffect(() => {
        instance.get(pokeUrl)
        .then( (response) => {
            let data = response.data;
            console.log(data);
            setLoaded(<Card data={data} />)
        })
        .catch( (error) => {
            console.log(error);
        });
    }, [pokeUrl]);
    

    return (<>
        <div>{loaded}</div>
    </>)
    
}

export default Pokemon