import { useState, useEffect } from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { PokemonTemplate } from "../interfaces/pokemon";
import ServerService from '../serverService';

const EVOLVE_MIN = 3;

export interface Props{
    pokedex: Array<PokemonTemplate>;
    trainerID: number;
    callBack: any;
}
const Pokedex = (props: Props) => {
    const instance = new ServerService();

    const [dexData, setDexData] = useState(<><h3>Loading Pokedex</h3></>);
    const [evolveData, setEvolveData] = useState(<><h3>Loading Evolvable Pokemon</h3></>)
    const [showPokedex, setShowPokedex] = useState(false);
    const [showEvolved, setShowEvolved] = useState(false);
    const [pokeTracker, setPokeTracker] = useState([""]);
    const [dex, setDex] = useState(props.pokedex);
    const [seconds, setSeconds] = useState(0);

    const briefList = new Map<string, number>();
    let sortedList: Array<PokemonTemplate>;

    const setNewActive = (activeSlot: string): void => {
        props.callBack(activeSlot);
    }

    const updateTracker = (pokeID: string): void => {
        const tempTracker = pokeTracker;
        if(tempTracker.includes(pokeID)){
            tempTracker.splice(tempTracker.indexOf(pokeID, 0), 1);
        } else {
            tempTracker.push(pokeID);
        }
        console.log('tracker', tempTracker);
        setPokeTracker(tempTracker);
    }

    const checkEvolvable = (pokedex: string): void => {
        console.log('dex', pokedex);
        const dex = parseInt(pokedex);
        const evolvable: Array<PokemonTemplate> = [];
        if (!dex){
            return;
        }
        sortedList.forEach((pokemon) => {
            if(pokemon.pokedex === dex) {
                evolvable.push(pokemon);
            }
        });
        if(evolvable.length >= EVOLVE_MIN){
            console.log(evolvable);
            const rows: any = [];
            setShowEvolved(true);
            rows.push(<>
                <h3>{evolvable[0].name}</h3>
            </>)
            rows.push(<>
                <div className='row'>
                    <div className='col col-sm'>HP</div>
                    <div className='col col-sm'>Speed</div>
                    <div className='col col-sm'>Moves</div>
                </div>
            </>)
            evolvable.forEach( (pokemon) => {
                const moveText1 = `${pokemon.moves![0].name}: d${pokemon.moves![0].hit} ${pokemon.moves![0].mType}, ${pokemon.moves![0].special}`;
                const moveText2 = `${pokemon.moves![1].name}: d${pokemon.moves![1].hit} ${pokemon.moves![1].mType}, ${pokemon.moves![1].special}`;
                rows.push(<>
                    <div className='row'>
                        <div className='col col-sm'>{pokemon.hp}</div>
                        <div className='col col-sm'>{pokemon.speed}</div>
                        <div className='col col-sm'>{moveText1}</div>
                        <div className='col col-sm'>{moveText2}</div>
                    </div>
                    <div className='row justify-content-end'>
                        <div className='col col-4'>
                            <label>
                                Select to Evolve
                            </label>
                        </div>
                        <div className='col col-4'>
                            <input type="checkbox" value={JSON.stringify(pokemon._id)} onChange={(e) => updateTracker((e.target as HTMLInputElement).value)} />
                        </div>
                    </div>
                    <hr/>
                </>)
            })
            setEvolveData(rows);
        }
    }

    const evolutionTime = async (): Promise<void> => {
        const chosenOnes: Array<PokemonTemplate> = [];
        console.log('atEvolve', pokeTracker);

        props.pokedex.forEach( (pokemon) => {
            if(pokeTracker.includes(pokemon._id.toString())){
                chosenOnes.push(pokemon);
            }
        });

        console.log("chosen", chosenOnes);
        if(chosenOnes.length >= 3){
            const res = instance.getNewPokemonByID(props.trainerID, chosenOnes[0].pokedex + 1)
            .then( (res) => {
                console.log('id', res._id);
            });
        } else {
            alert("Atleast 3 pokemon need to be selected.");
        }

        setShowPokedex(false);
        setShowEvolved(false);
    }

    useEffect( () => {
        setPokeTracker([]);
        const interval = setInterval(() => {
            setSeconds(seconds => seconds + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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
                    setShowPokedex(false);
                    }}>
                    Active</Button>
                <Button className='col col-sm btn-secondary' value={JSON.stringify(sortedList[i].pokedex)} onClick={(event) => {
                    checkEvolvable((event.target as HTMLInputElement).value);
                }}>
                    Evolve
                </Button>
            </div>
            </>)
        }
        setDexData(rows)
    }, [seconds]);

    return (<>
        <Button onClick={() => setShowPokedex(true)} className="primary border">
            Pokedex
        </Button>
        <Modal show={showPokedex} onHide={() => setShowPokedex(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Pokedex</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {dexData}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowPokedex(false)}>Shutdown</Button>
            </Modal.Footer>
        </Modal>
        <Modal show={showEvolved} onHide={() => setShowEvolved(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Evolvable Pokemon</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {evolveData}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={() => evolutionTime()}>Evolve</Button>
                <Button variant="secondary" onClick={() => setShowEvolved(false)}>Exit</Button>
            </Modal.Footer>
        </Modal>
    </>)
}

export default Pokedex;