import {Button, Flex, Popconfirm, Table, TableProps, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {TablePermissionsModel} from "entities/TablePermissionsModel";
import {tablepermissionsAPI} from "service/TablePermissionsService";
import {AddUserModal} from "../../AddUserModal";
import {useParams} from "react-router-dom";
import {EditUserPermission} from "pages/TablePage/ui/TableSettings/UserSettings/EditUserPermission";

const {Text, Title} = Typography;

export const UserPermission = () => {

    // States
    let {id} = useParams();
    const [permissionsTableData, setPermissionsTableData] = useState<TablePermissionsModel[]>([]);
    const [isVisibleAddUserModal, setIsVisibleAddUserModal] = useState(false);
    const [isVisibleEditUserPermissionModal, setIsVisibleEditUserPermissionModal] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<TablePermissionsModel | null>(null);
    // -----

    // Web requests
    const [getPermissionByTableId, {
        data: permissions,
        isLoading: isLoadingGetPermissionByTableId
    }] = tablepermissionsAPI.useGetAllByTableIdMutation();
    const [deleteTablePermission, {
        isSuccess: isSuccessDeleteTablePermission,
        isLoading: isLoadingDeleteTablePermission
    }] = tablepermissionsAPI.useDeleteMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) {
            getPermissionByTableId(id);
            setSelectedPermission(null);
        }
    }, []);
    useEffect(() => {
        if (permissions) setPermissionsTableData(permissions);
    }, [permissions]);
    useEffect(() => {
        if (isSuccessDeleteTablePermission && id) getPermissionByTableId(id);
    }, [isSuccessDeleteTablePermission]);
    // -----

    // Handlers
    const deletePermissionHandler = (permissionId: number) => {
        deleteTablePermission(permissionId);
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
                <Popconfirm title={`Вы точно хотите удалить доступ пользователя ${record.user.username}?`}
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
                                    refresh={() => getPermissionByTableId(id ?? "0")}
                                    visible={isVisibleEditUserPermissionModal}
                                    setVisible={setIsVisibleEditUserPermissionModal}/>}
            {isVisibleAddUserModal &&
                <AddUserModal
                    id={999}
                    type={'table'}
                    refresh={() => getPermissionByTableId(id ?? "0")}
                    visible={isVisibleAddUserModal}
                    setVisible={setIsVisibleAddUserModal}/>}
            <Title level={5}>Права доступа пользователей</Title>
            <Button size={'small'} style={{width: 205}}
                    onClick={() => setIsVisibleAddUserModal(true)}>Добавить пользователя</Button>
            <Table
                columns={permissionsTableColumns}
                dataSource={permissionsTableData}
                loading={isLoadingGetPermissionByTableId || isLoadingDeleteTablePermission}
                bordered
            />
        </Flex>
    )
}