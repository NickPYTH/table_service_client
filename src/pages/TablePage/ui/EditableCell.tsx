import React, {useContext, useEffect, useState} from 'react';
import {Button, DatePicker, Flex, Form, GetRef, Input, InputNumber, Radio, Spin, Tag} from 'antd';
import {cellAPI} from "service/CellService";
import {CellModel} from "entities/CellModel";
import {CloseOutlined, SaveOutlined} from "@ant-design/icons";
import {TableContext} from "pages/TablePage/ui/TablePage";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";
import dayjs, {Dayjs} from "dayjs";
import {columnAPI} from "service/ColumnService";
import {ColumnModel} from "entities/ColumnModel";

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
    index: number;
}

export const EditableRow: React.FC<EditableRowProps> = ({index, ...props}) => {
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
    const [prevCellState, setPrevCellState] = useState<CellModel | null>(null);
    const [cellValue, setCellValue] = useState<string | number | Dayjs | boolean | null>(null);
    const [isCellLocked, setIsCellLocked] = useState<boolean>(false);
    const [column, setColumn] = useState<ColumnModel | null>(null);
    // -----

    // Web requests
    const [updateCellValue, {}] = cellAPI.usePatchMutation();
    const [getColumnInfo, {
        data: columnInfo,
        isLoading: isColumnInfoLoading
    }] = columnAPI.useGetMutation();
    // -----

    // Effects
    useEffect(() => {
        if (tableContext) {
            if (record && record[dataIndex]) {
                let lock: { user_id: number, cell_id: number } | undefined = tableContext.lockedCellsIds.find((lock: { user_id: number, cell_id: number }) => lock.cell_id == record[dataIndex].id);
                if (lock) {
                    if (lock.user_id == currentUser?.id) {
                        setEditing(true);
                        setPrevCellState(record[dataIndex]);
                        setCellValue(record[dataIndex].value);
                        setIsCellLocked(false);
                    } else setIsCellLocked(true);
                } else {
                    setEditing(false);
                    setIsCellLocked(false);
                }
            }
        }
    }, [tableContext]);
    useEffect(() => {
        if (editing && prevCellState) {
            getColumnInfo(prevCellState.column);
        }
    }, [editing]);
    useEffect(() => {
        if (columnInfo) setColumn(columnInfo);
    }, [columnInfo]);
    useEffect(() => {
        if (record) {
            let value: string = record[dataIndex]?.value;
            if (value == 'true' || value == 'false') setCellValue(value == 'true');
            else setCellValue(value);
        }
    }, [record])
    // -----

    // Handlers
    const toggleEdit = () => {
        if (isCellLocked) return;
        setEditing(!editing);
        setPrevCellState(record[dataIndex]);
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
            if (tmp.id && prevCellState) {
                let copy = JSON.parse(JSON.stringify(record));
                copy[prevCellState?.column].value = cellValue;
                updateCellValue({id: tmp.id, value: cellValue?.toString()});
                handleSave(copy);
            } else console.log('Save failed');
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };
    const cancel = () => {
        if (prevCellState) tableContext?.ws.send(JSON.stringify({cell_id: prevCellState.id, type: 'remove', user_id: currentUser?.id}));
        toggleEdit();
    };
    // -----

    // Useful utils
    let childNode = children;
    // -----

    if (editable) {
        childNode = (editing && !isCellLocked) ? (
            <Flex gap={'small'} align={'center'} justify={'center'} style={{width: "97%", padding: 5}}>
                {!isColumnInfoLoading ?
                    <>
                        {column?.data_type == "integer" ?
                            <InputNumber precision={0} style={{width: '100%'}} value={cellValue != null ? parseInt(cellValue.toString()) : null}
                                         onChange={(e) => setCellValue(e)}
                            /> :
                            column?.data_type == "text" ?
                                <Input value={cellValue ? cellValue.toString() : ""}
                                       onChange={(e) => setCellValue(e.target.value)}
                                /> :
                                column?.data_type == "float" ?
                                    <InputNumber style={{width: '100%'}} value={cellValue ? parseFloat(cellValue.toString()) : null}
                                                 onChange={(e) => setCellValue(e)}
                                    /> :
                                    column?.data_type == "date" ?
                                        <DatePicker placeholder={'Выберите дату'}
                                                    style={{width: '100%'}}
                                                    format={'DD.MM.YYYY'}
                                                    value={cellValue == null ? null : dayjs(cellValue.toString(), 'DD.MM.YYYY').isValid() ? dayjs(cellValue.toString(), 'DD.MM.YYYY') : null}
                                                    onChange={(date) => setCellValue(date.format('DD.MM.YYYY'))}
                                                    allowClear={false}
                                        /> :
                                        column?.data_type == "boolean" ?
                                            <Radio.Group
                                                value={cellValue}
                                                options={[
                                                    {value: 'true', label: "Да"},
                                                    {value: 'false', label: "Нет"},
                                                ]}
                                                onChange={(e) => setCellValue(e.target.value)}
                                            />
                                            :
                                            <Tag>Странно...</Tag>
                        }
                    </>
                    :
                    <Spin size={'small'}/>
                }
                <Button icon={<SaveOutlined/>} onClick={save}/>
                <Button danger icon={<CloseOutlined/>} onClick={cancel}/>
            </Flex>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{width: '100%', height: 40, fontSize: 12, background: isCellLocked ? '#f0f0f0' : 'inherit'}}
                onClick={toggleEdit}
            >
                {typeof cellValue == 'object' && cellValue != null ?
                    "cellValue" :
                    typeof cellValue == 'boolean' ? cellValue ? "Да" : "Нет" :
                        cellValue
                }
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};