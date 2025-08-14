import React, {useEffect} from 'react';
import {Button, Flex, Modal, Table, TableProps} from 'antd';
import {userAPI} from "service/UserService";
import {UserModel} from "entities/UserModel";
import {useParams} from "react-router-dom";
import {tablepermissionsAPI} from "service/TablePermissionsService";

type ModalProps = {
    visible: boolean,
    setVisible: Function,
    refresh: Function,
}

export const AddUserModal = (props: ModalProps) => {

    // States
    let {id} = useParams();
    // -----

    // Web requests
    const [getUsers, {
        data: users,
        isLoading: isUsersLoading
    }] = userAPI.useGetAllByTableIdMutation();
    const [createTablePermission, {
        isSuccess: isSuccessCreateTablePermissions,
        isLoading: isLoadingCreateTablePermissions
    }] = tablepermissionsAPI.useCreateMutation();
    // -----

    // Effects
    useEffect(() => {
        if(id) getUsers(id);
    }, []);
    useEffect(() => {
        if (isSuccessCreateTablePermissions) {
            props.setVisible(false);
            props.refresh();
        }
    }, [isSuccessCreateTablePermissions]);
    // -----

    // Handlers
    const createTablePermissionHandler = (userId: number) => {
        if (id) createTablePermission({userId, tableId: id});
    }
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
                <Button size={'small'} onClick={() => createTablePermissionHandler(record.id)}>Добавить</Button>
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
                    loading={isUsersLoading || isLoadingCreateTablePermissions}
                    bordered
                />
            </Flex>
        </Modal>
    );
};
