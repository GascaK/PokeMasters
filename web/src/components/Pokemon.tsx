import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'

import { PokemonTemplate, PokeMoveTemplate } from "../interfaces/pokemon";

const Type = (props: {type: string}) => {
    const type = "type " + props.type;
    return (<>
        <div className={type}>
            {props.type}
        </div>
    </>)
}

const Move = (props: {atk: PokeMoveTemplate | undefined}) => {
    const move = props.atk;
    if(move == undefined){
        return (<><h4>Loading Moves</h4></>);
    }
    const type = "type " + move.mType + ' col';
    return (<>
        <div className='row'>
            <div className={type}>
                <h2>{move.name}</h2>
            </div>
            <div className='col'>
                <div><h1>1xd {move.hit}:  {move.special}</h1></div>
            </div>
        </div>
        </>)
}

export interface Props {
    pokemon: PokemonTemplate;
}
const Pokemon = (props: Props) => {
    const pokemon = props.pokemon;
    const [render, setRender] = useState(<><h3>Loading Pokemon Card</h3></>);
    const [health, setHealth] = useState(0);

    const renderCard = () => {
        if (pokemon == undefined){
            setRender(<><h3>Please choose an active Pokemon!</h3></>);
            return;
        }
        const imgFile = pokemon.pokedex < 10 ? '00' + pokemon.pokedex : pokemon.pokedex < 100 ? '0' + pokemon.pokedex : pokemon.pokedex;
        const imgLoc = `${process.env.PUBLIC_URL}/imgs/${imgFile}.png`;
        setRender(<>
            <Container className='border border-4 left'>
            <div className='row'>
                <div className='col'><h1 className='center'>{pokemon.name}</h1></div>
                <div className='col text-right'><h4>sp {pokemon.speed}</h4></div>
            </div>
            <div className='row'>
                <div className='col-4'><Type type={pokemon.type1} /></div>
                <div className='col-4'><Type type={pokemon.type2} /></div>
            </div>
            <div className='row'>
                <img src={imgLoc} alt={pokemon.name} className='img-rounded pokeimage'/>
            </div>
            <div className='row'>
                <Button onClick={() => setHealth((health): number => health - 1)} className='col'>-</Button>
                <div className='col text-center'> <h3>{health} / {pokemon.hp}</h3> </div>
                <Button onClick={() => setHealth((lastHP) => lastHP + 1)} className='col'>+</Button>
                <Button onClick={() => setHealth(pokemon.hp)} className='col'>HEAL</Button>
            </div>
            <div className='row'>
                <div className='col'><Move atk={pokemon.moves?.[0]} /></div>
            </div>
            <div className='col'>
                <div className='col'><Move atk={pokemon.moves?.[1]} /></div>
            </div>
            </Container>
        </>);
    }

    useEffect( () => {
        renderCard();
    }, [health]);

    useEffect( () => {
        if (pokemon) {
            setHealth(pokemon.hp);
        }
        renderCard();
    }, [pokemon])

    return (<>{render}</>)
}

export default Pokemon;