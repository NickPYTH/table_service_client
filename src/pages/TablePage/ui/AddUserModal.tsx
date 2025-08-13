import React, {useEffect, useState} from 'react';
import {Button, Flex, Modal, Table, TableProps} from 'antd';
import {userAPI} from "service/UserService";
import {UserModel} from "entities/UserModel";

type ModalProps = {
    visible: boolean,
    setVisible: Function,
}

export const AddUserModal = (props: ModalProps) => {

    // States

    // -----

    // Web requests
    const [getUsers, {
        data: users,
        isLoading: isUsersLoading
    }] = userAPI.useGetAllMutation();
    // -----

    // Effects
    useEffect(() => {
        getUsers();
    }, []);
    // -----

    // Handlers

    // -----

    // Columns
    const columns: TableProps<UserModel>['columns'] = [
        {
            title: 'ИД',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => (a.id && b.id) ? a.id - b.id : 0,
            sortDirections: ['descend', 'ascend'],
            defaultSortOrder: 'descend',
        },
        {
            title: 'Пользователь',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '',
            dataIndex: 'action',
            key: 'action',
            render: (value, record) => <Flex style={{width: '100%', margin: 2}} justify={'center'} gap={'small'}>
                <Button size={'small'}>Добавить</Button>
            </Flex>
        },
    ];
    // -----

    return (
        <Modal title={"Выбор пользователя"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'600px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex gap={'small'} vertical>
                <Table
                    columns={columns}
                    dataSource={users}
                    loading={isUsersLoading}
                    bordered
                />
            </Flex>
        </Modal>
    );
};
