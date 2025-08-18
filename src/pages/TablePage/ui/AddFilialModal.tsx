import React, {useEffect, useState} from 'react';
import {Button, Flex, Modal, Table, TableProps} from 'antd';
import {useParams} from "react-router-dom";
import {tableFilialPermissionsAPI} from "service/TableFilialPermissionsService";
import {FilialModel} from "entities/FilialModel";
import {filialAPI} from "service/FilialService";
import {rowFilialPermissionsAPI} from "service/RowFilialPermissionsService";

type ModalProps = {
    visible: boolean,
    setVisible: Function,
    refresh: Function,
    type: string,
    rowId?: number
}

export const AddFilialModal = (props: ModalProps) => {

    // States
    let {id} = useParams();
    const [filials, setFilials] = useState<FilialModel[]>([]);
    // -----

    // Web requests
    const [getFilialsByTableId, {
        data: filialsByTableId,
        isLoading: isFilialsByTableIdLoading
    }] = filialAPI.useGetAllByTableIdMutation();
    const [getFilialsByRowId, {
        data: filialsByRowId,
        isLoading: isFilialsByRowIdLoading
    }] = filialAPI.useGetAllByRowIdMutation();
    const [createTableFilialPermission, {
        isSuccess: isSuccessCreateTableFilialPermissions,
        isLoading: isLoadingCreateTableFilialPermissions
    }] = tableFilialPermissionsAPI.useCreateMutation();
    const [createRowFilialPermission, {
        isSuccess: isSuccessCreateRowFilialPermissions,
        isLoading: isLoadingCreateRowFilialPermissions
    }] = rowFilialPermissionsAPI.useCreateMutation();
    // -----

    // Effects
    useEffect(() => {
        if (props.type == 'table') {
            if (id) getFilialsByTableId(id);
        } else if (props.type == 'row') {
            if (props.rowId) getFilialsByRowId(props.rowId);
        }
    }, []);
    useEffect(() => {
        if (filialsByTableId) setFilials(filialsByTableId);
    }, [filialsByTableId]);
    useEffect(() => {
        if (filialsByRowId) setFilials(filialsByRowId);
    }, [filialsByRowId]);
    useEffect(() => {
        if (isSuccessCreateTableFilialPermissions || isSuccessCreateRowFilialPermissions) {
            props.setVisible(false);
            props.refresh();
        }
    }, [isSuccessCreateTableFilialPermissions || isSuccessCreateRowFilialPermissions]);
    // -----

    // Handlers
    const createTableFilialPermissionHandler = (userId: number) => {
        if (id) createTableFilialPermission({userId, tableId: id});
    }
    const createRowFilialPermissionHandler = (filialId: number) => {
        if (props.rowId) createRowFilialPermission({filialId, rowId: props.rowId});
    }
    // -----

    // Columns
    const columns: TableProps<FilialModel>['columns'] = [
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
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '',
            dataIndex: 'action',
            key: 'action',
            render: (value, record) => <Flex style={{width: '100%', margin: 2}} justify={'center'} gap={'small'}>
                <Button size={'small'} onClick={() => props.type == 'row' ? createRowFilialPermissionHandler(record.id) : createTableFilialPermissionHandler(record.id)}>Добавить</Button>
            </Flex>
        },
    ];
    // -----

    return (
        <Modal title={"Выбор филиала"}
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
                    dataSource={filials}
                    loading={isFilialsByTableIdLoading || isFilialsByRowIdLoading || isLoadingCreateTableFilialPermissions || isLoadingCreateRowFilialPermissions}
                    bordered
                />
            </Flex>
        </Modal>
    );
};
