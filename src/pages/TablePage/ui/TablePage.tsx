import React, {createContext, useEffect, useRef, useState} from 'react';
import {TableModel} from "entities/TableModel";
import {Button, Flex, Input, InputRef, Popconfirm, Space, Spin, Table, TableProps, Tag} from "antd";
import {tableAPI} from "service/TableService";
import {FilterConfirmProps} from 'antd/es/table/interface';
import {useNavigate, useParams} from "react-router-dom";
import {CellModel} from "entities/CellModel";
import {ColumnModel} from "entities/ColumnModel";
import {RowModel} from "entities/RowModel";
import {ColumnModal} from "pages/TablePage/ui/ColumnModal";
import {rowAPI} from "service/RowService";
import {EditableCell, EditableRow} from "pages/TablePage/ui/EditableCell";
import {ColumnType} from "antd/es/table";
import {
    CheckCircleOutlined, CloseCircleOutlined,
    CloseOutlined, DeleteColumnOutlined, DeleteOutlined, DeleteRowOutlined,
    EditOutlined,
    SaveOutlined,
    SearchOutlined,
    SettingOutlined, ShareAltOutlined
} from "@ant-design/icons";
import {TableSettingsModal} from "pages/TablePage/ui/TableSettingsModal";
import {RowSettingsModal} from "pages/TablePage/ui/RowSettingsModal";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";

export interface DataType extends TableModel {
    key: React.Key;
    rowId: number;
    children?: any;
}

function updateCellValueInArray(dataArray:any, targetId:any, newValue:any) {
    // Создаем копию массива, чтобы не мутировать исходные данные
    const result = JSON.parse(JSON.stringify(dataArray));

    // Перебираем все объекты в массиве
    result.forEach((item:any) => {
        // Перебираем все ключи в объекте (кроме rowId)
        for (const key in item) {
            if (key === 'rowId') continue;

            // Проверяем, есть ли у текущего элемента нужный ID
            if (item[key].id === targetId) {
                // Заменяем значение
                item[key].value = newValue;
                // Можно прервать цикл, если ID уникальны в рамках одного объекта
                break;
            }
        }
    });

    return result;
}

type DataIndex = keyof DataType;

type TableContextType = {
   ws: any|null;
   lockedCellsIds: {user_id: number, cell_id:number}[];
}

export const TableContext = createContext<TableContextType | null>(null);

const TablePage: React.FC = () => {

    // Store
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    // -----

    // States
    const [context, setContext] = useState<TableContextType>({
        ws: null,
        lockedCellsIds: [],
    });
    const tblRef: Parameters<typeof Table>[0]['ref'] = React.useRef(null);
    let {id} = useParams();
    const [wsCellsUpdate, setWsCellsUpdate] = useState(null);
    const [wsCellLockUpdate, setWsCellLockUpdate] = useState(null);
    const [wsAlive, setWsAlive] = useState(false);
    const [title, setTitle] = useState<string | null>(null);
    const [isVisibleTableSettingsModal, setIsVisibleTableSettingsModal] = useState(false);
    const [isTitleEditMode, setIsTitleEditMode] = useState(false);
    const [editTitle, setEditTitle] = useState<string | null>(null);
    const [owner, setOwner] = useState<string | null>(null);
    const [columns, setColumns] = useState<TableProps<any>['columns']  | null>(null);
    const [rows, setRows] = useState<any[]>([]);
    const [isVisibleColumnModal, setIsVisibleColumnModal] = useState(false);
    const [isVisibleRowModal, setIsVisibleRowModal] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState<ColumnModel | null>(null);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const searchInput = useRef<InputRef>(null);
    // -----

    // For search
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
            <Button size={'small'} icon={<SearchOutlined style={{color: filtered ? '#1677ff' : undefined}}/>} />
        ),
        onFilter: (value, record) => {
            if (record[dataIndex]?.value)
                try {
                    return record[dataIndex].value
                        .toString()
                        .toLowerCase()
                        .includes((value as string).toLowerCase())
                } catch (e) {
                    return !!record.children.find((child: any) => child[dataIndex].value
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
        render: (text) => {
            return (<div>{text?.value}</div>)
        }
    });
    //

    // Web requests
    const [getTableData, {
        data: tableData,
        isError: isErrorTableData,
        isLoading: isTableDataLoading
    }] = tableAPI.useGetMutation();
    const [patchTable, {
        data: patchedTable,
        isSuccess: isTablePatchSuccess,
        isLoading: isTablePatchLoading
    }] = tableAPI.usePatchMutation();
    const [deleteTable, {
        isSuccess: isTableDeleteSuccess,
    }] = tableAPI.useDeleteMutation();
    const [createRow, {
        isSuccess: isCreateRowSuccess,
        isLoading: isCreateRowLoading
    }] = rowAPI.useCreateMutation();
    const [deleteRow, {
    }] = rowAPI.useDeleteMutation();
    const [getLockedCells, {
        data: lockedCell,
    }] = tableAPI.useGetLockedCellsMutation();
    const [removeLocks, {
        isSuccess: isRemoveLocksSuccess,
    }] = tableAPI.useRemoveLocksMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) {
            getTableData(id);
            getLockedCells(id);
        }
    }, []);
    useEffect(() => {
        // Подключение к обновлению ячеек по WebSocket
        const socket = new WebSocket('ws://localhost:8000/ws/cell-updates/');

        socket.onopen = () => {
            console.log('WebSocket cell update connected');
            setWsAlive(true);
        };

        socket.onmessage = (event) => {
            const message: {id: number, entity: CellModel, type: string} = JSON.parse(event.data);
            if (message.type == 'cell_update') {
                setRows((prev:any[]) => {
                    let newState = JSON.parse(JSON.stringify(prev));
                    const updatedData = updateCellValueInArray(newState, message.id, message.entity.value);
                    return updatedData;
                })

            }
        };

        socket.onclose = () => {
            console.log('WebSocket cell update disconnected');
            setWsAlive(false);
        };

        socket.onerror = (error) => {
            console.error('WebSocket cell update error:', error);
            setWsAlive(false);
        };

        //@ts-ignore
        setWsCellsUpdate(socket);

        return () => {
            socket.close();
        };
    }, []);
    useEffect(() => {
        // Подключение к обновлению ячеек по WebSocket
        const socket = new WebSocket('ws://localhost:8000/ws/cell-lock-updates/');

        socket.onopen = () => {
            console.log('WebSocket cell lock connected');
            setWsAlive(true);
            setContext({...context, ws: socket});
        };

        socket.onmessage = (event) => {
            const message:{entity: {cell: CellModel}, type: string} = JSON.parse(event.data);
            console.log('new locked cells ', message, currentUser);
            if (message.type == 'cell_lock_update')
                setContext(prevState => ({...prevState, lockedCellsIds: prevState.lockedCellsIds.concat([{user_id: currentUser ? currentUser?.id : 999, cell_id: message.entity.cell.id}])}));
            else if (message.type == 'cell_lock_remove')
                setContext(prevState => ({...prevState, lockedCellsIds: prevState.lockedCellsIds.filter((lock) => lock.cell_id != message.entity.cell.id)}));
        };
        socket.onclose = () => {
            console.log('WebSocket cell lock disconnected');
            setWsAlive(false);
        };

        socket.onerror = (error) => {
            console.error('WebSocket cell lock error:', error);
            setWsAlive(false);
        };

        //@ts-ignore
        setWsCellLockUpdate(socket);

        return () => {
            socket.close();
        };
    }, []);
    useEffect(() => {
        if (isCreateRowSuccess && id) getTableData(id);
    }, [isCreateRowSuccess]);
    useEffect(() => {
        if (tableData) {
            setTitle(tableData.title);
            setOwner(tableData.owner.username);
            if (tableData.cells){

                // Получение списка уникальных колонок
                let columnsModels: ColumnModel[] = tableData.cells?.reduce((acc: ColumnModel[], cell: CellModel) => {
                    if (!acc.find((column:ColumnModel) => column.id == cell.column.id)) {
                        return acc.concat(cell.column);
                    }
                    return acc;
                }, []);
                // -----

                // Получение списка уникальных строк
                let rowsModels: RowModel[] = tableData.cells?.reduce((acc: RowModel[], cell: CellModel) => {
                    if (!acc.find((row:RowModel) => row.id == cell.row.id)) {
                        return acc.concat(cell.row);
                    }
                    return acc;
                }, []);
                // -----

                // Создание колонок для таблицы
                const columnsForTable: TableProps<any>['columns'] = columnsModels.map((column: ColumnModel) => ({
                    title: () => {
                        return(<Flex gap={'small'} justify={'space-between'}>
                            <div>{column.name}</div>
                            <Flex align={'center'} gap={'small'}>
                                <Tag color={column.data_type == 'text' ? 'geekblue':
                                    column.data_type == 'integer' ? 'green':
                                    column.data_type == 'float' ? 'cyan':
                                    column.data_type == 'date' ? 'magenta':
                                        'volcano'} style={{lineHeight: "14px"}}>{column.data_type}</Tag>
                                <Popconfirm title={`Удалить колонку '${column.name}'?`}>
                                    <Button size={'small'} icon={<DeleteColumnOutlined/>} danger/>
                                </Popconfirm>
                                <Button size={'small'} icon={<SettingOutlined/>} onClick={() => {
                                    setSelectedColumn(column);
                                    setIsVisibleColumnModal(true);
                                }}/>
                            </Flex>
                        </Flex>)
                    },
                    dataIndex: column.id ?? 0,
                    key: column.id ?? 0,
                    editable: true,
                    // sorter: (a, b) => {
                    //     if (!column.id) return 0;
                    //     let columnId = column.id.toString();
                    //     let valueA = a[columnId]?.value;
                    //     let valueB = b[columnId]?.value;
                    //     if (column.data_type == "text") return valueA && valueB ? valueA.toString().charCodeAt(0) - valueB.toString().charCodeAt(0) : 0;
                    //     if (column.data_type == "integer") return valueA && valueB ? valueA - valueB : 0;
                    //     return 0;
                    // },
                    ...getColumnSearchProps(column.id),
                }));
                setColumns(columnsForTable);
                // -----

                // Формирование датасета
                const rowsForTable = rowsModels.map((row:RowModel) => {
                    if (!tableData.cells) return null;
                    let cellsByRow = tableData.cells?.filter((cell:CellModel) => cell.row.id == row.id);
                    let item:any = {};
                    item.rowId = row.id;
                    // Получив список всех ячеек в строке формируем объект для датасета где ключ это ИД колонки из ячейки
                    cellsByRow.forEach((cell:CellModel) => {
                       if (cell.column.id) item[cell.column.id] =  cell;
                    });
                    // -----
                    return item;
                });
                setRows(rowsForTable);
                // -----

            }
        }
    }, [tableData]);
    useEffect(() => {
        if (lockedCell) setContext({...context, lockedCellsIds: lockedCell});
    }, [lockedCell])
    useEffect(() => !isVisibleColumnModal ? setSelectedColumn(null) : ()=>{}, [isVisibleColumnModal])
    useEffect(() => {
        if (patchedTable) {
            setTitle(patchedTable.title);
            setEditTitle(null);
            setIsTitleEditMode(false);
        }
    }, [isTablePatchSuccess]);
    useEffect(() => {
        if (isTableDeleteSuccess) navigate("/table_service/tables_list");
    }, [isTableDeleteSuccess]);
    useEffect(() => {
        if (isErrorTableData){
            navigate("/not_found")
        }
    }, [isErrorTableData]);
    useEffect(() => {
        if (isRemoveLocksSuccess) setContext({...context, lockedCellsIds: []});
    }, [isRemoveLocksSuccess])
    // -----

    // Handlers
    const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: DataIndex) => {
        confirm();
    };
    const handleReset = (clearFilters: () => void) => {
        clearFilters();
    };
    const openColumnModalHandler = () => {
        setIsVisibleColumnModal(true);
    };
    const addRowHandler = () => {
        if(id) createRow(id);
    };
    const deleteRowHandler = (rowId: number) => {
        deleteRow(rowId);
        setRows(prev => prev.filter((row) => row.rowId != rowId));
    };
    const saveTitleHandler = () => {
        if (editTitle && id) {
            patchTable({id, title: editTitle});
        }
    };
    const deleteTableHandler = () => {
        if(id) deleteTable(id);
    };
    const removeLocksHandler = () => {
        if (id) removeLocks(id);
    }
    // -----

    // Useful utils
    const navigate = useNavigate();
    const baseColumns: TableProps<any>['columns'] = [
        {
            title: "",
            dataIndex: 'action',
            key: 'action',
            width: 100,
            render: (record, row) => {
                return (<Flex style={{width: '100%'}} justify={'center'} align={'center'} gap={'small'}>
                    <Button icon={<SettingOutlined />} onClick={() => {setSelectedRowId(row.rowId); setIsVisibleRowModal(true);}} size={'small'}/>
                    <Popconfirm title={"Удалить строку?"} okText={"Да"} onConfirm={() => deleteRowHandler(row.rowId)}>
                        <Button icon={<DeleteRowOutlined />} danger size={'small'}/>
                    </Popconfirm>
                </Flex>)
            }
        }
    ];
    const handleSave = (row: DataType) => {
        const newData = [...rows];
        const index = newData.findIndex((item) => row.rowId === item.rowId);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setRows(newData);
    };
    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };
    const editableColumns = columns?.map((col:any) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: DataType) => {
                return {
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave,
                }
            },
        };
    });
    // -----

    return (
        <TableContext.Provider value={context}>
            <Flex vertical={true} gap={'small'} style={{padding: 5}}>
            {(isVisibleRowModal && selectedRowId) && <RowSettingsModal rowId={selectedRowId} refresh={() => getTableData(id ?? "0")} visible={isVisibleRowModal} setVisible={setIsVisibleRowModal}/>}
            {isVisibleColumnModal && <ColumnModal column={selectedColumn} refresh={() => getTableData(id ?? "0")} visible={isVisibleColumnModal} setVisible={setIsVisibleColumnModal}/>}
            {isVisibleTableSettingsModal && <TableSettingsModal visible={isVisibleTableSettingsModal} setVisible={setIsVisibleTableSettingsModal}/>}
            <Flex align={'center'} justify={'space-between'}>
                <Flex vertical>
                    <Flex align={'center'} gap={'small'} style={{marginTop: 15}}>
                        {isTitleEditMode ?
                            <>
                                <Input disabled={isTablePatchLoading} style={{width: 200}} value={editTitle ?? ""} onChange={(e) => setEditTitle(e.target.value)} />
                                <Button disabled={isTablePatchLoading} icon={<SaveOutlined />} onClick={saveTitleHandler}/>
                                <Button disabled={isTablePatchLoading} danger icon={<CloseOutlined />} onClick={() => {
                                    setIsTitleEditMode(false);
                                    setEditTitle(null);
                                }}/>
                            </>
                            :
                            <>
                                <div style={{fontWeight: 'bold'}}>{title ? title : "Ждем..."}</div>
                                <Button icon={<EditOutlined />} onClick={() => {
                                    setIsTitleEditMode(true);
                                    setEditTitle(title);
                                }}/>
                                <Button icon={<SettingOutlined />} onClick={() => {
                                    setIsVisibleTableSettingsModal(true);
                                }}/>
                                <Button icon={<ShareAltOutlined />} onClick={() => {

                                }}/>
                            </>
                        }
                    </Flex>
                    <div style={{fontSize: 12, marginBottom: 5}}>{owner && <>Владелец: {owner}</>}</div>
                </Flex>
                <Flex style={{fontSize: 12}}>
                    {wsAlive ?
                        <Tag icon={<CheckCircleOutlined />} color="success">
                            Соединение активно
                        </Tag>
                        :
                        <Tag icon={<CloseCircleOutlined />} color="error">
                            Соединение отсутствует
                        </Tag>
                    }
                </Flex>
            </Flex>
            <Flex style={{width: window.innerWidth - 10}}>
                <Flex gap={'small'} style={{width: '100%'}}>
                    <Flex vertical gap={'small'}>
                        <Button type={'primary'} style={{width: 200}} onClick={openColumnModalHandler}>Добавить столбец</Button>
                        <Button type={'primary'} style={{width: 200}} disabled={isCreateRowLoading} onClick={addRowHandler}>Добавить строку</Button>
                    </Flex>
                    <Flex vertical gap={'small'}>
                        <Button type={'primary'} style={{width: 200}}>Экспорт таблицы</Button>
                        <Button type={'primary'} style={{width: 200}}>Добавить строки из файла</Button>
                    </Flex>
                </Flex>
                <Flex vertical gap={'small'}>
                    <Popconfirm title={"Вы точно хотите таблицу? Это действие необратимо."} onConfirm={deleteTableHandler}>
                        <Button danger type={'primary'} style={{width: 200}}>
                            Удалить таблицу
                        </Button>
                    </Popconfirm>
                    <Button danger type={'primary'} style={{width: 200}} onClick={removeLocksHandler}>Завершить редактирование</Button>
                </Flex>
            </Flex>
            {editableColumns ?
                <Table<DataType>
                    style={{height: 500}}
                    rowClassName={() => 'editable-row'}
                    columns={editableColumns?.concat(baseColumns)}
                    dataSource={rows.sort((a:any, b:any) => a.rowId - b.rowId)}
                    loading={isTableDataLoading}
                    bordered
                    pagination={{
                        defaultPageSize: 100,
                    }}
                    //virtual
                    //scroll={{ x: window.innerWidth, y: window.innerHeight}}
                    components={components}
                    onRow={(record, rowIndex) => {
                        return {
                            onDoubleClick: (e) => {

                            },
                        };
                    }}
                />
                :
                <Spin size={'large'} style={{margin: 50}}/>
            }
        </Flex>
        </TableContext.Provider>
    );
};

export default TablePage;