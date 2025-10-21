import {Button, Divider, Flex, Input, Popconfirm} from "antd";
import {useEffect, useState} from "react";
import {GridColDef} from "@mui/x-data-grid-premium";
import {DataGrid} from "shared/component/DataGrid";
import {selectTypeAPI} from "service/SelectTypeService";
import {useNotification} from "app/providers/NotificationProvider/ui/NotificationProvider";

type PropsType = {
    columnId: number;
}

export const SelectTypeList = (props:PropsType) => {

    // Notification context
    const notification = useNotification();
    // -----

    // States
    const [newSelectTypeRecord, setNewSelectTypeRecord] = useState("")
    // -----

    // Web requests
    const [createSelectType, {
        isSuccess: isSuccessCreateType,
    }] = selectTypeAPI.useCreateMutation();
    const [deleteSelectType, {
        isSuccess: isSuccessDeleteType,
    }] = selectTypeAPI.useDeleteMutation();
    const [getSelectTypeList, {
        data: selectTypeList,
    }] = selectTypeAPI.useGetAllByColumnIdMutation();
    // -----

    // Effects
    useEffect(() => {
        getSelectTypeList(props.columnId);
    }, []);
    useEffect(() => {
        if (isSuccessCreateType || isSuccessDeleteType) {
            getSelectTypeList(props.columnId);
            setNewSelectTypeRecord("");
        }
    }, [isSuccessCreateType, isSuccessDeleteType]);
    // -----

    // Useful utils
    const columns: GridColDef[] = [
        {
            field: "id",
            headerName: "ИД"
        },
        {
            field: "name",
            headerName: "Содержимое",
            width: 300
        },
        {
            field: "actions",
            headerName: "",
            renderCell: (params) => {
                return (<Flex justify={'center'} style={{width: '100%'}}>
                    <Popconfirm title={"Вы точно хотите удалить "}
                                okText={"Да"}
                                onConfirm={() => deleteSelectType(params.id as number)}>
                        <Button
                                size={'small'}
                                danger>
                            Удалить
                        </Button>
                    </Popconfirm>
                </Flex>)
            }
        },
    ]
    // -----

    // Handlers
    const createSelectTypeHandler = () => {
        if (newSelectTypeRecord.trim()){
            if (selectTypeList?.find((st) => st.name == newSelectTypeRecord.trim())){
                notification.error({
                    message: "Нельзя так!",
                    description: "Такое значение уже существует"
                });
                return;
            }
            createSelectType({
                name: newSelectTypeRecord,
                column_id: props.columnId
            });
        } else {
            notification.error({
                message: "Нельзя так!",
                description: "Новое значение не может быть пустым"
            });
        }
    }
    // -----

    return(
        <Flex vertical gap={'small'}>
            <Divider style={{margin: 0, padding: 0}} />
            <Flex gap={'small'}>
                <Input placeholder="Введите новое значение" size={'small'} value={newSelectTypeRecord} onChange={(e) => setNewSelectTypeRecord(e.target.value)}/>
                <Button onClick={createSelectTypeHandler} type={'primary'} size={'small'}>Добавить</Button>
            </Flex>
            {selectTypeList &&
                <DataGrid columns={columns} gridData={selectTypeList} setSelected={() => {}} setModalVisible={() => {}}/>
            }
        </Flex>
    )
}