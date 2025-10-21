import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import {ReduxProvider} from "app/providers/ReduxProvider";
import {AntdProvider} from "app/providers/AntdProvider";
import {Router} from "component/Router";
import {NotificationProvider} from "app/providers/NotificationProvider";

ReactDOM.render(
    <React.StrictMode>
        <ReduxProvider>
            <AntdProvider>
                <NotificationProvider>
                    <Router/>
                </NotificationProvider>
            </AntdProvider>
        </ReduxProvider>
    </React.StrictMode>,
    document.getElementById('root')
);