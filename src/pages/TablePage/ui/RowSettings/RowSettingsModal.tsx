import React from 'react';
import {Divider, Flex, Modal} from 'antd';
import {UserPermission} from "pages/TablePage/ui/RowSettings/UserSettings/UserPermission";
import {FilialPermission} from "pages/TablePage/ui/RowSettings/FilialSettings/FilialPermission";


type ModalProps = {
    rowId: number,
    visible: boolean,
    setVisible: Function,
    refresh: Function,
}

export const RowSettingsModal = (props: ModalProps) => {

    return (
        <Modal title={"Настройки строки"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'650px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex gap={'small'} vertical>
                <UserPermission rowId={props.rowId}/>
                <Divider/>
                <FilialPermission rowId={props.rowId}/>
            </Flex>
        </Modal>
    );
};
