import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import instance from '../serverService';

const Backpack = (props) => {
    const [show, setShow] = useState(false);
    const [reload, setReload] = useState(0);
    const [data, setData] = useState(<h1>loading..</h1>);

    const handleShow = () => setShow(true);
    const handleClose = () => {
        setShow(false);
        refetch();
    }
    const refetch = () => setReload(prev => prev + 1);

    const getData = async () => {
        const rows = [];
        let res = await instance.get(`/items/${props.trainer}`)
        const data = res.data;
        for (var i=0; i<data.length; i++) {
            const it = data[i];
            rows.push(<>
                <div className='row'>
                    <div className='col'>{it.name}</div>
                    <div className='col'>{it.text}</div>
                    <div className='col'>
                        <Button active={false} variant={'primary'} onClick={() => {
                            console.log('Using item', it._id);
                            instance.put(`/items/${props.trainer}?item_id=${it._id}`)
                            .then( () => console.log('Used item', it._id))
                            .catch( (err) => console.log(err));
                        }}>Use</Button>
                    </div>
                </div>
            </>)
        }

        setData(rows)
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
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{props.text}</Modal.Title>
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

export default Backpack