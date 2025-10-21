import {Button, Flex, Popconfirm, Table, TableProps, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {RowFilialPermissionsModel} from "entities/RowFilialPermissionsModel";
import {rowFilialPermissionsAPI} from "service/RowFilialPermissionsService";

const {Text} = Typography;

type ModalProps = {
    rowId: number,
}

export const FilialPermission = (props: ModalProps) => {

    // States
    const [permissionsFilialTableData, setPermissionsFilialTableData] = useState<RowFilialPermissionsModel[]>([]);
    const [isVisibleAddFilialModal, setIsVisibleAddFilialModal] = useState(false);
    // -----

    // Web requests
    const [getFilialPermissionByRowId, {
        data: filialPermissions,
        isLoading: isLoadingGetFilialPermissionByRowId
    }] = rowFilialPermissionsAPI.useGetAllByRowIdMutation();
    const [deleteRowFilialPermission, {
        isSuccess: isSuccessDeleteRowFilialPermission,
        isLoading: isLoadingDeleteRowFilialPermission
    }] = rowFilialPermissionsAPI.useDeleteMutation();
    // -----

    // Effects
    useEffect(() => {
        getFilialPermissionByRowId(props.rowId);
    }, []);
    useEffect(() => {
        if (filialPermissions) setPermissionsFilialTableData(filialPermissions);
    }, [filialPermissions]);
    useEffect(() => {
        getFilialPermissionByRowId(props.rowId);
    }, [isSuccessDeleteRowFilialPermission])
    // -----

    // Handlers
    const deleteFilialPermissionHandler = (permissionId: number) => {
        deleteRowFilialPermission(permissionId);
    }
    // -----

    // Columns
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
    )
}