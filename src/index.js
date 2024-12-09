import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import './style.css';

import Login from './Login';
import Interface from './Interface';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path='/vMix' element={<Interface />} />
                <Route path='/Login' element={<Login />} />
            </Routes>
        </Router>
    </React.StrictMode>
);

