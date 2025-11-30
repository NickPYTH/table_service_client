import {
    DataGridPremium,
    GridCellParams,
    GridCellSelectionModel,
    gridClasses,
    GridColDef,
    GridFilterModel,
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
import {
    CopyOutlined,
    DeleteOutlined,
    DeleteRowOutlined,
    HistoryOutlined,
    PlusOutlined,
    SettingOutlined
} from "@ant-design/icons";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {PermissionModel} from "entities/PermissionModel";
import {useNotification} from "app/providers/NotificationProvider/ui/NotificationProvider";
import {formatDate, formatDateTime} from "shared/config/utils";
import {EditLogModal} from "pages/TablePage/ui/Grid/EditLogModal";
import {ConfirmCellEditModal} from "pages/TablePage/ui/Grid/ConfirmCellEditModal";
import {columnPermissionsAPI} from "service/ColumnPermissionsService";
import {COLUMN_KEYS} from "shared/config/constants";
import {CustomPaginationWithSelect} from "pages/TablePage/ui/Grid/CustomPagination";
import dayjs from "dayjs";

type PropsType = {
    wsCellLocks: WebSocket | null;
    wsCellsUpdate: WebSocket | null;
    setContext: Function;
    insertRow: Function;
    isTableOwner: boolean;
};

export const CoreGrid = (props: PropsType) => {

    // Notification context
    const notification = useNotification();
    // -----

    // Context
    const tableContext = useContext(TableContext);
    const apiRef = useGridApiRef();
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
    const [cellEditConfirmModal, setCellEditConfirmModal] = useState({visible: false, cellId: -1, cellValue: "", oldCellValue: ""});
    const [cellSelectionModel, setCellSelectionModel] = React.useState<GridCellSelectionModel>({});
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
    const [getColumnPermissions, {
        data: columnsPermissionsFromRequest,
    }] = columnPermissionsAPI.useGetAllByUserIdMutation();
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
                    editable: true,
                    minWidth: 200,
                    headerName: column.name,
                    renderHeader: () => (<Flex style={{minWidth: 200}} vertical>
                        <Flex>{column.name}</Flex>
                        <Flex gap={'small'} align={'center'}>
                            {/*@ts-ignore*/}
                            <Tag>{column.order != undefined ? COLUMN_KEYS[column.order.toString()] : ""}</Tag>
                            <Tag color={'blue'}>{column.data_type == 'text' ? 'строка' :
                                column.data_type == 'integer' ? 'число' :
                                    column.data_type == 'float' ? 'число' :
                                        column.data_type == 'date' ? 'дата' :
                                            column.data_type == 'datetime' ? 'дата и время' :
                                                column.data_type == 'boolean' ? 'список' :
                                                    column.data_type == 'select' ? 'список' :
                                                        column.data_type == 'auto' ? 'счетчик' :
                                                        'строка'}</Tag>
                        </Flex>
                    </Flex>),
                    type: column.data_type == 'text' ? 'string' :
                        column.data_type == 'integer' ? 'number' :
                            column.data_type == 'float' ? 'number' :
                                column.data_type == 'date' ? 'date' :
                                    column.data_type == 'datetime' ? 'dateTime' :
                                        column.data_type == 'boolean' ? 'singleSelect' :
                                            column.data_type == 'select' ? 'singleSelect' :
                                                'string',
                    valueGetter: (params: CellModel) => {
                        if (params.value == null)
                            return "";
                        if (typeof params.value == "object") {
                            // Встретили дату
                            //@ts-ignore
                            if (params.value.getHours() == 0)
                                return formatDate(params.value);
                            else
                                return formatDateTime(params.value);
                        } else {
                            // Если тип данных колонки явно указан - Дата. Следует проверить не является ли датой ячейка
                            if (column.data_type == 'date') {
                                if (dayjs(params.value, "DD.MM.YYYY").isValid()) {
                                    const [day, month, year] = params.value.split('.');
                                    //@ts-ignore
                                    return new Date(year, month-1, day)
                                }
                            }
                            if (column.data_type == 'datetime') {
                                if (dayjs(params.value, "DD.MM.YYYY HH:mm").isValid() || dayjs(params.value, "DD.MM.YYYY").isValid()) {
                                    let djs = dayjs(params.value, "DD.MM.YYYY HH:mm").isValid() ?
                                        dayjs(params.value, "DD.MM.YYYY HH:mm")
                                        :
                                        dayjs(params.value, "DD.MM.YYYY");
                                    //@ts-ignore
                                    return new Date(djs.year(), djs.month(), djs.date(), djs.hour(), djs.minute(), 0)
                                }
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
                            if (params.getHours() == 0)
                                return formatDate(params);
                            else
                                return formatDateTime(params);
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
                renderCell: (data) => (
                    <Flex style={{height: '100%'}} gap={'small'} align={'center'} justify={'center'}>
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

            // Получаем права на колонки
            if (currentUser && id)
                getColumnPermissions({table_id: id, user_id: currentUser.id, columnIds: columns.map(column => parseInt(column.field))});
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
        if (columnsPermissionsFromRequest) {
            props.setContext((prev: TableContextType) => ({...prev, columnPermissions: columnsPermissionsFromRequest}));
        }
    }, [columnsPermissionsFromRequest]);
    useEffect(() => {
        if (isDeleteRowSuccess) {
            notification.success({
                message: "Успешно!",
                description: "Строка удалена."
            });
        }
    }, [isDeleteRowSuccess]);
    // -----

    // Handlers
    const onCellEditStartHandler = (params: GridCellParams) => {
        // Создаем блокировку на сервере
        if (props.wsCellLocks) {
            let cellId: number = params.row[params.field].id;
            props.wsCellLocks.send(JSON.stringify({cell_id: cellId, type: 'create', user_id: currentUser?.id}));
        }
        // -----
    };
    const onCellEditStopHandler = (params: GridCellParams, event:any) => {
        let cellId: number = params.row[params.field].id;
        if (tableContext?.withCellConfirm) {
            setTimeout(() => {
                const cellValue = apiRef.current.getCellValue(params.id, params.field); // row id and column id
                //@ts-ignore
                const oldCellValue = tableContext.rows.find((row: RowModel) => row.id === params.id)[params.field]?.value;
                setCellEditConfirmModal({
                    visible: true,
                    cellId,
                    cellValue,
                    oldCellValue
                })
                // Затираем значение в ячейке, тк ждем его подтверждение в модалке
                props.setContext((prevState: TableContextType) => {
                    let data = JSON.parse(JSON.stringify(prevState.rows));
                    //@ts-ignore
                    data.find((row: RowModel) => row.id === params.id)[params.field].value = "";
                    return {...prevState, rows: data};
                });
            }, 200)
        }
        setTimeout(() => {
            // Ебаный костыль из-за асинхронного обновления грида
            const actualValue = apiRef.current.getCellValue(params.id, params.field);
            // Обновляем значение ячейки на сервере
            if (props.wsCellsUpdate) {

                props.wsCellsUpdate.send(JSON.stringify({
                    cell_id: cellId,
                    type: 'update',
                    user_id: currentUser?.id,
                    value: actualValue ?? ""
                }));
            }
            // -----
        }, 10);
        // Снимаем блокировку на сервере
        if (props.wsCellLocks) {
            props.wsCellLocks.send(JSON.stringify({cell_id: cellId, type: 'remove', user_id: currentUser?.id}));
        }
        // -----
    };
    const isCellEditableHandler = useCallback((params: GridCellParams) => {
        if (tableContext) {
            let isEditableCell = false;
            let isRowEditablePermission = false;
            let isColumnEditablePermission = false;
            let isConfirmModeWithFilledCell = true;
            isEditableCell = !tableContext.lockedCellsIds.find((lock => lock.cell_id == params.row[params.field].id && currentUser?.id !== lock.user_id));
            isRowEditablePermission = tableContext.rowPermissions?.find((rp: PermissionModel) => rp.row == params.row.id) != undefined;
            isColumnEditablePermission = tableContext.columnPermissions?.find((cp: PermissionModel) => cp.column?.toString() == params.field) != undefined;
            if (tableContext.withCellConfirm && tableContext.owner?.id != currentUser?.id) {
                if (params.row[params.field].value != null || params.row[params.field] != "")
                    isConfirmModeWithFilledCell = false;
            }
            return isEditableCell && isRowEditablePermission && isColumnEditablePermission && isConfirmModeWithFilledCell;
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
            props.wsCellsUpdate.send(JSON.stringify({type: 'column_reorder', table_id: id, old_index: event.oldIndex , new_index: event.targetIndex}));
        }
    };
    const handleCellSelectionModelChange = useCallback(
        (newModel: GridCellSelectionModel) => {
            setCellSelectionModel(newModel);
        },
        [],
    );
    // -----

    // Useful utils

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

    const handleInsertCellValues = () => {
        if (tableContext?.rows) {
            const data = tableContext.rows;
            let firstCell: any | undefined;
            // Обход строк
            Object.keys(cellSelectionModel).map((rowId: any) => {
                let row:any = data.find((row:DataRowModel) => row.id == rowId);
                if (row) {
                    // Обход колонок
                    Object.keys(row).map((columnId: string) => {
                        if (row) {
                            let cell = row[columnId];
                            if (typeof cell == 'object') {
                                let selectedColumnId = cellSelectionModel[rowId];
                                if (selectedColumnId[cell.column]) {
                                    if (!firstCell) {
                                        firstCell = cell; // Значение 1ой ячейки не трогаем это оригинал
                                    } else {
                                        setTimeout(() => {
                                            // Обновляем значение ячейки на сервере
                                            if (props.wsCellsUpdate) {
                                                let cellId: number = cell.id;
                                                props.wsCellsUpdate.send(JSON.stringify({
                                                    cell_id: cellId,
                                                    type: 'update',
                                                    user_id: currentUser?.id,
                                                    value: firstCell.value ?? ""
                                                }));
                                            }
                                            // -----
                                        }, 10);
                                    }
                                }
                            }
                        }
                    });
                }
            });
        }
    };

    const handleClearCellValues = () => {
        if (tableContext?.rows) {
            const data = tableContext.rows;
            // Обход строк
            Object.keys(cellSelectionModel).map((rowId: any) => {
                let row:any = data.find((row:DataRowModel) => row.id == rowId);
                if (row) {
                    // Обход колонок
                    Object.keys(row).map((columnId: string) => {
                        if (row) {
                            let cell = row[columnId];
                            if (typeof cell == 'object') {
                                let selectedColumnId = cellSelectionModel[rowId];
                                if (selectedColumnId[cell.column]) {
                                    setTimeout(() => {
                                        // Обновляем значение ячейки на сервере
                                        if (props.wsCellsUpdate) {
                                            let cellId: number = cell.id;
                                            props.wsCellsUpdate.send(JSON.stringify({
                                                cell_id: cellId,
                                                type: 'update',
                                                user_id: currentUser?.id,
                                                value: ""
                                            }));
                                        }
                                        // -----
                                    }, 10);
                                }
                            }
                        }
                    });
                }
            });
        }
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handlePaginationChange = (smth:{page: number, pageSize:number}) => {
        if (!isTableDataLoading)
            setPaginationModel(smth);
    }

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
            onClick: showHistoryModalHandler,
        },
        {
            key: 'copy-content',
            label: 'Растянуть значания',
            icon: <PlusOutlined />,
            onClick: handleInsertCellValues,
        },
        {
            key: 'clear-content',
            label: 'Очистить',
            icon: <DeleteOutlined />,
            onClick: handleClearCellValues,
        }
    ];
    // -----

    return (
        <div
            style={{height: window.innerHeight - 220, width: '100%'}}
            onContextMenu={handleContextMenu}
        >
            {cellEditConfirmModal.visible && <ConfirmCellEditModal id={cellEditConfirmModal.cellId} value={cellEditConfirmModal.cellValue} oldValue={cellEditConfirmModal.oldCellValue} close={() => setCellEditConfirmModal({visible: false, cellValue: "", oldCellValue: "", cellId: -1})}/>}
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
                onPaginationModelChange={handlePaginationChange}
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
                columnBufferPx={300}
                rowBufferPx={300}
                localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                rows={tableContext?.rows || []}
                columns={tableContext ? tableContext.columns : []}
                //getRowHeight={() => 'auto'}
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
                //disableVirtualization={true}  // Явно убедитесь, что виртуализация включена
                // Опционально: стандартные настройки пагинации
                slotProps={{
                    pagination: {
                        showFirstButton: true,
                        showLastButton: true,
                    },
                }}
                loading={isTableDataLoading || isTableColumnsLoading}
                slots={{
                    columnMenu: ColumnMenu,
                    pagination: CustomPaginationWithSelect
                }}
                getRowClassName={getRowClassName}
                initialState={{
                    pinnedColumns: {right: ['action'], left: ['order']}
                }}
                // Выбор ячеек
                cellSelectionModel={cellSelectionModel}
                onCellSelectionModelChange={handleCellSelectionModelChange}
                cellSelection
                // -----
            />

            {/* Контекстное меню*/}
            <Dropdown
                open={!!contextMenu}
                onOpenChange={(open) => !open && handleCloseContextMenu()}
                menu={{ items: contextMenuItems}}
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
