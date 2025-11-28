import {Flex, Modal, Radio, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {PermissionModel} from "entities/PermissionModel";

const {Text} = Typography;

type ModalProps = {
    visible: boolean,
    setVisible: Function,
    refresh: Function,
    permission: PermissionModel
}

export const EditUserPermission = (props: ModalProps) => {

    // States
    const [isCanEdit, setIsCanEdit] = useState(props.permission.can_edit);
    // -----

    // Web request
    const [patchPermission, {
        isSuccess: isPatchPermissionSuccess,
        isLoading: isPatchPermissionLoading
    }] = rowPermissionsAPI.usePatchMutation();
    // -----

    // Handlers
    const updatePermissionHandler = () => {
        patchPermission({...props.permission, can_edit: isCanEdit});
    }
    // -----

    // Effects
    useEffect(() => {
        if (isPatchPermissionSuccess) {
            props.setVisible(false);
            props.refresh();
        }
    }, [isPatchPermissionSuccess]);
    // -----

    return (
        <Modal title={"Настройка доступа"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'600px'}
               loading={isPatchPermissionLoading}
               okText={"Сохранить"}
               onOk={updatePermissionHandler}
        >
            <Flex gap={'small'} vertical>
                <Flex gap={'middle'}>
                    <Text>
                        Возможность редактирования
                    </Text>
                    <Radio.Group
                        value={isCanEdit}
                        options={[
                            {value: true, label: "Да"},
                            {value: false, label: "Нет"},
                        ]}
                        onChange={(e) => setIsCanEdit(e.target.value)}
                    />
                </Flex>
            </Flex>
        </Modal>
    )
}