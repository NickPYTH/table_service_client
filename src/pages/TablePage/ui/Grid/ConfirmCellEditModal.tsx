import { Modal } from "antd";

type PropsType = {
    visible: boolean;
    setVisible: Function;
    ref: any,
}

export const ConfirmCellEditModal = (props:PropsType) => {

    // Handlers
    const confirmHandler = () => {

    };
    // -----

    return(
        <Modal title={"Подтвердите изменения"}
               maskClosable={false}
               open={props.visible}
               onOk={confirmHandler}
               onCancel={() => props.setVisible(false)}
               okText={"Добавить"}
               width={'500px'}
        >
            lel
        </Modal>
    )
}