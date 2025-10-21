import React, {useEffect, useState} from 'react';
import {Flex, Input, Modal, Radio, Typography} from 'antd';
import {tableAPI} from "service/TableService";
import {useNavigate} from "react-router-dom";

const {Text} = Typography;

type ModalProps = {
    visible: boolean,
    setVisible: Function,
}

export const CreateTableModal = (props: ModalProps) => {

    // States
    const [tableName, setTableName] = useState("");
    const [withCellConfirm, setWithCellConfirm] = useState(false);
    const [withCellLogging, setWithCellLogging] = useState(false);
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
        if (tableName) createTable({
            title: tableName,
            with_cell_confirm: withCellConfirm,
            with_cell_logging: withCellLogging
        });
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
            <Flex vertical gap={'small'}>
                <Flex gap={'small'} align={'center'}>
                    <Text style={{width: 220}}>Название таблицы</Text>
                    <Input
                        placeholder={"Название таблицы"}
                        value={tableName}
                        onChange={(e) => updateTableNameHandler(e.target.value)}
                    />
                </Flex>
                <Flex gap={'small'}>
                    <Text style={{width: 220}}>
                        Подтверждение ввода в ячейку
                    </Text>
                    <Radio.Group
                        value={withCellConfirm}
                        options={[
                            {value: true, label: "Да"},
                            {value: false, label: "Нет"},
                        ]}
                        onChange={(e) => setWithCellConfirm(e.target.value)}
                    />
                </Flex>
            </Flex>
        </Modal>
    );
};
