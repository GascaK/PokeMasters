import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import PokemonMaster from "../interfaces/master";

export interface Props{
    trainer: PokemonMaster;
    refresh: any;
}
const Stats = (props: Props) => {
    const [data, setData] = useState(<>Loading..</>);

    useEffect(() => {
        setData(<>
        <div className='row'>
            <div className='col'>
                Badges:
            </div>
            <div className='col'>
                {props.trainer.badges}
            </div>
            <div className='col'>
                {/* <Button onClick={() => {
                    props.trainer.badges = props.trainer.badges + 1;
                    props.refresh();
                    }}>
                    Don't Touch Erik...
                </Button> */}
            </div>
            <div className='col'>
                <Button onClick={() => console.log(props.trainer.badges)}>
                    -
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