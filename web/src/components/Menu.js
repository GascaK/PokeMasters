import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import instance from '../serverService';
import { Move, Type } from './Pokemon';

const images = require.context('../../public/imgs', true);

const MenuButton = (props) => {
    const [show, setShow] = useState(false);
    const [modal, setModal] = useState(<h1>loading..</h1>);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        instance.get(`/trainers/${props.trainer}/pokemon?tier=${props.tier}`)
        .then( (res) => {
            let data = res.data;
            console.log("data", data);
            setModal(
            <>
                <button onClick={handleShow} className="menuButton">
                    {props.text}
                </button>
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{props.text}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
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
                        <div className='col'><Move atk={data.move1} /></div>
                        <div className='col'><Move atk={data.move2} /></div>
                    </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="primary" onClick={handleClose}>Catch!</Button>
                        <Button variant="secondary" onClick={() => {}}>Run Away.</Button>
                    </Modal.Footer>
                </Modal>
            </>
            )
        })
        .catch();
    }, []);

    return (<>{modal}</>)
}

const WildPokemon = (props) => {
    return (<>
            
            </>)
}

const Menu = (props) => {
    const trainer = props.trainer;
    const tier = props.tier;
    console.log('MENU TIER', tier);
    return (
        <>
            {/* <div><MenuButton trainer={trainer} text={'Pokemon'} clicky={() => {}}/></div>
            <div><MenuButton trainer={trainer} text={'Items'} clicky={() => {}} /></div>
            <div><MenuButton trainer={trainer} text={'Visit City'} clicky={() => {}} /></div> */}
            <div><MenuButton trainer={trainer} tier={tier} text={'Encounter'} /></div>
            {/* <div><MenuButton trainer={trainer} text={'SAVE'} clicky={() => {}} /></div> */}
        </>
    )
}

export default Menu