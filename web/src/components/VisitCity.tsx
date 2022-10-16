import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import PokemonMaster from '../interfaces/master';
import { PokeItemsTemplate } from '../interfaces/items';

const SHOP_SIZE = 5;

export interface Props{
    trainer: PokemonMaster;
    refresh: any;
}
const VisitCity = (props: Props) => {
    const [show, setShow] = useState(false);
    const [data, setData] = useState(<><h3>Loading Shop..</h3></>);

    const handleClose = () => {
        setShow(false);
    }

    const buyItem = (item: PokeItemsTemplate) => {
        props.trainer.instance.instance.post(`/items/${props.trainer.trainerID}?item_id=${item._id}`)
        .then( () => {
            alert(`Item purchased, ${item.name}.`)
            setShow(false);
        });
        props.refresh();
    }

    const setupShop = async (): Promise<void> => {
        const rows: any = [];
        const shop = await props.trainer.getShop(SHOP_SIZE)
        .then( (items) => {
            items.forEach((item) => {
                rows.push(<>
                    <div className='row'>
                        <div className='col'>{item.name}:</div>
                        <div className='col'>{item.text}</div>
                        <div className='col'>${item.cost}</div>
                        <div className='col'>
                            <Button variant='primary' onClick={() => buyItem(item)}>Buy</Button>
                        </div>
                    </div>
                    </>);
            });

            setData(rows);
        });
    }

    useEffect(() => {
        setupShop();
    }, [show]);

    return (<>
    <Button onClick={() => setShow(true)} className="primary border">
            Visit City
        </Button>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>City Shops</Modal.Title>
            </Modal.Header>

            <Modal.Body>
            {data}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Leave</Button>
            </Modal.Footer>
        </Modal>
    </>)
}

export default VisitCity;