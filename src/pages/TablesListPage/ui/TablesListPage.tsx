import React, {useEffect, useRef, useState} from 'react';
import {TableModel} from "entities/TableModel";
import {Button, Flex, Input, InputRef, Space, Table, TableProps, UploadProps} from "antd";
import {tableAPI} from "service/TableService";
import dayjs from "dayjs";
import {ColumnType} from 'antd/es/table';
import {SearchOutlined} from "@ant-design/icons";
import {FilterConfirmProps} from 'antd/es/table/interface';
import {CustomDateFilter} from 'shared/component/CustomDateFilter';
import {useNavigate} from "react-router-dom";
import {CreateTableModal} from "./CreateTableModal";
import {ImportTableModal} from "pages/TablesListPage/ui/ImportTableModal";
import {host} from "shared/config/constants";

export interface DataType extends TableModel {
    key: React.Key;
    children?: any;
}

type DataIndex = keyof DataType;

const TablesListPage: React.FC = () => {

    // States
    const [selectedTable, setSelectedTable] = useState<TableModel | null>(null);
    const [isVisibleCreateTableModal, setIsVisibleCreateTableModal] = useState(false);
    const [isVisibleImportTableModal, setIsVisibleImportTableModal] = useState(false);
    const [ws, setWs] = useState(null);
    const [tables, setTables] = useState<TableModel[]>([]);
    // -----

    // Web requests
    const [getTables, {
        data: tablesData,
        isLoading: isTablesLoading
    }] = tableAPI.useGetAllMutation();
    // -----

    // Effects
    useEffect(() => {
        // Подключение к WebSocket
        const socket = new WebSocket('ws://localhost:8000/ws/table-updates/');

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            const message: {id: number, entity: TableModel, type: string} = JSON.parse(event.data);
            if (message.type == 'table_update') {
                setTables((prev:TableModel[]) => {
                    return prev.map((table:TableModel) => {
                        if (table.id == message.id) return message.entity;
                        else return table;
                    });
                })
            }
            else if (message.type == 'table_create') {
                setTables((prev:TableModel[]) => prev.concat(message.entity));
            }
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        //@ts-ignore
        setWs(socket);

        return () => {
            socket.close();
        };
    }, []);
    useEffect(() => {
        getTables();
    }, []);
    useEffect(() => {
        if (tablesData) setTables(tablesData);
    }, [tablesData]);
    // -----

    // Handlers
    const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: DataIndex) => {
        confirm();
    };
    const handleReset = (clearFilters: () => void) => {
        clearFilters();
    };
    // -----

    // Useful utils
    const navigate = useNavigate();
    const searchInput = useRef<InputRef>(null);
    const getColumnSearchProps = (dataIndex: any): ColumnType<any> => ({
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters, close}) => (
            <div style={{padding: 8}} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Поиск`}
                    value={selectedKeys[0]}
                    onChange={(e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{marginBottom: 8, display: 'block'}}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined/>}
                        size="small"
                        style={{width: 90}}
                    >
                        Поиск
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{width: 90}}
                    >
                        Сбросить
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        Закрыть
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{color: filtered ? '#1677ff' : undefined}}/>
        ),
        onFilter: (value, record) => {
            if (record[dataIndex])
                try {
                    return record[dataIndex]
                        .toString()
                        .toLowerCase()
                        .includes((value as string).toLowerCase())
                } catch (e) {
                    return !!record.children.find((child: any) => child[dataIndex]
                        .toString()
                        .toLowerCase()
                        .includes((value as string).toLowerCase()));
                }
        },
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) => (<div>{text}</div>)
    });
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
            ...getColumnSearchProps('title'),
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
            title: 'Дата и время создания',
            dataIndex: 'created_at',
            key: 'created_at',
            render: ((value: string, record: TableModel) => (<div>{dayjs(record.created_at).format("DD.MM.YYYY mm:ss")}</div>)),
            filterDropdown: CustomDateFilter,
            onFilter: (value: any, record: TableModel) => {
                const recordDate = dayjs(record.created_at);
                const filterDate = value.date;
                switch (value.operator) {
                    case '=':
                        return recordDate.isSame(filterDate, 'day');
                    case '>':
                        return recordDate.isAfter(filterDate, 'day');
                    case '<':
                        return recordDate.isBefore(filterDate, 'day');
                    case '>=':
                        return recordDate.isSame(filterDate, 'day') || recordDate.isAfter(filterDate, 'day');
                    case '<=':
                        return recordDate.isSame(filterDate, 'day') || recordDate.isBefore(filterDate, 'day');
                    default:
                        return false;
                }
            },
        },
    ];
    // -----

    return (
        <Flex vertical={true} gap={'small'} style={{padding: 5}}>
            {isVisibleImportTableModal && <ImportTableModal visible={isVisibleImportTableModal} setVisible={setIsVisibleImportTableModal}/>}
            {isVisibleCreateTableModal && <CreateTableModal visible={isVisibleCreateTableModal} setVisible={setIsVisibleCreateTableModal}/>}
            <Flex justify={'space-between'} style={{marginTop: 10, marginLeft: 10}}>
                <Button type={'primary'} style={{width: 140}} onClick={() => setIsVisibleCreateTableModal(true)}>Создать новую</Button>
                <Button type={'primary'} style={{width: 140}} onClick={() => setIsVisibleImportTableModal(true)}>Импорт таблицы</Button>
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
                            navigate(`${record.id}`);
                        },
                    };
                }}
            />
        </Flex>
    );
};

export default TablesListPage;