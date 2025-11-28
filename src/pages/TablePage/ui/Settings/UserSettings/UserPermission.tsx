import {Button, Flex, Popconfirm, Table, TableProps, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {AddUserModal} from "../../AddUserModal";
import {PermissionModel} from "entities/PermissionModel";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {EditUserPermission} from "pages/TablePage/ui/Settings/UserSettings/EditUserPermission";

const {Text} = Typography;

type ModalProps = {
    id: number;
    type: string; // table column row

    // Получение прав
    getPermissions: Function;
    permissions: PermissionModel[] | undefined;
    isPermissionsLoading: boolean;
    // -----

    // Удаление прав
    deletePermission: Function;
    isDeletePermissionLoading: boolean;
    isSuccessDeletePermission: boolean;
    // -----

};

export const UserPermission = (props: ModalProps) => {

    // States
    const [rowPermissionsData, setRowPermissionsData] = useState<PermissionModel[]>([]);
    const [isVisibleAddUserModal, setIsVisibleAddUserModal] = useState(false);
    const [isVisibleEditUserPermissionModal, setIsVisibleEditUserPermissionModal] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<PermissionModel | null>(null);
    // -----

    // Effects
    useEffect(() => {
        props.getPermissions(props.id);
        setSelectedPermission(null);
    }, []);
    useEffect(() => {
        if (props.permissions) setRowPermissionsData(props.permissions);
    }, [props.permissions]);
    useEffect(() => {
        if (props.isSuccessDeletePermission) props.getPermissions(props.id);
    }, [props.isSuccessDeletePermission]);
    // -----

    // Handlers
    const deletePermissionHandler = (permissionId: number) => {
        props.deletePermission(permissionId);
    }
    // -----

    // Columns
    const permissionsTableColumns: TableProps<PermissionModel>['columns'] = [
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
            render: (value, record) => (<div>{record.user_model?.username}</div>)
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
                <Popconfirm title={`Вы точно хотите удалить доступ пользователя ${record.user_model?.username}?`}
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
                                    refresh={() => props.getPermissions(props.id)}
                                    visible={isVisibleEditUserPermissionModal}
                                    setVisible={setIsVisibleEditUserPermissionModal}/>}
            {isVisibleAddUserModal &&
                <AddUserModal
                    id={props.id}
                    type={props.type}
                    refresh={() => props.getPermissions(props.id)}
                    visible={isVisibleAddUserModal}
                    setVisible={setIsVisibleAddUserModal}/>}
            <Text>Права доступа пользователей</Text>
            <Button size={'small'} style={{width: 205}} onClick={() => setIsVisibleAddUserModal(true)}>Добавить пользователя</Button>
            <Table
                columns={permissionsTableColumns}
                dataSource={rowPermissionsData}
                loading={props.isPermissionsLoading || props.isDeletePermissionLoading}
                bordered
            />
        </Flex>
    )
}