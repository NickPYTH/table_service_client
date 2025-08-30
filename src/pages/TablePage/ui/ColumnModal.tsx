import React, {useEffect, useState} from 'react';
import {Button, Checkbox, Flex, Input, Modal, Popconfirm, Select} from 'antd';
import {useParams} from "react-router-dom";
import {columnAPI} from "service/ColumnService";
import {ColumnModel} from "entities/ColumnModel";

enum ColumnType {
    TEXT = 'TEXT',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE'
}

type ModalProps = {
    column: ColumnModel | null,
    visible: boolean,
    setVisible: Function,
    refresh: Function,
}

export const ColumnModal = (props: ModalProps) => {

    // States
    let {id} = useParams();
    const [columnName, setColumnName] = useState(props.column ? props.column.name : "");
    const [columnType, setColumnType] = useState<ColumnType>(props.column ? props.column.data_type.toUpperCase() : ColumnType.TEXT);
    const [isRequired, setIsRequired] = useState(false);
    // -----

    // Web requests
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
    const updateIsRequiredHandler = (value: boolean) => {
        setIsRequired(value)
    };
    const createColumnHandler = () => {
        if (columnName && columnType){
            let column: ColumnModel = {
                name: columnName,
                data_type: columnType.toLowerCase(),
                table: id
            }
            createColumn(column);
        }
    };
    const patchColumnHandler = () => {
        if (columnName && columnType && props.column && props.column.id){
            let column: ColumnModel = {
                name: columnName,
                data_type: columnType.toLowerCase(),
            }
            patchColumn({id: props.column.id, body: column});
        }
    };
    const deleteColumnHandler = () => {
        if (props.column && props.column.id){
            deleteColumn(props.column.id);
        }
    };
    // -----

    return (
        <Modal title={props.column ? "Редактировать столбец" : "Добавить столбец"}
               maskClosable={false}
               open={props.visible}
               onOk={props.column ? patchColumnHandler : createColumnHandler}
               onCancel={() => props.setVisible(false)}
               okText={props.column ? "Сохранить" : "Добавить"}
               width={'500px'}
               loading={isCreateColumnLoading || isPatchColumnLoading || isDeleteColumnLoading}
               confirmLoading={isCreateColumnLoading || isPatchColumnLoading || isDeleteColumnLoading}
               footer={() => (
                   <Flex gap={'small'} justify={'flex-end'}>
                       <Popconfirm title={"Удалить колонку?"} okText={"Да"} onConfirm={deleteColumnHandler}>
                           <Button danger>Удалить</Button>
                       </Popconfirm>
                       <Button onClick={() => props.setVisible(false)}>Отменить</Button>
                       <Button onClick={props.column ? patchColumnHandler : createColumnHandler}>
                           {props.column ? "Сохранить" : "Добавить"}
                       </Button>
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
                    <div style={{width: 100}}>Тип колнки</div>
                    <Select
                        value={columnType}
                        placeholder={"Выберите тип колонки"}
                        style={{width: '100%'}}
                        onChange={updateColumnTypeHandler}
                        options={Object.keys(ColumnType).map((type: string) => ({value: type, label: type}))}
                    />
                </Flex>
                <Flex align={'center'} gap={'small'}>
                    <div style={{width: 270}}>Обязательная для заполнения колнка</div>
                    <Checkbox style={{marginTop: 2.5}} checked={isRequired} onChange={(e) => updateIsRequiredHandler(e.target.checked)}/>
                </Flex>
            </Flex>
        </Modal>
    );
};
