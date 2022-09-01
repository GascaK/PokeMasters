import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://192.168.1.28:5000/',
    timeout: 1000,
    withCredentials: false,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
});

export default instance