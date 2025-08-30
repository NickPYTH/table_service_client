import React, {useEffect, useState} from 'react';
import {Button, Flex, Modal, Table, TableProps} from 'antd';
import {userAPI} from "service/UserService";
import {UserModel} from "entities/UserModel";
import {useParams} from "react-router-dom";
import {tablepermissionsAPI} from "service/TablePermissionsService";
import {rowPermissionsAPI} from "service/RowPermissionsService";

type ModalProps = {
    visible: boolean,
    setVisible: Function,
    refresh: Function,
    type: string,
    rowId?: number
}

export const AddUserModal = (props: ModalProps) => {

    // States
    let {id} = useParams();
    let [users, setUsers] = useState<UserModel[]>([]);
    // -----

    // Web requests
    const [getUsersByTable, {
        data: usersByTable,
        isLoading: isUsersByTableLoading
    }] = userAPI.useGetAllByTableIdMutation();
    const [getUsersByRow, {
        data: usersByRow,
        isLoading: isUsersByRowLoading
    }] = userAPI.useGetAllByRowIdMutation();
    const [createTablePermission, {
        isSuccess: isSuccessCreateTablePermissions,
        isLoading: isLoadingCreateTablePermissions
    }] = tablepermissionsAPI.useCreateMutation();
    const [createRowPermission, {
        isSuccess: isSuccessCreateRowPermissions,
        isLoading: isLoadingCreateRowPermissions
    }] = rowPermissionsAPI.useCreateMutation();
    // -----

    // Effects
    useEffect(() => {
        if (props.type == 'table') {
            if (id) getUsersByTable(id);
        } else if (props.type == 'row') {
            if (props.rowId) getUsersByRow(props.rowId);
        }
    }, []);
    useEffect(() => {
        if (usersByTable) setUsers(usersByTable);
    }, [usersByTable]);
    useEffect(() => {
        if (usersByRow) setUsers(usersByRow);
    }, [usersByRow]);
    useEffect(() => {
        if (isSuccessCreateTablePermissions || isSuccessCreateRowPermissions) {
            props.setVisible(false);
            props.refresh();
        }
    }, [isSuccessCreateTablePermissions, isSuccessCreateRowPermissions]);
    // -----

    // Handlers
    const createTablePermissionHandler = (userId: number) => {
        if (id) createTablePermission({userId, tableId: id});
    }
    const createRowPermissionHandler = (userId: number) => {
        if (props.rowId) createRowPermission({userId, rowId: props.rowId});
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
                <Button size={'small'} onClick={() => props.type == 'row'? createRowPermissionHandler(record.id) : createTablePermissionHandler(record.id)}>Добавить</Button>
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
                    loading={isUsersByTableLoading || isUsersByRowLoading || isLoadingCreateTablePermissions || isLoadingCreateRowPermissions}
                    bordered
                />
            </Flex>
        </Modal>
    );
};
