import { useState, useEffect } from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { PokeItemsTemplate } from "../interfaces/items";


export interface Props{
    items: Array<PokeItemsTemplate>;
    useItemCallBack: any;
}
const Backpack = (props: Props) => {
    const [showBackPack, setShowBackPack] = useState(false);
    const [data, setData] = useState([]);
    const items = props.items;

    useEffect(() => {
        setNewData();
    }, [items]);

    const utilizePokeItem = (inputItem: PokeItemsTemplate) => {
        props.useItemCallBack(inputItem);
        setShowBackPack(false);
        alert(`Used item: ${inputItem.name} with effect: ${inputItem.text}`)
    }

    const setNewData = () => {
        const rows: any = [];
        rows.push(<>
        <div className='row'>
            <div className='col col-sm'>Name</div>
            <div className='col col-sm'>Effect</div>
            <div className='col col-sm'>Cost</div>
            <div className='col col-sm'>Use</div>
        </div></>)
        items.forEach((item) => {
            rows.push(<>
            <div className='row'>
                <div className='col'>{item.name}</div>
                <div className='col'>{item.text}</div>
                <div className='col'>{item.cost}</div>
                <div className='col'>
                    <Button onClick={() => utilizePokeItem(item)}>Use</Button>
                </div>
            </div>
            <hr />
            </>)
        })
        setData(rows);
    }

    return (<>
        <Button onClick={() => setShowBackPack(true)} className="primary border">
            Backpack
        </Button>
        <Modal show={showBackPack} onHide={() => setShowBackPack(false)}>
            <Modal.Header closeButton>
                <Modal.Title>BackPack</Modal.Title>
            </Modal.Header>

            <Modal.Body>
            {data}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowBackPack(false)}>Return</Button>
            </Modal.Footer>
        </Modal>
    </>)
}

export default Backpack;