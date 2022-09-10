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
        let res = await instance.get(`trainers/${props.trainer}/pokedex`);
        const data = JSON.parse(res.data);
        for (var i=0; i<data.length; i++) {
            rows.push(<>
            <div className='row'>
                <div className='col'>{data[i].pokedex})</div>
                <div className='col'>{data[i].name}:</div>
                <div className='col'>{data[i].count}</div>
                <Button className='col' onClick={(active) => {
                    console.log(active);
                }}>Choose</Button>
            </div>
            </>)
        }
        
        setData(rows)
    }

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
                <Button variant="secondary" onClick={handleClose}>Shutdown</Button>
            </Modal.Footer>
        </Modal>
    </>)
}

export default VisitCity