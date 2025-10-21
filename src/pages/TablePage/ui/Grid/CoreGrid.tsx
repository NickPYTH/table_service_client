import {
    DataGridPremium,
    GridCellParams,
    gridClasses,
    GridColDef,
    GridFilterModel,
    GridRowModel,
    GridSortModel,
    useGridApiRef
} from "@mui/x-data-grid-premium";
import {ruRU} from '@mui/x-data-grid-premium/locales';
import React, {useCallback, useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";
import {columnAPI} from "service/ColumnService";
import {rowAPI} from "service/RowService";
import {ColumnModel} from "entities/ColumnModel";
import {CellModel} from "entities/CellModel";
import {RowModel} from "entities/RowModel";
import {Cell} from "pages/TablePage/ui/Grid/Cell";
import {DataRowModel, TableContext, TableContextType} from "pages/TablePage/ui/TablePage";
//@ts-ignore
import {debounce} from "lodash";
import {ColumnMenu} from "./ColumnMenu";
import {Button, Dropdown, Flex, Popconfirm, Tag} from "antd";
import {CopyOutlined, DeleteRowOutlined, HistoryOutlined, PlusOutlined, SettingOutlined} from "@ant-design/icons";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {RowPermissionsModel} from "entities/RowPermissionsModel";
import {useNotification} from "app/providers/NotificationProvider/ui/NotificationProvider";
import {formatDate, isValidDateString} from "shared/config/utils";
import {EditLogModal} from "pages/TablePage/ui/Grid/EditLogModal";

type PropsType = {
    wsCellLocks: WebSocket | null,
    wsCellsUpdate: WebSocket | null,
    setContext: Function,
    insertRow: Function,
};

function computeMutation(newRow:GridRowModel, oldRow: GridRowModel) {
    // compare rows
    return "change";
}

export const CoreGrid = (props: PropsType) => {

    // Notification context
    const notification = useNotification();
    // -----

    // Context
    const tableContext = useContext(TableContext);
    // -----

    // Params
    let {id} = useParams();
    // -----

    // States
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: tableContext ? tableContext.pageSize : 50,
        page: 0,
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
    });
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        rowId: number | null;
    } | null>(null);
    const [selectedRow, setSelectedRow] = useState<DataRowModel | null>(null);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [promiseArguments, setPromiseArguments] = useState<any | null>(null);
    // -----

    // Web requests
    const [getTableColumns, {
        data: columnsFromRequest,
        isLoading: isTableColumnsLoading
    }] = columnAPI.useGetAllByTableIdMutation();
    const [getTableData, {
        data: tableData,
        isLoading: isTableDataLoading
    }] = rowAPI.useGetAllByTableIdMutation();
    const [getTableDataWithColumnFilter, {
        data: tableDataWithColumnFilter,
    }] = rowAPI.useGetAllByTableIdWithColumnFilterMutation();
    const [deleteRow, {
        isSuccess: isDeleteRowSuccess,
    }] = rowAPI.useDeleteMutation();
    const [getRowPermissions, {
        data: rowsPermissionsFromRequest,
    }] = rowPermissionsAPI.useGetAllByUserIdMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) getTableColumns(id);
    }, []);
    useEffect(() => {
        if (columnsFromRequest && id) {
            // Сортируем полученные колонки по order
            let copy: ColumnModel[] = JSON.parse(JSON.stringify(columnsFromRequest));
            const sortedByOrderColumns: ColumnModel[] = copy.sort((c1: ColumnModel, c2: ColumnModel) => {
                if (c1.order && c2.order) return c1.order - c2.order;
                else return 1;
            });
            // -----
            const columns: GridColDef[] = sortedByOrderColumns.map((column: ColumnModel) => {
                return {
                    field: column.id ? column.id.toString() : "999",
                    headerName: column.name,
                    editable: true,
                    width: 200,
                    type: column.data_type == 'text' ? 'string' :
                        column.data_type == 'integer' ? 'number' :
                            column.data_type == 'float' ? 'number' :
                                column.data_type == 'date' ? 'date' :
                                    column.data_type == 'boolean' ? 'singleSelect' :
                                        column.data_type == 'select' ? 'singleSelect' :
                                            'string',
                    valueGetter: (params: CellModel) => {
                        if (params.value == null)
                            return "";
                        if (typeof params.value == "object") {
                            // Встретили дату
                            params.value as Date;
                            return formatDate(params.value);
                        } else {
                            // Если тип данных колонки явно указан - Дата. Следует проверить не является ли датой ячейка
                            if (column.data_type == 'date') {
                                if (isValidDateString(params.value)) return new Date(params.value.replace('.', '-'));
                            }
                            // -----
                            return params.value;
                        }
                    },
                    valueSetter: (value, row) => {
                        let rowCopy = JSON.parse(JSON.stringify(row));
                        rowCopy[column.id ?? 0].value = value;
                        return rowCopy;
                    },
                    valueFormatter: (params: string | Date) => {
                        if (params == null)
                            return "";
                        if (typeof params == "object") {
                            // Встретили дату
                            params as Date;
                            return formatDate(params);
                        } else
                            return params;
                    },
                    renderCell: (params) => {
                        return <Cell row={params.row} column={column} formattedValue={params.formattedValue}/>
                    },
                    groupable: false,
                    aggregable: false,
                    valueOptions: column.select_values ? column.select_values: []
                }
            });
            let actionColumn: GridColDef = {
                field: "action",
                headerName: "",
                width: 50,
                groupable: false,
                aggregable: false,
                sortable: false,
                filterable: false,
                renderCell: (data) => (<Flex style={{height: '100%'}} gap={'small'} align={'center'} justify={'center'}>
                    <Button size={'small'} icon={<SettingOutlined/>} onClick={() => {
                        if (tableContext) {
                            tableContext.setIsVisibleRowSettingsModal(true);
                            tableContext.setSelectedRowId(data.row.id);
                        }
                    }}/>
                    <Popconfirm title={"Вы точно хотите удалить строку?"} okText={"Да"} onConfirm={() => {
                        deleteRow(data.row.id);
                        props.setContext((prev: TableContextType) => ({
                            ...prev,
                            rows: prev.rows.filter((row) => row.id != data.row.id)
                        }));
                    }}>
                        <Button size={'small'} danger icon={<DeleteRowOutlined/>}/>
                    </Popconfirm>
                </Flex>)
            };
            let orderColumn: GridColDef = {
                field: "order",
                headerName: "",
                width: 50,
                aggregable: false,
                renderCell: (data) => (<Flex style={{height: '100%'}} gap={'small'} align={'center'} justify={'center'}>
                    <Tag>{data.row['order'] + 1}</Tag>
                    </Flex>)
            };
            columns.push(orderColumn);
            columns.push(actionColumn);
            props.setContext((prev: TableContextType) => ({...prev, columns}));
            // Отправляю запрос на получение данных
            getTableData({tableId: id, page: ++paginationModel.page, limit: paginationModel.pageSize});
            // -----
        }
    }, [columnsFromRequest]);
    useEffect(() => {
        if (tableData) {
            // Формирование датасета
            let rowsIds: number[] = [];
            const rowsForTable = tableData.results.map((row: RowModel) => {
                let item: any = {};
                rowsIds.push(row.id);
                item.id = row.id;
                item['order'] = row.order;
                // Получив список всех ячеек в строке формируем объект для датасета где ключ это ИД колонки из ячейки
                row.cells_list.forEach((cell: CellModel) => {
                    if (cell.column) item[cell.column] = cell;
                });
                // -----
                return item;
            });
            props.setContext((prevState: TableContextType) => ({...prevState, rows: rowsForTable}));
            if (currentUser && id)
                getRowPermissions({table_id: id, user_id: currentUser.id, rowsIds});
            // -----
        }
    }, [tableData]);
    useEffect(() => {
        if (tableDataWithColumnFilter) {
            // Формирование датасета
            const rowsForTable = tableDataWithColumnFilter.results.map((row: RowModel) => {
                let item: any = {};
                item.id = row.id;
                // Получив список всех ячеек в строке формируем объект для датасета где ключ это ИД колонки из ячейки
                row.cells_list.forEach((cell: CellModel) => {
                    if (cell.column) item[cell.column] = cell;
                });
                // -----
                return item;
            });
            props.setContext((prevState: TableContextType) => ({...prevState, rows: rowsForTable}));
            // -----
        }
    }, [tableDataWithColumnFilter]);
    useEffect(() => {
        // Для перелистывания
        if (paginationModel && id)
            getTableData({tableId: id, page: paginationModel.page + 1, limit: paginationModel.pageSize});
    }, [paginationModel]);
    useEffect(() => {
        if (rowsPermissionsFromRequest) {
            props.setContext((prev: TableContextType) => ({...prev, rowPermissions: rowsPermissionsFromRequest}));
        }
    }, [rowsPermissionsFromRequest]);
    useEffect(() => {
        if (isDeleteRowSuccess) {
            notification.success({
                message: "Успешно!",
                description: "Строка удалена."
            });
        }
    }, [isDeleteRowSuccess]);
    // -----

    // Handler
    const onCellEditStartHandler = (params: GridCellParams) => {
        // Создаем блокировку на сервере
        if (props.wsCellLocks) {
            let cellId: number = params.row[params.field].id;
            props.wsCellLocks.send(JSON.stringify({cell_id: cellId, type: 'create', user_id: currentUser?.id}));
        }
        // -----
    };
    const onCellEditStopHandler = (params: GridCellParams, event:any) => {
        if (1){
            event.defaultMuiPrevented = true;
        } else {
            setTimeout(() => {
                // Ебаный костыль из-за асинхронного обновления грида
                const actualValue = apiRef.current.getCellValue(params.id, params.field);
                // Обновляем значение ячейки на сервере
                if (props.wsCellsUpdate) {
                    let cellId: number = params.row[params.field].id;
                    props.wsCellsUpdate.send(JSON.stringify({cell_id: cellId, type: 'update', user_id: currentUser?.id, value: actualValue ?? ""}));
                }
                // -----
            }, 10);
            // Снимаем блокировку на сервере
            if (props.wsCellLocks) {
                let cellId: number = params.row[params.field].id;
                props.wsCellLocks.send(JSON.stringify({cell_id: cellId, type: 'remove', user_id: currentUser?.id}));
            }
            // -----
        }
    };
    const isCellEditableHandler = useCallback((params: GridCellParams) => {
        if (tableContext) {
            let isEditable = false;
            isEditable = !tableContext.lockedCellsIds.find((lock => lock.cell_id == params.row[params.field].id && currentUser?.id !== lock.user_id));
            isEditable = tableContext.rowPermissions?.find((rp: RowPermissionsModel) => rp.row == params.row.id) != undefined;
            return isEditable;
        }
        return true;
    }, [tableContext]);

    const debouncedSetFilter = useCallback(
        debounce((params: GridFilterModel) => {
            // Здесь отправка запроса на сервер
            if (id) {
                if (params.items.length != 0) {
                    if (sortModel.length == 0) {
                        getTableDataWithColumnFilter({
                            tableId: id,
                            page: paginationModel.page,
                            limit: paginationModel.pageSize,
                            filters: params.items,
                            mode: params.logicOperator, // and\or
                        });
                    } else {
                        getTableDataWithColumnFilter({
                            tableId: id,
                            page: paginationModel.page,
                            limit: paginationModel.pageSize,
                            filters: params.items,
                            mode: params.logicOperator, // and\or
                            sortField: sortModel[0].field,
                            sortDirection: sortModel[0].sort
                        });
                    }
                } else {
                    if (sortModel.length == 0) {
                        getTableData({
                            tableId: id,
                            page: paginationModel.page,
                            limit: paginationModel.pageSize,
                        });
                    } else {
                        getTableData({
                            tableId: id,
                            page: paginationModel.page,
                            limit: paginationModel.pageSize,
                            sortField: sortModel[0].field,
                            sortDirection: sortModel[0].sort
                        });
                    }
                }
            }
        }, 2000),
        [sortModel]
    );
    const handleFilterChange = (model: GridFilterModel) => {
        setFilterModel(model);
        debouncedSetFilter(model);
    };
    const handleSortChange = (model: GridSortModel) => {
        setSortModel(model);
        if (id) {
            if (model.length != 0) {
                if (filterModel.items.length > 0)
                    getTableDataWithColumnFilter({
                        tableId: id,
                        page: paginationModel.page,
                        limit: paginationModel.pageSize,
                        filters: filterModel.items,
                        mode: filterModel.logicOperator, // and\or
                        sortField: model[0].field,
                        sortDirection: model[0].sort
                    });
                else
                    getTableData({
                        tableId: id,
                        page: paginationModel.page,
                        limit: paginationModel.pageSize,
                        sortField: model[0].field,
                        sortDirection: model[0].sort
                    });
            } else {
                if (filterModel.items.length > 0)
                    getTableDataWithColumnFilter({
                        tableId: id,
                        page: paginationModel.page,
                        limit: paginationModel.pageSize,
                        filters: filterModel.items,
                        mode: filterModel.logicOperator, // and\or
                    });
                else
                    getTableData({
                        tableId: id,
                        page: paginationModel.page,
                        limit: paginationModel.pageSize,
                    });
            }
        }
    };
    const columnOrderChangeHandler = (event: { column: GridColDef, oldIndex: number, targetIndex: number }) => {
        if (props.wsCellsUpdate && id) {
            props.wsCellsUpdate.send(JSON.stringify({type: 'column_reorder', table_id: id, old_index: event.oldIndex + 1, new_index: event.targetIndex + 1}));
        }
    };
    // -----

    // Useful utils

    // Обработчик контекстного меню
    const handleContextMenu = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const target = event.target as HTMLElement;
        const rowElement = target.closest('[data-id]') as HTMLElement;

        if (rowElement) {
            const rowId = rowElement.getAttribute('data-id');

            if (rowId) {
                const row = tableContext?.rows.find(r => r.id === parseInt(rowId));
                if (row) {
                    setSelectedRow(row);
                    setContextMenu({
                        mouseX: event.clientX,
                        mouseY: event.clientY,
                        rowId: parseInt(rowId)
                    });
                }
            }
        }
    }, [tableContext?.rows]);

    const insertRowAtPosition = (currentRowId:number, positionIndex: number, withCopy:boolean) => {
        props.insertRow({
            tableId: id,
            position: positionIndex,
            withCopy,
            currentRowId
        });
    };

    const handleAddRowAfter = (event:{key:string}) => {
        if (!contextMenu?.rowId || !tableContext?.rows) return;

        const currentIndex = tableContext.rows.findIndex(row => row.id === contextMenu.rowId);
        if (currentIndex !== -1) {
            insertRowAtPosition(contextMenu.rowId, currentIndex + 1, event.key.includes("copy"));
        }
        setContextMenu(null);
    };

    const handleAddRowBefore = (event:{key:string}) => {
        if (!contextMenu?.rowId || !tableContext?.rows) return;
        const currentIndex = tableContext.rows.findIndex(row => row.id === contextMenu.rowId);

        if (currentIndex !== -1) {
            insertRowAtPosition(contextMenu.rowId, currentIndex, event.key.includes("copy"));
        }
        setContextMenu(null);
    };

    const showHistoryModalHandler = (event:{key:string}) => {
        if (!contextMenu?.rowId || !tableContext?.rows) return;
        const currentIndex = tableContext.rows.findIndex(row => row.id === contextMenu.rowId);
        if (currentIndex !== -1) {
            setHistoryModalVisible(true);
        }
        setContextMenu(null);
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    // Стили для новых строк
    const getRowClassName = (params: any) => {
        return params.row.isNew ? 'highlight-new-row' : '';
    };

    // Контекстное меню
    const contextMenuItems = [
        {
            key: 'add-before',
            label: 'Добавить строку "до" пустую',
            icon: <PlusOutlined />,
            onClick: handleAddRowBefore
        },
        {
            key: 'add-before-with-copy',
            label: 'Добавить строку "до" и скопировать данные',
            icon: <CopyOutlined />,
            onClick: handleAddRowBefore
        },
        {
            key: 'add-after',
            label: 'Добавить строку "после" пустую',
            icon: <PlusOutlined />,
            onClick: handleAddRowAfter
        },
        {
            key: 'add-after-with-copy',
            label: 'Добавить строку "после" и скопировать данные',
            icon: <CopyOutlined />,
            onClick: handleAddRowAfter
        },
        {
            key: 'show-history',
            label: 'Просмотреть историю изменений',
            icon: <HistoryOutlined />,
            onClick: showHistoryModalHandler
        },
    ];

    const apiRef = useGridApiRef();

    const processRowUpdateHandler = useCallback((newRow: GridRowModel, oldRow:GridRowModel) => {
        new Promise<GridRowModel>((resolve, reject) => {
            const mutation = computeMutation(newRow, oldRow);
            if (mutation) {
                //setPromiseArguments({resolve, reject, newRow, oldRow});
            } else {
                resolve(oldRow);
            }
        });
    }, []);
    // -----

    return (
        <div
            style={{height: window.innerHeight - 220, width: '100%'}}
            onContextMenu={handleContextMenu}
        >
            {(selectedRow && historyModalVisible) && <EditLogModal visible={historyModalVisible} setVisible={setHistoryModalVisible} rowId={selectedRow.id}/>}
            <DataGridPremium
                apiRef={apiRef}
                // Настройки пагинации
                pagination
                paginationMode="server"
                sortingMode="server"
                filterMode="server"
                rowCount={tableData ? tableData?.count : 0}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                onSortModelChange={(model) => handleSortChange(model)}
                onFilterModelChange={(model) => handleFilterChange(model)}
                pageSizeOptions={[25, 50, 100, 200, 300, 400, 500, 600]}
                // -----
                showCellVerticalBorder
                showColumnVerticalBorder
                onColumnOrderChange={columnOrderChangeHandler}
                isCellEditable={isCellEditableHandler}
                onCellEditStart={onCellEditStartHandler}
                onCellEditStop={onCellEditStopHandler}
                columnBufferPx={100}
                rowBufferPx={100}
                localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                rows={tableContext?.rows || []}
                columns={tableContext ? tableContext.columns : []}
                getRowHeight={() => 'auto'}
                sx={{
                    [`& .${gridClasses.cell}`]: {
                        p: 0,
                    },
                    // Стиль для новых строк
                    '& .highlight-new-row': {
                        backgroundColor: '#f0f8ff !important',
                        animation: 'fadeOut 2s ease-in 2s forwards',
                    },
                    '@keyframes fadeOut': {
                        to: { backgroundColor: 'transparent' }
                    },
                    // Отключаем выделение текста при правом клике
                    '& .MuiDataGrid-row': {
                        userSelect: 'none',
                    }
                }}
                loading={isTableDataLoading || isTableColumnsLoading}
                slots={{
                    columnMenu: ColumnMenu,
                }}
                getRowClassName={getRowClassName}
                initialState={{
                    pinnedColumns: {right: ['action'], left: ['order']}
                }}
                //@ts-ignore
                processRowUpdate={processRowUpdateHandler}
            />

            {/* Контекстное меню*/}
            <Dropdown
                open={!!contextMenu}
                onOpenChange={(open) => !open && handleCloseContextMenu()}
                menu={{ items: contextMenuItems }}
                trigger={['contextMenu']}
            >
                <div
                    style={{
                        position: 'fixed',
                        left: contextMenu?.mouseX || 0,
                        top: contextMenu?.mouseY || 0,
                        width: 1,
                        height: 1,
                    }}
                />
            </Dropdown>
        </div>
    );
};
