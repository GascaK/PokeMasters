import Button from 'react-bootstrap/Button';

const Bench = (props) => {
    return (
        <>
        <div className='row'>
        <Button onClick={ () => props.callBack(props.bench) }>{props.bench}</Button>
        </div>
        </>
    )
}

export default Bench