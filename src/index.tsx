import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import {ReduxProvider} from "app/providers/ReduxProvider";
import {AntdProvider} from "app/providers/AntdProvider";
import {Router} from "component/Router";

ReactDOM.render(
    <React.StrictMode>
        <ReduxProvider>
            <AntdProvider>
                <Router/>
            </AntdProvider>
        </ReduxProvider>
    </React.StrictMode>,
    document.getElementById('root')
);