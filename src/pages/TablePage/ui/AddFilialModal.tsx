import React, {useEffect} from 'react';
import {Button, Flex, Modal, Table, TableProps} from 'antd';
import {useParams} from "react-router-dom";
import {tableFilialPermissionsAPI} from "service/TableFilialPermissionsService";
import {FilialModel} from "entities/FilialModel";
import {filialAPI} from "service/FilialService";

type ModalProps = {
    visible: boolean,
    setVisible: Function,
    refresh: Function,
}

export const AddFilialModal = (props: ModalProps) => {

    // States
    let {id} = useParams();
    // -----

    // Web requests
    const [getFilials, {
        data: filials,
        isLoading: isFilialsLoading
    }] = filialAPI.useGetAllByTableIdMutation();
    const [createTableFilialPermission, {
        isSuccess: isSuccessCreateTableFilialPermissions,
        isLoading: isLoadingCreateTableFilialPermissions
    }] = tableFilialPermissionsAPI.useCreateMutation();
    // -----

    // Effects
    useEffect(() => {
        if(id) getFilials(id);
    }, []);
    useEffect(() => {
        if (isSuccessCreateTableFilialPermissions) {
            props.setVisible(false);
            props.refresh();
        }
    }, [isSuccessCreateTableFilialPermissions]);
    // -----

    // Handlers
    const createTableFilialPermissionHandler = (userId: number) => {
        if (id) createTableFilialPermission({userId, tableId: id});
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
                <Button size={'small'} onClick={() => createTableFilialPermissionHandler(record.id)}>Добавить</Button>
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
                    loading={isFilialsLoading || isLoadingCreateTableFilialPermissions}
                    bordered
                />
            </Flex>
        </Modal>
    );
};
