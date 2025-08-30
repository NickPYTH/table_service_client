import React, {useEffect, useState} from 'react';
import {Flex, Input, Modal} from 'antd';
import {tableAPI} from "service/TableService";
import {useNavigate} from "react-router-dom";

type ModalProps = {
    visible: boolean,
    setVisible: Function,
}

export const CreateTableModal = (props: ModalProps) => {

    // States
    const [tableName, setTableName] = useState("");
    const navigate = useNavigate();
    // -----

    // Web requests
    const [createTable, {
        data: createdTable,
        isSuccess: isCreateTableSuccess,
        isLoading: isCreateTableLoading
    }] = tableAPI.useCreateMutation();
    // -----

    // Effects
    useEffect(() => {
        if (isCreateTableSuccess && createdTable) {
            let tableId = createdTable.id;
            navigate(`${tableId}`);
        }
    }, [isCreateTableSuccess, createdTable]);
    // -----

    // Handlers
    const updateTableNameHandler = (value: string) => {
        setTableName(value);
    };
    const createTableHandler = () => {
        if (tableName) createTable(tableName);
    }
    // -----

    interface Person {
        name: string;
    }
    interface Lifespan {
        birth: Date,
        death?: Date
    }
    type K = keyof(Person | Lifespan)

    return (
        <Modal title={"Создание таблицы"}
               maskClosable={false}
               open={props.visible}
               onOk={createTableHandler}
               onCancel={() => props.setVisible(false)}
               okText={"Создать"}
               width={'500px'}
               loading={isCreateTableLoading}
               confirmLoading={isCreateTableLoading}
        >
            <Flex align={'center'} gap={'small'}>
                <div style={{width: 200}}>Название таблицы</div>
                <Input
                    placeholder={"Название таблицы"}
                    value={tableName}
                    onChange={(e) => updateTableNameHandler(e.target.value)}
                />
            </Flex>
        </Modal>
    );
};
