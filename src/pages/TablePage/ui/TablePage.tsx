import React, {useEffect, useState} from 'react';
import {TableModel} from "entities/TableModel";
import {Button, Flex, Spin, Table, TableProps} from "antd";
import {tableAPI} from "service/TableService";
import {FilterConfirmProps} from 'antd/es/table/interface';
import {useNavigate, useParams} from "react-router-dom";
import {CellModel} from "entities/CellModel";
import {ColumnModel} from "entities/ColumnModel";
import {RowModel} from "entities/RowModel";

export interface DataType extends TableModel {
    key: React.Key;
    children?: any;
}

type DataIndex = keyof DataType;

const TablePage: React.FC = () => {

    // States
    let {id} = useParams();
    const [table, setTable] = useState<TableModel | null>(null);
    const [columns, setColumns] = useState<TableProps<any>['columns']  | null>(null);
    const [rows, setRows] = useState<any[]>([]);
    // -----

    // Web requests
    const [getTableData, {
        data: tableData,
        isLoading: isTableDataLoading
    }] = tableAPI.useGetMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) getTableData(id);
    }, []);
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
                    dataIndex: column.id,
                    key: column.id
                }));
                setColumns(columnsForTable);
                // -----

                // Формирование датасета
                const rowsForTable = rowsModels.map((row:RowModel) => {
                    if (!tableData.cells) return null;
                    let cellsByRow = tableData.cells?.filter((cell:CellModel) => cell.row.id == row.id);
                    let item:any = {};
                    // Получив список всех ячеек в строке формируем объект для датасета где ключ это ИД колонки из ячейки
                    cellsByRow.forEach((cell:CellModel) => {
                       item[cell.column.id] = cell.value;
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
    // -----

    // Useful utils
    const navigate = useNavigate();
    // -----

    return (
        <Flex vertical={true} gap={'small'} style={{padding: 5}}>
            <h3>Имя таблички</h3>
            <Flex style={{width: window.innerWidth - 10}}>
                <Flex gap={'small'} style={{width: '100%'}}>
                    <Flex vertical gap={'small'}>
                        <Button type={'primary'} style={{width: 200}}>Добавить столбец</Button>
                        <Button type={'primary'} style={{width: 200}}>Добавить строку</Button>
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
            {columns ?
                <Table
                    style={{width: '100vw'}}
                    columns={columns}
                    dataSource={rows}
                    loading={false}
                    bordered
                    pagination={{
                        defaultPageSize: 100,
                    }}
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