import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import PokemonMaster from "../interfaces/master";

export interface Props{
    trainer: PokemonMaster;
}
const Stats = (props: Props) => {
    const [data, setData] = useState(<>Loading..</>);

    useEffect(() => {
        console.log(props.trainer.badges);
        setData(<>
        <div className='row'>
            <div className='col'>
                Badges:
            </div>
            <div className='col'>
                {props.trainer.badges}
            </div>
            <div className='col'>
                <Button onClick={() => props.trainer.badges = props.trainer.badges + 1}>
                    +
                </Button>
            </div>
        </div>
        </>);
    }, []);

    return (<>
    {data}
    </>)
}

export default Stats;