import {Button, Flex, Popconfirm, Table, TableProps, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {AddUserModal} from "../../AddUserModal";
import {RowPermissionsModel} from "entities/RowPermissionsModel";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {EditUserPermission} from "pages/TablePage/ui/RowSettings/UserSettings/EditUserPermission";

const {Text} = Typography;

type ModalProps = {
    rowId: number,
}

export const UserPermission = (props: ModalProps) => {

    // States
    const [rowPermissionsData, setRowPermissionsData] = useState<RowPermissionsModel[]>([]);
    const [isVisibleAddUserModal, setIsVisibleAddUserModal] = useState(false);
    const [isVisibleEditUserPermissionModal, setIsVisibleEditUserPermissionModal] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<RowPermissionsModel | null>(null);
    // -----

    // Web requests
    const [getPermissionByRowId, {
        data: permissions,
        isLoading: isLoadingGetPermissionByRowId
    }] = rowPermissionsAPI.useGetAllByRowIdMutation();
    const [deleteRowPermission, {
        isSuccess: isSuccessDeleteRowPermission,
        isLoading: isLoadingDeleteRowPermission
    }] = rowPermissionsAPI.useDeleteMutation();
    // -----

    // Effects
    useEffect(() => {
        getPermissionByRowId(props.rowId);
        setSelectedPermission(null);
    }, []);
    useEffect(() => {
        if (permissions) setRowPermissionsData(permissions);
    }, [permissions]);
    useEffect(() => {
        if (isSuccessDeleteRowPermission) getPermissionByRowId(props.rowId);
    }, [isSuccessDeleteRowPermission]);
    // -----

    // Handlers
    const deletePermissionHandler = (permissionId: number) => {
        deleteRowPermission(permissionId);
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
            render: (value, record) => (<div>{record.user_model.username}</div>)
        },
        {
            title: 'Редактирование',
            dataIndex: 'can_edit',
            key: 'can_edit',
            render: (value, record) => (<div>{record.can_edit ? "Да" : "Нет"}</div>)
        },
        {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            render: (value, record) => <Flex style={{width: '100%', margin: 2}} justify={'center'} gap={'small'}>
                <Button size={'small'} onClick={() => {
                    setIsVisibleEditUserPermissionModal(true);
                    setSelectedPermission(record);
                }}>Изменить</Button>
                <Popconfirm title={`Вы точно хотите удалить доступ пользователя ${record.user_model.username}?`}
                            onConfirm={() => deletePermissionHandler(record.id)}
                >
                    <Button size={'small'} danger>Удалить</Button>
                </Popconfirm>
            </Flex>
        },
    ];
    // -----

    return (
        <Flex gap={'small'} vertical>
            {(isVisibleEditUserPermissionModal && selectedPermission) &&
                <EditUserPermission permission={selectedPermission}
                                    refresh={() => getPermissionByRowId(props.rowId)}
                                    visible={isVisibleEditUserPermissionModal}
                                    setVisible={setIsVisibleEditUserPermissionModal}/>}
            {isVisibleAddUserModal &&
                <AddUserModal
                    type={'table'}
                    refresh={() => getPermissionByRowId(props.rowId)}
                    visible={isVisibleAddUserModal}
                    setVisible={setIsVisibleAddUserModal}/>}
            <Text>Права доступа пользователей</Text>
            <Button size={'small'} style={{width: 205}} onClick={() => setIsVisibleAddUserModal(true)}>Добавить пользователя</Button>
            <Table
                columns={permissionsTableColumns}
                dataSource={rowPermissionsData}
                loading={isLoadingGetPermissionByRowId || isLoadingDeleteRowPermission}
                bordered
            />
        </Flex>
    )
}