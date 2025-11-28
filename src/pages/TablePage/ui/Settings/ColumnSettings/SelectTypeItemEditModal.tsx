import React, {useEffect, useState} from "react";
import {Button, Flex, Input, Modal} from "antd";
import {SelectTypeModel} from "entities/SelectTypeModel";
import {selectTypeAPI} from "service/SelectTypeService";

type PropsType = {
    visible: boolean;
    setVisible: Function;
    refresh: Function;
    item: SelectTypeModel;
}

export const SelectTypeItemEditModal = (props:PropsType) => {

    // States
    const [value, setValue] = useState(props.item.name);
    // -----

    // Web requests
    const [update, {
        isSuccess: isSuccessUpdate,
    }] = selectTypeAPI.useUpdateMutation();
    // ----

    // Effects
    useEffect(() => {
        if (isSuccessUpdate) {
            props.setVisible(false);
            props.refresh();
        }
    }, [isSuccessUpdate]);
    // -----

    // Handlers
    const updateHandler = () => {
        if (value){
            update({...props.item, name: value});
        }
    };
    // -----

    return (
        <Modal title={`Редактирование`}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'650px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex gap={'small'} align={'center'}>
                <div>Значение</div>
                <Input value={value} onChange={(e) => setValue(e.target.value)}/>
                <Button onClick={updateHandler}>Сохранить</Button>
            </Flex>
        </Modal>
    )
}