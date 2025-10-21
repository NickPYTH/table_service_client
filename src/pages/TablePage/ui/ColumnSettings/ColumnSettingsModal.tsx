import React, {useContext, useEffect, useState} from 'react';
import {Button, Flex, Input, Modal, Popconfirm, Select} from 'antd';
import {useParams} from "react-router-dom";
import {columnAPI} from "service/ColumnService";
import {ColumnModel} from "entities/ColumnModel";
import {TableContext} from "pages/TablePage/ui/TablePage";
import {GridColDef} from "@mui/x-data-grid-premium";
import {SelectTypeList} from "pages/TablePage/ui/ColumnSettings/SelectTypeList";

enum ColumnType {
    TEXT = 'TEXT',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
    SELECT = 'SELECT',
    AUTO = 'AUTO'
}

type ModalProps = {
    id: number | null,
    visible: boolean,
    setVisible: Function,
    refresh: Function
}

export const ColumnSettingsModal = (props: ModalProps) => {

    // Context
    const tableContext = useContext(TableContext);
    // -----

    // States
    let {id} = useParams();
    const [columnName, setColumnName] = useState("");
    const [columnType, setColumnType] = useState<ColumnType>(ColumnType.TEXT);
    const [selectedColumnsIds, setSelectedColumnsIds] = useState<number[]>([]);
    // -----

    // Web requests
    const [getColumn, {
        data: column,
        isLoading: isGetColumnLoading
    }] = columnAPI.useGetMutation();
    const [createColumn, {
        isSuccess: createColumnSuccess,
        isLoading: isCreateColumnLoading
    }] = columnAPI.useCreateMutation();
    const [patchColumn, {
        isSuccess: patchColumnSuccess,
        isLoading: isPatchColumnLoading
    }] = columnAPI.usePatchMutation();
    const [deleteColumn, {
        isSuccess: deleteColumnSuccess,
        isLoading: isDeleteColumnLoading
    }] = columnAPI.useDeleteMutation();
    // -----

    // Effects
    useEffect(() => {
        if (props.id) getColumn(props.id);
    }, [props.id]);
    useEffect(() => {
        if (column) {
            setColumnName(column.name);
            setColumnType(column.data_type == 'text' ? ColumnType.TEXT :
                column.data_type == 'integer' ? ColumnType.INTEGER :
                column.data_type == 'float' ? ColumnType.FLOAT :
                column.data_type == 'date' ? ColumnType.DATE :
                column.data_type == 'boolean' ? ColumnType.BOOLEAN :
                column.data_type == 'select' ? ColumnType.SELECT :
                column.data_type == 'auto' ? ColumnType.AUTO :
                ColumnType.TEXT);
        }
    }, [column]);
    useEffect(() => {
        if (createColumnSuccess || patchColumnSuccess || deleteColumnSuccess) {
            props.setVisible(false);
            props.refresh();
        }
    }, [createColumnSuccess || patchColumnSuccess || deleteColumnSuccess]);
    // -----

    // Handlers
    const updateColumnNameHandler = (value: string) => {
        setColumnName(value);
    };
    const updateColumnTypeHandler = (value: ColumnType) => {
        setColumnType(value);
    };
    const createColumnHandler = () => {
        if (columnName && columnType) {
            let column: ColumnModel = {
                name: columnName,
                data_type: columnType.toLowerCase(),
                table: id
            }
            createColumn(column);
        }
    };
    const patchColumnHandler = () => {
        if (columnName && columnType && props.id) {
            let column: ColumnModel = {
                name: columnName,
                data_type: columnType.toLowerCase(),
            }
            patchColumn({id: props.id, body: column});
        }
    };
    const deleteColumnHandler = () => {
        if (props.id) deleteColumn(props.id);
    };
    // -----

    return (
        <Modal title={props.id ? "Редактировать столбец" : "Добавить столбец"}
               maskClosable={false}
               open={props.visible}
               onOk={props.id ? patchColumnHandler : createColumnHandler}
               onCancel={() => props.setVisible(false)}
               okText={props.id ? "Сохранить" : "Добавить"}
               width={'600px'}
               loading={isCreateColumnLoading || isPatchColumnLoading || isDeleteColumnLoading}
               confirmLoading={isCreateColumnLoading || isPatchColumnLoading || isDeleteColumnLoading}
               footer={() => (
                   <Flex gap={'small'} justify={'flex-end'}>
                       <Button onClick={props.id ? patchColumnHandler : createColumnHandler}>
                           {props.id ? "Сохранить" : "Добавить"}
                       </Button>
                       <Button onClick={() => props.setVisible(false)}>Отменить</Button>
                       {props.id &&
                           <Popconfirm title={"Удалить столбец?"} okText={"Да"} onConfirm={deleteColumnHandler}>
                               <Button danger>Удалить</Button>
                           </Popconfirm>
                       }
                   </Flex>
               )}
        >
            <Flex gap={'small'} vertical>
                <Flex align={'center'} gap={'small'}>
                    <div style={{width: 100}}>Название</div>
                    <Input
                        placeholder={"Название столбца"}
                        value={columnName}
                        onChange={(e) => updateColumnNameHandler(e.target.value)}
                    />
                </Flex>
                <Flex align={'center'} gap={'small'}>
                    <div style={{width: 100}}>Тип колонки</div>
                    <Select
                        value={columnType}
                        placeholder={"Выберите тип колонки"}
                        style={{width: '100%'}}
                        onChange={updateColumnTypeHandler}
                        options={Object.keys(ColumnType).map((type: string) => ({
                            value: type, label: type == ColumnType.TEXT ? "Текст" :
                                type == ColumnType.INTEGER ? "Целое" :
                                    type == ColumnType.FLOAT ? "Дробное" :
                                        type == ColumnType.BOOLEAN ? "Логическое" :
                                            type == ColumnType.DATE ? "Дата" :
                                                type == ColumnType.AUTO ? "Автоинкремент" :
                                                    (type == ColumnType.SELECT && props.id) ? "Список" :
                                                ""
                        }))}
                    />
                </Flex>
                {columnType == ColumnType.AUTO &&
                    <Flex align={'center'} gap={'small'}>
                        <div style={{width: 100}}>Колонки</div>
                        <Select
                            mode={'multiple'}
                            value={selectedColumnsIds}
                            placeholder={"Выберите колонки"}
                            style={{width: '100%'}}
                            onChange={(val) => setSelectedColumnsIds(val)}
                            options={tableContext?.columns?.map((column:GridColDef) => ({value: column.field, label: column.headerName}))}
                        />
                    </Flex>
                }
                {(columnType == ColumnType.SELECT && props.id) &&
                    <SelectTypeList columnId={props.id}/>
                }
            </Flex>
        </Modal>
    );
};
