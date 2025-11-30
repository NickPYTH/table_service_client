import { Modal, Typography } from "antd";
import {useEffect, useState} from "react";
import {filialAPI} from "service/FilialService";
import {cellAPI} from "service/CellService";

const {Paragraph} = Typography;

type PropsType = {
    oldValue: string;
    value: string;
    id: number;
    close: Function;
}

export const ConfirmCellEditModal = (props:PropsType) => {

    // States

    // -----

    // Handlers
    const confirmHandler = () => {
        if (props.value) {
            updateCell({id: props.id, value: props.value});
        }
    };
    const cancelHandler = () => {
        updateCell({id: props.id, value: props.oldValue});
        props.close();
    }
    // -----

    // Web requests
    const [updateCell, {
        data: updatedCell,
        isLoading: isUpdateCellLoading
    }] = cellAPI.usePatchMutation();
    // -----

    // Effects
    useEffect(() => {
        if (updatedCell) {
            props.close();
        }
    }, [updatedCell])
    // -----

    return(
        <Modal title={"Подтвердите ввод данных в ячейку!"}
               maskClosable={false}
               open={true}
               onOk={confirmHandler}
               onCancel={cancelHandler}
               okText={"Подтвердить"}
               width={'500px'}
               loading={isUpdateCellLoading}
        >
            <Paragraph>Ваше введенное значение: {props.value}</Paragraph>
            <Paragraph style={{fontWeight: 800}}>Введенное значение изменению не подлежит!</Paragraph>
        </Modal>
    )
}