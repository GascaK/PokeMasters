
class AxiosInstance {
    getInstance() {
        const axios = require('axios').default;
        const instance = axios.create({
            baseURL: 'http://localhost:5000/',
            timeout: 1000,
            withCredentials: false,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        });

        return instance;
    }
}

export default AxiosInstance