import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import Menu from './components/Menu';
import Pokemon from './components/Pokemon';

ReactDOM.render(
    <React.StrictMode>
        <Pokemon />
        <Menu />
    </React.StrictMode>,
    document.getElementById('root')
)