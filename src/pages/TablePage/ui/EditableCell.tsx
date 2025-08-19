import React, {useContext, useEffect, useState} from 'react';
import type {GetRef} from 'antd';
import {Button, Checkbox, DatePicker, Flex, Form, Input, InputNumber, Tag} from 'antd';
import {cellAPI} from "service/CellService";
import {CellModel} from "entities/CellModel";
import {CloseOutlined, SaveOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {TableContext} from "pages/TablePage/ui/TablePage";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
    index: number;
}

export const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof any;
    record: any;
    handleSave: (record: any) => void;
}

export const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
                                                                                title,
                                                                                editable,
                                                                                children,
                                                                                dataIndex,
                                                                                record,
                                                                                handleSave,
                                                                                ...restProps
                                                                            }) => {
    // States
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    const tableContext = useContext(TableContext);
    const [editing, setEditing] = useState(false);
    const [prevCellState, setPrevCellState] = useState<CellModel|null>(null);
    const [cellValue, setCellValue] = useState<any>();
    const [isCellLocked, setIsCellLocked] = useState<boolean>(false);
    // -----

    // Web requests
    const [updateCellValue, {
    }] = cellAPI.usePatchMutation();
    // -----

    // Effects
    useEffect(() => {
        if (tableContext) {
            if (record && record[dataIndex]){
                let lock:{user_id:number, cell_id: number}|undefined = tableContext.lockedCellsIds.find((lock:{user_id:number, cell_id: number}) => lock.cell_id == record[dataIndex].id);
                if (lock) {
                    if (lock.user_id == currentUser?.id) {
                        setEditing(true);
                        setPrevCellState(record[dataIndex]);
                        if (record[dataIndex].column.data_type == 'date' && record[dataIndex].value) setCellValue(dayjs(record[dataIndex].value, "YYYY-MM-DD"))
                        else setCellValue(record[dataIndex].value);
                        setIsCellLocked(false);
                    } else setIsCellLocked(true);
                } else {
                    setEditing(false);
                    setIsCellLocked(false);
                }
            }
        }
    }, [tableContext]);
    // -----

    // Handlers
    const toggleEdit = () => {
        setEditing(!editing);
        setPrevCellState(record[dataIndex]);
        if (record[dataIndex].column.data_type == 'date' && record[dataIndex].value) setCellValue(dayjs(record[dataIndex].value, "YYYY-MM-DD"))
        else setCellValue(record[dataIndex].value);

        if (!editing) {
            // Отправляем изменения на сервер
            if (tableContext?.ws) {
                let ws = tableContext.ws;
                ws.send(JSON.stringify({cell_id: record[dataIndex]?.id, type: 'create', user_id: currentUser?.id}));
            }
            // -----
        }
    };
    const save = async () => {
        if (prevCellState) tableContext?.ws.send(JSON.stringify({cell_id: prevCellState.id, type: 'remove', user_id: currentUser?.id}));
        try {
            toggleEdit();
            let tmp = {...prevCellState, value: cellValue};
            if (tmp.id) {
                let copy = JSON.parse(JSON.stringify(record));
                if (prevCellState?.column.data_type == 'date'){
                    if (typeof cellValue == "object") {
                        //@ts-ignore
                        copy[prevCellState?.column?.id].value = cellValue.format('DD.MM.YYYY');
                        updateCellValue({id: tmp.id, value: cellValue.format('YYYY-MM-DD')});
                    }
                    else {
                        //@ts-ignore
                        copy[prevCellState?.column?.id].value = "";
                        updateCellValue({id: tmp.id, value: ""});
                    }
                } else {
                    //@ts-ignore
                    copy[prevCellState?.column?.id].value = cellValue;
                    updateCellValue({id: tmp.id, value: cellValue});
                }
                handleSave(copy);
            } else console.log('Save failed');
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };
    const cancel = () => {
        if (prevCellState) tableContext?.ws.send(JSON.stringify({cell_id: prevCellState.id, type: 'remove', user_id: currentUser?.id}));
        toggleEdit();
    }
    // -----

    // Useful utils
    let childNode = children;
    // -----
    if (editable) {
        childNode = (editing && !isCellLocked) ? (
            <Flex gap={'small'} justify={'center'} style={{width: "97%", padding: 5 }}>
                {prevCellState?.column.data_type == "integer" ?
                    <InputNumber precision={0} style={{width: '100%'}} value={cellValue}
                           onChange={(e) => setCellValue(e)}
                    /> :
                    prevCellState?.column.data_type == "text" ?
                        <Input value={cellValue}
                               onChange={(e) => setCellValue(e.target.value)}
                        /> :
                    prevCellState?.column.data_type == "float" ?
                        <InputNumber style={{width: '100%'}} value={cellValue}
                                     onChange={(e) => setCellValue(e)}
                        /> :
                    prevCellState?.column.data_type == "date" ?
                        <DatePicker placeholder={'Выберите дату'}
                                    style={{width: '100%'}}
                                    format={'DD.MM.YYYY'}
                                    value={cellValue}
                                    onChange={(date) => setCellValue(date)}
                                    allowClear={false}
                        /> :
                    prevCellState?.column.data_type == "boolean" ?
                        <Checkbox checked={!!cellValue} onChange={(e) => setCellValue(e.target.checked)}/>:
                    <Tag>Странно...</Tag>
                }
                <Button icon={<SaveOutlined />} onClick={save}/>
                <Button danger icon={<CloseOutlined />} onClick={cancel}/>
            </Flex>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{width: '100%', height: 24, background: isCellLocked ? '#f0f0f0': 'inherit' }}
                onClick={toggleEdit}
            >
                {record[dataIndex]?.column.data_type == "boolean" ?
                    <>{record[dataIndex]?.value ? "Да" : "Нет"}</>
                    :
                    <>{record[dataIndex]?.value}</>
                }
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};