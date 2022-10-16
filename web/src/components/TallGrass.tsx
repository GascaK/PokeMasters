import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import PokemonMaster from "../interfaces/master";
import { PokemonTemplate, PokeMoveTemplate } from '../interfaces/pokemon';


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

const Type = (props: {type: string}) => {
    const type = "type " + props.type;
    return (<>
        <div className={type}>
            {props.type}
        </div>
    </>)
}

export interface Props{
    trainer: PokemonMaster
    refresh: any;
}
const TallGrass = (props: Props) => {
    const [show, setShow] = useState(false);
    const [data, setData] = useState(<>Loading..</>);
    let wildPokemon: PokemonTemplate | undefined;

    const randomEncounter = async () => {
        const tier: number = props.trainer.currentTier;
        const id: number = props.trainer.trainerID;

        props.trainer.encounterPokemon(tier)
        .then((res) => {
            wildPokemon = res;
            const imgFile = res.pokedex < 10 ? '00' + res.pokedex : res.pokedex < 100 ? '0' + res.pokedex : res.pokedex;
            const imgLoc = `${process.env.PUBLIC_URL}/imgs/${imgFile}.png`;
            setData(<>
            <div className='row'>
                <div className='col'><Type type={res.type1} /></div>
                <div className='col'><Type type={res.type2} /></div>
                <div className='col'><h4>Tier: {res.tier}</h4></div>
            </div>
            <div className='row'>
                <div className='col'><h3>{res.name}</h3></div>
                <div className='col'><h4>HP: {res.hp}</h4></div>
                <div className='col'><h4>S:{res.speed}</h4></div>
            </div>
            <div className='row'>
                <img src={imgLoc} alt={res.name} className='img-rounded pokeimage'/>
            </div>
            <div className='row'>
                <div className='col'><Move atk={res.moves ? res.moves[0] : undefined} /></div>
                <div className='col'><Move atk={res.moves ? res.moves[1] : undefined} /></div>
            </div>
            </>);
        })
        .catch((err) => {
            console.log(err);
        });
    }

    const handleRun = () => {
        if (wildPokemon) {
            props.trainer.removePokemon(wildPokemon._id);
        }
        setShow(false);
    }

    const handleCatch = () => {
        if (wildPokemon) {
            props.trainer.catchPokemon(wildPokemon._id);
        }
        setShow(false);
    }
    
    useEffect( () => {
        // Adding random pokemon to trainers.
        randomEncounter();
        props.refresh();
    }, [show]);

        
    return (<>
        <Button onClick={() => setShow(true)} className="primary border">
            Tall Grass!
        </Button>
        <Modal show={show} onHide={handleRun}>
            <Modal.Header closeButton>
                <Modal.Title>Wild Pokemon</Modal.Title>
            </Modal.Header>

            <Modal.Body>
            {data}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={handleCatch}>Catch!</Button>
                <Button variant="secondary" onClick={handleRun}>Run Away.</Button>
            </Modal.Footer>
        </Modal>
    </>)
};

export default TallGrass;