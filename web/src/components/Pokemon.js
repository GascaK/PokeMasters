
const Pokemon = () => {
    const axios = require('axios').default;
    const instance = axios.create({
        baseURL: 'http://localhost:5000/pokemon',
        timeout: 1000,
        withCredentials: false,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
    }
    })
    const pokeUrl = "/1";
    let data;
    
    instance.get(pokeUrl)
        .then( (response) => {
            data = response.data;
            console.log(data);
        })
        .catch( (error) => {
            console.log(error);
        });

    return (
        <>
            {data !== undefined &&
                <h1>{data['name']}</h1>
            }
        </>
    )
}

export default Pokemon