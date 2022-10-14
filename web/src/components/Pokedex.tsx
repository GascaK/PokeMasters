import { useState, useEffect } from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { PokemonTemplate } from "../interfaces/pokemon";

export interface Props{
    pokedex: Array<PokemonTemplate>;
    callBack: any;
}
const Pokedex = (props: Props) => {
    const [data, setData] = useState(<><h3>Loading Pokedex</h3></>);
    const [show, setShow] = useState(false);
    const [dex, setDex] = useState(props.pokedex);
    const [seconds, setSeconds] = useState(0);

    const briefList = new Map<string, number>();
    let sortedList: Array<PokemonTemplate>;

    useEffect( () => {
        const interval = setInterval(() => {
            setSeconds(seconds => seconds + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const setNewActive = (activeSlot: string): void => {
        props.callBack(activeSlot);
    }

    useEffect( () => {
        setDex(props.pokedex);
        dex.forEach( (poke) => {
            if (briefList.has(poke.name)) {
                briefList.set(poke.name, briefList.get(poke.name)!+1);
            } else {
                briefList.set(poke.name, 1);
            }
        });

        sortedList = dex.sort(
            (objA, objB) => objA.pokedex < objB.pokedex ? -1 : 1
        );
        const rows: any = [];
        rows.push(<>
        <div className='row'>
            <div className='col'>ID</div>
            <div className='col'>Name</div>
            <div className='col'>HP</div>
            <div className='col'>Speed</div>
            <div className='col'>Active</div>
            <div className='col'>Release</div>
        </div>
        </>)
        for (var i=0; i<sortedList.length; i++) {
            rows.push(<>
            <div className='row'>
                <div className='col col-sm'>{sortedList[i].pokedex})</div>
                <div className='col col-sm'>{sortedList[i].name}:</div>
                <div className='col col-sm'>{sortedList[i].hp}</div>
                <div className='col col-sm'>{sortedList[i].speed}</div>
                <Button className='col col-sm' value={JSON.stringify(sortedList[i])} onClick={(event) => {
                    setNewActive((event.target as HTMLInputElement).value);
                    setShow(false);
                    }}>
                    Active</Button>
                <Button className='col col-sm btn-secondary' onClick={() => {
                    console.log("Releasing", sortedList[i]);
                }}>
                    Release
                </Button>
            </div>
            </>)
        }
        setData(rows)
    }, [seconds]);

    return (<>
        <Button onClick={() => setShow(true)} className="primary border">
            Pokedex
        </Button>
        <Modal show={show} onHide={() => setShow(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Pokedex</Modal.Title>
            </Modal.Header>

            <Modal.Body>
            {data}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>Shutdown</Button>
            </Modal.Footer>
        </Modal>
    </>)
}

export default Pokedex;