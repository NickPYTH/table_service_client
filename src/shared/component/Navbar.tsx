import React, {useEffect, useState} from 'react';
import {Menu, MenuProps} from 'antd';
import {useLocation, useNavigate} from "react-router-dom";
import {userAPI} from "service/UserService";
import {useDispatch, useSelector} from "react-redux";
import {setCurrentUser} from "store/slice/UserSlice";
import {RootStateType} from "store/store";

export const Navbar = () => {

    // Useful utils
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    // -----

    // States
    const [items, setItems] = useState<MenuProps['items']>([]);
    const [current, setCurrent] = useState(() => {
        if (location.pathname == '/table_service/tables_list') return 'tables_list';
        return "";
    });
    // -----

    // Web requests
    const [getCurrentUser, {
        data: currentUserData,
        isLoading: isCurrentUserLoading
    }] = userAPI.useGetCurrentMutation();
    // -----

    // Effects
    useEffect(() => {
        getCurrentUser();
    }, []);
    useEffect(() => {
        if (currentUserData) {
            if (currentUserData.id == null)
                navigate(`table_service/error_403`);
        }
        setItems([
            {
                label: 'Мои таблицы',
                key: 'tables_list',
            },
        ]);
        dispatch(setCurrentUser(currentUserData))
    }, [currentUserData]);
    useEffect(() => {
        setCurrent(() => {
            if (location.pathname == '/table_service/tables_list') return 'tables_list';
            return "";
        });
    }, [location]);
    // -----

    // Handlers
    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
        if (e.key === 'tables_list') navigate(`table_service/tables_list`)
    };
    // -----

    return (<>
            <div style={{position: 'absolute', right: 5, top: 10}}>{`${currentUser?.last_name} ${currentUser?.first_name}`}</div>
            <Menu disabled={isCurrentUserLoading} onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items}/>
        </>
    );
};
