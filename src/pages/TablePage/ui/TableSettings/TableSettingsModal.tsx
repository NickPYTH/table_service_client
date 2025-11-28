import React, {useContext, useEffect, useState} from 'react';
import {Divider, Flex, Modal, Radio, Typography} from 'antd';
import {UserPermission} from "pages/TablePage/ui/TableSettings/UserSettings/UserPermission";
import {FilialPermission} from "pages/TablePage/ui/TableSettings/FilialSettings/FilialPermission";
import {TableModel} from "entities/TableModel";
import {tableAPI} from "service/TableService";
import {useNotification} from "app/providers/NotificationProvider/ui/NotificationProvider";
import {TableContext} from "pages/TablePage/ui/TablePage";

const {Text, Title} = Typography;

type ModalProps = {
    table: TableModel;
    visible: boolean;
    setVisible: Function;
    setContext: Function;
};

export const TableSettingsModal = (props: ModalProps) => {

    // Context
    const tableContext = useContext(TableContext);
    // -----

    // Notification context
    const notification = useNotification();
    // -----

    // States
    const [withCellConfirm, setWithCellConfirm] = useState(false);
    const [withCellLogging, setWithCellLogging] = useState(false);
    // -----

    // Web requests
    const [update, {
        isSuccess: isUpdateSuccess,
    }] = tableAPI.usePatchMutation();
    // -----

    // Handlers
    const updateWithCellConfirmHandler = (val:boolean) => {
        update({...props.table, with_cell_confirm: val, with_cell_logging: withCellLogging});
        props.setContext({...tableContext, withCellConfirm: val});
        setWithCellConfirm(val);
    };
    // -----

    // Effects
    useEffect(() => {
        setWithCellLogging(props.table.with_cell_logging);
        setWithCellConfirm(!!tableContext?.withCellConfirm);
    }, []);
    useEffect(() => {
        if (isUpdateSuccess) {
            notification.success({
                message: "Успешно!",
                description: "Настройки сохранены."
            });
        }
    }, [isUpdateSuccess]);
    // -----

    return (
        <Modal title={"Настройки таблицы"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'650px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex gap={'small'} vertical>
                <Flex vertical gap={'small'}>
                    <Title level={5}>Общие настройки</Title>
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
                            onChange={(e) => updateWithCellConfirmHandler(e.target.value)}
                        />
                    </Flex>
                </Flex>
                <Divider style={{margin: 0}}/>
                <UserPermission />
                <Divider style={{margin: 0}}/>
                <FilialPermission/>
            </Flex>
        </Modal>
    );
};
