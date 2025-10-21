import {createContext, FC, useContext, useEffect, useMemo} from "react";
import {notification} from "antd";
import {NotificationInstance} from "antd/es/notification/interface";

const Context = createContext({} as NotificationInstance);

const NotificationProvider: FC = ({children}) => {

    const [api, contextHolder] = notification.useNotification();
    const contextValue = useMemo(() => (api), [api]);

    return (
        <Context.Provider value={contextValue}>
            {contextHolder}
            {children}
        </Context.Provider>
    )
}

export const useNotification = () => {
    const context = useContext(Context);
    return context;
}

export default NotificationProvider;
