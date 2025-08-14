import React, {useEffect, useState} from 'react';
import {Button, Divider, Flex, Modal, Popconfirm, Table, TableProps, Typography} from 'antd';
import {useParams} from "react-router-dom";
import {tablepermissionsAPI} from "service/TablePermissionsService";
import {TablePermissionsModel} from "entities/TablePermissionsModel";
import {AddUserModal} from "pages/TablePage/ui/AddUserModal";
import {tableFilialPermissionsAPI} from "service/TableFilialPermissionsService";
import {TableFilialPermissionsModel} from "entities/TableFilialPermissionsModel";
import {AddFilialModal} from "pages/TablePage/ui/AddFilialModal";

const { Text, Link } = Typography;

type ModalProps = {
    visible: boolean,
    setVisible: Function,
}

export const TableSettingsModal = (props: ModalProps) => {

    // States
    let {id} = useParams();
    const [permissionsTableData, setPermissionsTableData] = useState<TablePermissionsModel[]>([]);
    const [isVisibleAddUserModal, setIsVisibleAddUserModal] = useState(false);
    const [permissionsFilialTableData, setPermissionsFilialTableData] = useState<TableFilialPermissionsModel[]>([]);
    const [isVisibleAddFilialModal, setIsVisibleAddFilialModal] = useState(false);
    // -----

    // Web requests
    const [getPermissionByTableId, {
        data: permissions,
        isLoading: isLoadingGetPermissionByTableId
    }] = tablepermissionsAPI.useGetAllByTableIdMutation();
    const [getFilialPermissionByTableId, {
        data: filialPermissions,
        isLoading: isLoadingGetFilialPermissionByTableId
    }] = tableFilialPermissionsAPI.useGetAllByTableIdMutation();
    const [deleteTablePermission, {
        isSuccess: isSuccessDeleteTablePermission,
        isLoading: isLoadingDeleteTablePermission
    }] = tablepermissionsAPI.useDeleteMutation();
    const [deleteTableFilialPermission, {
        isSuccess: isSuccessDeleteTableFilialPermission,
        isLoading: isLoadingDeleteTableFilialPermission
    }] = tableFilialPermissionsAPI.useDeleteMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) {
            getPermissionByTableId(id);
            getFilialPermissionByTableId(id);
        }
    }, []);
    useEffect(() => {
        if (permissions) setPermissionsTableData(permissions);
    }, [permissions]);
    useEffect(() => {
        if (filialPermissions) setPermissionsFilialTableData(filialPermissions);
    }, [filialPermissions]);
    useEffect(() => {
        if (id) getPermissionByTableId(id);
    }, [isSuccessDeleteTablePermission]);
    useEffect(() => {
        if (id) getFilialPermissionByTableId(id);
    }, [isSuccessDeleteTableFilialPermission])
    // -----

    // Handlers
    const deletePermissionHandler = (permissionId:number) => {
        deleteTablePermission(permissionId);
    }
    const deleteFilialPermissionHandler = (permissionId:number) => {
        deleteTableFilialPermission(permissionId);
    }
    // -----

    // Columns
    const permissionsTableColumns: TableProps<TablePermissionsModel>['columns'] = [
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
            dataIndex: 'user',
            key: 'user',
            render: (value, record) => (<div>{record.user.username}</div>)
        },
        {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            render: (value, record) => <Flex style={{width: '100%', margin: 2}} justify={'center'} gap={'small'}>
                <Popconfirm title={`Вы точно хотите удалить доступ пользователя ${record.user.username}?`}
                            onConfirm={() => deletePermissionHandler(record.id)}
                >
                    <Button size={'small'} danger>Удалить</Button>
                </Popconfirm>
            </Flex>
        },
    ];
    const permissionsFilialTableColumns: TableProps<TableFilialPermissionsModel>['columns'] = [
        {
            title: 'ИД',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => (a.id && b.id) ? a.id - b.id : 0,
            sortDirections: ['descend', 'ascend'],
            defaultSortOrder: 'descend',
        },
        {
            title: 'Филиал',
            dataIndex: 'filial',
            key: 'filial',
            render: (value, record) => (<div>{record.filial?.name}</div>)
        },
        {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            render: (value, record) => <Flex style={{width: '100%', margin: 2}} justify={'center'} gap={'small'}>
                <Popconfirm title={`Вы точно хотите удалить доступ филиала ${record.filial?.name}?`}
                            onConfirm={() => deleteFilialPermissionHandler(record.id)}
                >
                    <Button size={'small'} danger>Удалить</Button>
                </Popconfirm>
            </Flex>
        },
    ];
    // -----

    return (
        <Modal title={"Настройки таблицы"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'650px'}
               loading={false}
               footer={() => (<></>)}
        >
            {isVisibleAddUserModal && <AddUserModal refresh={() => getPermissionByTableId(id??"0")} visible={isVisibleAddUserModal} setVisible={setIsVisibleAddUserModal}/>}
            {isVisibleAddFilialModal && <AddFilialModal refresh={() => getFilialPermissionByTableId(id??"0")} visible={isVisibleAddFilialModal} setVisible={setIsVisibleAddFilialModal}/>}
            <Flex gap={'small'} vertical>
                <Flex gap={'small'} vertical>
                    <Text>Права доступа пользователей</Text>
                    <Button size={'small'} style={{width: 205}} onClick={() => setIsVisibleAddUserModal(true)}>Добавить пользователя</Button>
                    <Table
                        columns={permissionsTableColumns}
                        dataSource={permissionsTableData}
                        loading={isLoadingGetPermissionByTableId || isLoadingDeleteTablePermission}
                        bordered
                    />
                </Flex>
                <Divider/>
                <Flex gap={'small'} vertical>
                    <Text>Права доступа филиалов</Text>
                    <Button size={'small'} style={{width: 205}} onClick={() => setIsVisibleAddFilialModal(true)}>Добавить филиал</Button>
                    <Table
                        columns={permissionsFilialTableColumns}
                        dataSource={permissionsFilialTableData}
                        loading={isLoadingGetFilialPermissionByTableId || isLoadingDeleteTableFilialPermission}
                        bordered
                    />
                </Flex>
            </Flex>
        </Modal>
    );
};
