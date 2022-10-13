import Button from 'react-bootstrap/Button';

export interface Props {
    callback: Function;
}

const Login = (props: Props) => {

    const handleClick = (newUser: number) => {
        props.callback(newUser);
    }

    return (<>
    <Button onClick={() => handleClick(1)}>Kevin</Button>
    <Button onClick={() => handleClick(3)}>Chris</Button>
    <Button onClick={() => handleClick(4)}>Erik</Button>
    <Button onClick={() => handleClick(2)}>Kenneth</Button>
    </>)
}

export default Login;