import React, {useEffect, useState} from 'react';
import {TableModel} from "entities/TableModel";
import {Button, Flex, Table, TableProps} from "antd";
import {tableAPI} from "service/TableService";

const TablesListPage: React.FC = () => {

    // States
    const [selectedTable, setSelectedTable] = useState<TableModel | null>(null);
    // -----

    // Web requests
    const [getTables, {
        data: tables,
        isLoading: isTablesLoading
    }] = tableAPI.useGetAllMutation();
    // -----

    // Effects
    useEffect(() => {
        getTables();
    }, []);
    // -----

    // Useful utils
    const columns: TableProps<TableModel>['columns'] = [
        {
            title: 'ИД',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => (a.id && b.id) ? a.id - b.id : 0,
            sortDirections: ['descend', 'ascend'],
            defaultSortOrder: 'descend',
        },
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.charCodeAt(0) - b.title.charCodeAt(0),
            filters: tables?.reduce((acc: { text: string, value: string }[], table: TableModel) => {
                if (acc.find((g: { text: string, value: string }) => g.value == table.title) === undefined)
                    return acc.concat({text: table.title, value: table.title});
                return acc;
            }, []),
            onFilter: (value: any, record: TableModel) => {
                return record.title.indexOf(value) === 0
            },
            filterSearch: true,
        },
        {
            title: 'Владелец',
            dataIndex: 'owner',
            key: 'owner',
            render: ((value: any, record: TableModel) => (<div>{record.owner.username}</div>)),
            sorter: (a, b) => a.owner.username.charCodeAt(0) - b.owner.username.charCodeAt(0),
            filters: tables?.reduce((acc: { text: string, value: string }[], table: TableModel) => {
                if (acc.find((g: { text: string, value: string }) => g.value == table.owner.username) === undefined)
                    return acc.concat({text: table.owner.username, value: table.owner.username});
                return acc;
            }, []),
            onFilter: (value: any, record: TableModel) => {
                return record.owner.username.indexOf(value) === 0
            },
            filterSearch: true,
        },
        {
            title: 'Дата создания',
            dataIndex: 'created_at',
            key: 'created_at',
            render: ((record: TableModel) => (<div>{record.created_at}</div>)),
        },
    ]
    // -----

    return (
        <Flex vertical={true} gap={'small'}>
            <Flex justify={'space-between'} style={{marginTop: 10, marginLeft: 10}}>
                <Button type={'primary'} style={{width: 150}}>Создать таблицу</Button>
            </Flex>
            <Table
                style={{width: '100vw'}}
                columns={columns}
                dataSource={tables}
                loading={isTablesLoading}
                bordered
                pagination={{
                    defaultPageSize: 100,
                }}
                onRow={(record, rowIndex) => {
                    return {
                        onDoubleClick: (e) => {
                            setSelectedTable(record);
                        },
                    };
                }}
            />
        </Flex>
    );
};

export default TablesListPage;