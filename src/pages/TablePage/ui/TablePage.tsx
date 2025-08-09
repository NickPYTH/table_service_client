import React, {useEffect, useState} from 'react';
import {TableModel} from "entities/TableModel";
import {Button, Flex, Spin, Table, TableProps} from "antd";
import {tableAPI} from "service/TableService";
import {FilterConfirmProps} from 'antd/es/table/interface';
import {useNavigate, useParams} from "react-router-dom";
import {CellModel} from "entities/CellModel";
import {ColumnModel} from "entities/ColumnModel";
import {RowModel} from "entities/RowModel";
import {ColumnModal} from "pages/TablePage/ui/ColumnModal";
import {rowAPI} from "service/RowService";
import {EditableCell, EditableRow} from "pages/TablePage/ui/EditableCell";

export interface DataType extends TableModel {
    key: React.Key;
    rowId: number;
    children?: any;
}

type DataIndex = keyof DataType;

const TablePage: React.FC = () => {

    // States
    let {id} = useParams();
    const [table, setTable] = useState<TableModel | null>(null);
    const [columns, setColumns] = useState<TableProps<any>['columns']  | null>(null);
    const [rows, setRows] = useState<any[]>([]);
    const [isVisibleColumnModal, setIsVisibleColumnModal] = useState(false);
    // -----

    // Web requests
    const [getTableData, {
        data: tableData,
        isLoading: isTableDataLoading
    }] = tableAPI.useGetMutation();
    const [createRow, {
        isSuccess: isCreateRowSuccess,
        isLoading: isCreateRowLoading
    }] = rowAPI.useCreateMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) getTableData(id);
    }, []);
    useEffect(() => {
        if (isCreateRowSuccess && id) getTableData(id);
    }, [isCreateRowSuccess]);
    useEffect(() => {
        if (tableData) {
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
                    title: column.name,
                    render: (record: CellModel, row:any) => {
                        return(<div>{record?.value}</div>)
                    },
                    dataIndex: column.id ?? 0,
                    key: column.id ?? 0,
                    editable: true,
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
            render: () => (<Flex><Button size={'small'}>Клик!</Button></Flex>)
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
        <Flex vertical={true} gap={'small'} style={{padding: 5}}>
            {isVisibleColumnModal && <ColumnModal refresh={() => getTableData(id ?? "0")} visible={isVisibleColumnModal} setVisible={setIsVisibleColumnModal}/>}
            <h3>{tableData ? tableData.title : "Ждем..."}</h3>
            <Flex style={{width: window.innerWidth - 10}}>
                <Flex gap={'small'} style={{width: '100%'}}>
                    <Flex vertical gap={'small'}>
                        <Button type={'primary'} style={{width: 200}} onClick={openColumnModalHandler}>Добавить столбец</Button>
                        <Button type={'primary'} style={{width: 200}} disabled={isCreateRowLoading} onClick={addRowHandler}>Добавить строку</Button>
                    </Flex>
                    <Flex vertical gap={'small'}>
                        <Button type={'primary'} style={{width: 200}}>Поделиться таблицей</Button>
                        <Button type={'primary'} style={{width: 200}}>Редактировать права</Button>
                    </Flex>
                    <Flex vertical gap={'small'}>
                        <Button type={'primary'} style={{width: 200}}>Экспорт таблицы</Button>
                        <Button type={'primary'} style={{width: 200}}>Добавить строки из файла</Button>
                    </Flex>
                </Flex>
                <Flex vertical gap={'small'}>
                    <Button danger type={'primary'} style={{width: 200}}>Удалить таблицу</Button>
                    <Button danger type={'primary'} style={{width: 200}}>Завершить редактирование</Button>
                </Flex>
            </Flex>

            {editableColumns ?
                <Table<DataType>
                    rowClassName={() => 'editable-row'}
                    style={{width: '100vw'}}
                    columns={editableColumns?.concat(baseColumns)}
                    dataSource={rows}
                    loading={isTableDataLoading}
                    bordered
                    pagination={{
                        defaultPageSize: 100,
                    }}
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
    );
};

export default TablePage;