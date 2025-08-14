import React, {useEffect, useState} from 'react';
import {Button, Divider, Flex, Modal, Table, TableProps, Typography} from 'antd';
import {useParams} from "react-router-dom";
import {tablepermissionsAPI} from "service/TablePermissionsService";
import {TablePermissionsModel} from "entities/TablePermissionsModel";
import {AddUserModal} from "pages/TablePage/ui/AddUserModal";

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
    // -----

    // Web requests
    const [getPermissionByTableId, {
        data: permissions,
        isSuccess: isSuccessGetPermissionByTableId,
        isLoading: isLoadingGetPermissionByTableId
    }] = tablepermissionsAPI.useGetAllByTableIdMutation();
    const [deleteTablePermission, {
        isSuccess: isSuccessDeleteTablePermission,
        isLoading: isLoadingDeleteTablePermission
    }] = tablepermissionsAPI.useDeleteMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) getPermissionByTableId(id);
    }, []);
    useEffect(() => {
        if (permissions) setPermissionsTableData(permissions);
    }, [permissions]);
    useEffect(() => {
        if (id) getPermissionByTableId(id);
    }, [isSuccessDeleteTablePermission]);
    // -----

    // Handlers
    const deletePermissionHandler = (permissionId:number) => {
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
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            render: (value, record) => <Flex style={{width: '100%', margin: 2}} justify={'center'} gap={'small'}>
                <Button size={'small'} danger onClick={() => deletePermissionHandler(record.id)}>Удалить</Button>
            </Flex>
        },
    ];
    // -----

    return (
        <Modal title={"Настройки таблицы"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'600px'}
               loading={false}
               footer={() => (<></>)}
        >
            {isVisibleAddUserModal && <AddUserModal refresh={() => getPermissionByTableId(id??"0")} visible={isVisibleAddUserModal} setVisible={setIsVisibleAddUserModal}/>}
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
            </Flex>
        </Modal>
    );
};
