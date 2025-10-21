import {DataGrid} from "shared/component/DataGrid";
import {useEffect} from "react";
import {cellEditLogAPI} from "service/CellEditLogService";
import {Modal} from "antd";
import { GridColDef } from "@mui/x-data-grid-premium";

type PropsType = {
    rowId: any,
    visible: boolean,
    setVisible: Function
}

export const EditLogModal = (props:PropsType) => {

    // Web requests
    const [getLogs, {
        data: logs,
        isLoading: isLogsLoading
    }] = cellEditLogAPI.useGetAllByRowIdMutation();
    // -----

    // Effects
    useEffect(() => {
        getLogs(props.rowId);
    }, []);
    // -----

    // Useful utils
    let columns: GridColDef[] = [
        {
            field: "id",
            headerName: "ИД",
        },
        {
            field: "user_id",
            headerName: "ИД пользователя",
            width: 200
        },
        {
            field: "old_value",
            headerName: "Старое значение",
            width: 200
        },
        {
            field: "new_value",
            headerName: "Новое значение",
            width: 200
        },
        {
            field: "cell_id",
            headerName: "Ячейка",
            width: 200
        },
    ];
    // -----

    return (
        <Modal title={"История"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               loading={isLogsLoading}
               width={'1000px'}
               footer={() => {}}
        >
            <DataGrid columns={columns} gridData={logs} setSelected={() => {}} setModalVisible={() => {}} />
        </Modal>
    )
}