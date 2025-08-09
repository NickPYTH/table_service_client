import React, {useEffect, useState} from 'react';
import {Checkbox, Flex, Input, Modal, Select} from 'antd';
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
    visible: boolean,
    setVisible: Function,
    refresh: Function,
}

export const ColumnModal = (props: ModalProps) => {

    // States
    let {id} = useParams();
    const [columnName, setColumnName] = useState("");
    const [columnType, setColumnType] = useState<ColumnType>(ColumnType.TEXT);
    const [isRequired, setIsRequired] = useState(false);
    // -----

    // Web requests
    const [createColumn, {
        isSuccess: createColumnSuccess,
        isLoading: isCreateColumnLoading
    }] = columnAPI.useCreateMutation();
    // -----

    // Effects
    useEffect(() => {
        if (createColumnSuccess) {
            props.setVisible(false);
            props.refresh();
        }
    }, [createColumnSuccess]);
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
                type: columnType,
                table: id
            }
            createColumn(column);
        }
    }
    // -----

    return (
        <Modal title={"Добавить столбец"}
               maskClosable={false}
               open={props.visible}
               onOk={createColumnHandler}
               onCancel={() => props.setVisible(false)}
               okText={"Добавить"}
               width={'500px'}
               loading={isCreateColumnLoading}
               confirmLoading={isCreateColumnLoading}
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
