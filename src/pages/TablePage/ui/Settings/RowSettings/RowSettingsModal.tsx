import React from 'react';
import {Divider, Flex, Modal} from 'antd';
import {UserPermission} from "pages/TablePage/ui/Settings/UserSettings/UserPermission";
import {FilialPermission} from "pages/TablePage/ui/Settings/FilialSettings/FilialPermission";
import {rowPermissionsAPI} from "service/RowPermissionsService";


type ModalProps = {
    rowId: number,
    visible: boolean,
    setVisible: Function,
    refresh: Function,
}

export const RowSettingsModal = (props: ModalProps) => {

    // Web requests
    const [getPermissions, {
        data: permissions,
        isLoading: isPermissionsLoading
    }] = rowPermissionsAPI.useGetAllByRowIdMutation();
    const [deletePermission, {
        isSuccess: isSuccessDeletePermission,
        isLoading: isDeletePermissionLoading
    }] = rowPermissionsAPI.useDeleteMutation();
    // -----

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
                <UserPermission
                    id={props.rowId}
                    type={'row'}
                    getPermissions={getPermissions}
                    permissions={permissions}
                    isPermissionsLoading={isPermissionsLoading}
                    isDeletePermissionLoading={isDeletePermissionLoading}
                    deletePermission={deletePermission}
                    isSuccessDeletePermission={isSuccessDeletePermission}
                />
                <Divider/>
                <FilialPermission rowId={props.rowId}/>
            </Flex>
        </Modal>
    );
};
