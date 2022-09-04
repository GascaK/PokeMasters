import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import instance from '../serverService';

const VisitCity = (props) => {
    const [show, setShow] = useState(false);
    const [reload, setReload] = useState(0);
    const [data, setData] = useState(<h1>loading..</h1>);

    const handleShow = () => setShow(true);
    const handleClose = () => {
        setShow(false);
        refetch();
    }
    const refetch = () => setReload(prev => prev + 1);

    const rows = [];
    const getData = async () => {
        for (var i=0; i < 5; i++) {
            let res = await instance.get(`/items/${props.trainer}?store=true`);
            rows.push(<>
                <div className='row'>
                    <div className='col'>{res.data.cost}</div>
                    <div className='col'>{res.data.name}:</div>
                    <div className='col'>{res.data.text}</div>
                    <div className='col'>
                        <Button variant='primary' onClick={() => {
                            console.log('ID', res.data._id)
                            instance.post(`/items/${props.trainer}?item_id=${res.data._id}`)
                            .then( () => console.log('Item purchased.'))
                            .catch( err => console.log(err));
                            }}>Buy</Button>
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

export default VisitCity