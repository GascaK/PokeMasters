import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import instance from '../serverService';
import { Move, Type } from './Pokemon';

const images = require.context('../../public/imgs', true);

const WildEncounter = (props) => {
    const [show, setShow] = useState(false);
    const [data, setData] = useState(<h1>loading..</h1>);
    const [pokeID, setPokeID] = useState(-1);
    const [reload, setReload] = useState(0);

    const refetch = () => setReload(prev => prev + 1);

    const handleClose = () => {
        setShow(false);
        refetch();
    };
    const handleShow = () => setShow(true);
    const handleRun = () => {
        instance.put(`/pokemon/${pokeID}?trainerID=-1`)
        .then(console.log('Succesfully run away pokemon.'))
        .catch(err => console.log(err));
        handleClose();
    };

    const getData = async () => {
        const { data } = await instance.get(`/trainers/${props.trainer}/pokemon?tier=${props.tier}`);
        const pokedex = data.pokedex;

        const imgFile = pokedex < 10 ? '00' + pokedex : pokedex < 100 ? '0' + pokedex : pokedex;
        const imgLoc = `${process.env.PUBLIC_URL}/imgs/${imgFile}.png`;

        setPokeID(data._id);
        setData(
            <>
            <div className='row'>
                <div className='col'><Type type={data.type1} /></div>
                <div className='col'><Type type={data.type2} /></div>
            </div>
            <div className='row'>
                <div className='col'><h3>{data.name}</h3></div>
                <div className='col'><h4>HP: {data.hp}</h4></div>
                <div className='col'><h4>S:{data.speed}</h4></div>
            </div>
            <div className='row'>
                <img src={imgLoc} alt={data.name} className='img-rounded pokeimage'/>
            </div>
            <div className='row'>
                <div className='col'><Move atk={data.move1} /></div>
                <div className='col'><Move atk={data.move2} /></div>
            </div>
            </>
        )
    }

    useEffect(() => {
        getData();
    }, []);
    useEffect(() => {
        getData();
    }, [reload]);

    return (<>
        <Button onClick={handleShow} className="primary border">
            {props.text}
        </Button>
        <Modal show={show} onHide={handleRun}>
            <Modal.Header closeButton>
                <Modal.Title>{props.text}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
            {data}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>Catch!</Button>
                <Button variant="secondary" onClick={handleRun}>Run Away.</Button>
            </Modal.Footer>
        </Modal>
    </>)
}

export default WildEncounter