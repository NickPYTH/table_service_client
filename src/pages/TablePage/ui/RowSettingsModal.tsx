import React, {useEffect, useState} from 'react';
import {Button, Divider, Flex, Modal, Popconfirm, Table, TableProps, Typography} from 'antd';
import {AddUserModal} from "pages/TablePage/ui/AddUserModal";
import {AddFilialModal} from "pages/TablePage/ui/AddFilialModal";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {RowPermissionsModel} from "entities/RowPermissionsModel";
import {rowFilialPermissionsAPI} from "service/RowFilialPermissionsService";
import {RowFilialPermissionsModel} from "entities/RowFilialPermissionsModel";

const { Text } = Typography;

type ModalProps = {
    rowId: number,
    visible: boolean,
    setVisible: Function,
    refresh: Function,
}

export const RowSettingsModal = (props: ModalProps) => {

    // States
    const [permissionsTableData, setPermissionsTableData] = useState<RowPermissionsModel[]>([]);
    const [isVisibleAddUserModal, setIsVisibleAddUserModal] = useState(false);
    const [permissionsFilialTableData, setPermissionsFilialTableData] = useState<RowFilialPermissionsModel[]>([]);
    const [isVisibleAddFilialModal, setIsVisibleAddFilialModal] = useState(false);
    // -----

    // Web requests
    const [getPermissionByRowId, {
        data: permissions,
        isLoading: isLoadingGetPermissionByRowId
    }] = rowPermissionsAPI.useGetAllByRowIdMutation();
    const [getFilialPermissionByRowId, {
        data: filialPermissions,
        isLoading: isLoadingGetFilialPermissionByRowId
    }] = rowFilialPermissionsAPI.useGetAllByRowIdMutation();
    const [deleteRowPermission, {
        isSuccess: isSuccessDeleteRowPermission,
        isLoading: isLoadingDeleteRowPermission
    }] = rowPermissionsAPI.useDeleteMutation();
    const [deleteRowFilialPermission, {
        isSuccess: isSuccessDeleteRowFilialPermission,
        isLoading: isLoadingDeleteRowFilialPermission
    }] = rowFilialPermissionsAPI.useDeleteMutation();
    // -----

    // Effects
    useEffect(() => {
        getPermissionByRowId(props.rowId);
        getFilialPermissionByRowId(props.rowId);
    }, []);
    useEffect(() => {
        if (permissions) setPermissionsTableData(permissions);
    }, [permissions]);
    useEffect(() => {
        if (filialPermissions) setPermissionsFilialTableData(filialPermissions);
    }, [filialPermissions]);
    useEffect(() => {
        getPermissionByRowId(props.rowId);
    }, [isSuccessDeleteRowPermission]);
    useEffect(() => {
        getFilialPermissionByRowId(props.rowId);
    }, [isSuccessDeleteRowFilialPermission])
    // -----

    // Handlers
    const deletePermissionHandler = (permissionId:number) => {
        deleteRowPermission(permissionId);
    }
    const deleteFilialPermissionHandler = (permissionId:number) => {
        deleteRowFilialPermission(permissionId);
    }
    // -----

    // Columns
    const permissionsTableColumns: TableProps<RowPermissionsModel>['columns'] = [
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
                            onConfirm={() => {
                                deletePermissionHandler(record.id);
                            }}
                >
                    <Button size={'small'} danger>Удалить</Button>
                </Popconfirm>
            </Flex>
        },
    ];
    const permissionsFilialTableColumns: TableProps<RowFilialPermissionsModel>['columns'] = [
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
        <Modal title={"Настройки строки"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'650px'}
               loading={false}
               footer={() => (<></>)}
        >
            {isVisibleAddUserModal && <AddUserModal type={'row'} rowId={props.rowId} refresh={() => getPermissionByRowId(props.rowId)} visible={isVisibleAddUserModal} setVisible={setIsVisibleAddUserModal}/>}
            {isVisibleAddFilialModal && <AddFilialModal rowId={props.rowId} type={'row'} refresh={() => getFilialPermissionByRowId(props.rowId)} visible={isVisibleAddFilialModal} setVisible={setIsVisibleAddFilialModal}/>}
            <Flex gap={'small'} vertical>
                <Flex gap={'small'} vertical>
                    <Text>Права доступа пользователей</Text>
                    <Button size={'small'} style={{width: 205}} onClick={() => setIsVisibleAddUserModal(true)}>Добавить пользователя</Button>
                    <Table
                        columns={permissionsTableColumns}
                        dataSource={permissionsTableData}
                        loading={isLoadingGetPermissionByRowId || isLoadingDeleteRowPermission}
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
                        loading={isLoadingGetFilialPermissionByRowId || isLoadingDeleteRowFilialPermission}
                        bordered
                    />
                </Flex>
            </Flex>
        </Modal>
    );
};
