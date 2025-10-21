import {Button, Flex, Popconfirm, Table, TableProps, Typography} from "antd";
import {useParams} from "react-router-dom";
import {TableFilialPermissionsModel} from "entities/TableFilialPermissionsModel";
import React, {useEffect, useState} from "react";
import {tableFilialPermissionsAPI} from "service/TableFilialPermissionsService";
import {AddFilialModal} from "pages/TablePage/ui/AddFilialModal";

const {Text, Title} = Typography;

export const FilialPermission = () => {

    // States
    let {id} = useParams();
    const [permissionsFilialTableData, setPermissionsFilialTableData] = useState<TableFilialPermissionsModel[]>([]);
    const [isVisibleAddFilialModal, setIsVisibleAddFilialModal] = useState(false);
    // -----

    // Web requests
    const [getFilialPermissionByTableId, {
        data: filialPermissions,
        isLoading: isLoadingGetFilialPermissionByTableId
    }] = tableFilialPermissionsAPI.useGetAllByTableIdMutation();

    const [deleteTableFilialPermission, {
        isSuccess: isSuccessDeleteTableFilialPermission,
        isLoading: isLoadingDeleteTableFilialPermission
    }] = tableFilialPermissionsAPI.useDeleteMutation();
    // -----

    // Use effect
    useEffect(() => {
        if (id) {
            getFilialPermissionByTableId(id);
        }
    }, []);
    useEffect(() => {
        if (filialPermissions) setPermissionsFilialTableData(filialPermissions);
    }, [filialPermissions]);
    useEffect(() => {
        if (id) getFilialPermissionByTableId(id);
    }, [isSuccessDeleteTableFilialPermission])
    // -----

    // Handlers
    const deleteFilialPermissionHandler = (permissionId: number) => {
        deleteTableFilialPermission(permissionId);
    }
    // -----

    // Columns
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
        <Flex gap={'small'} vertical>
            {isVisibleAddFilialModal &&
                <AddFilialModal type={'table'} refresh={() => getFilialPermissionByTableId(id ?? "0")} visible={isVisibleAddFilialModal} setVisible={setIsVisibleAddFilialModal}/>}

            <Title level={5}>Права доступа филиалов</Title>
            <Button size={'small'} style={{width: 205}} onClick={() => setIsVisibleAddFilialModal(true)}>Добавить филиал</Button>
            <Table
                columns={permissionsFilialTableColumns}
                dataSource={permissionsFilialTableData}
                loading={isLoadingGetFilialPermissionByTableId || isLoadingDeleteTableFilialPermission}
                bordered
            />
        </Flex>
    )
}