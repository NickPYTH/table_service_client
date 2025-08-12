import React, {useState} from 'react';
import type {GetRef} from 'antd';
import {Button, Checkbox, Flex, Form, Input, Tag} from 'antd';
import {cellAPI} from "service/CellService";
import {CellModel} from "entities/CellModel";
import {CloseOutlined, SaveOutlined} from "@ant-design/icons";

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
    const [editing, setEditing] = useState(false);
    const [prevCellState, setPrevCellState] = useState<CellModel|null>(null);
    const [cellValue, setCellValue] = useState<any>();
    // -----

    // Web requests
    const [updateCellValue, {
        isSuccess: isUpdateCellValueSuccess,
        isLoading: isUpdateCellValueLoading
    }] = cellAPI.usePatchMutation();
    // -----

    // Effects

    // -----

    // Handlers
    const toggleEdit = () => {
        setEditing(!editing);
        setPrevCellState(record[dataIndex]);
        console.log(dataIndex, record, record[dataIndex])
        setCellValue(record[dataIndex].value);
    };
    const save = async () => {
        try {
            toggleEdit();
            let tmp = {...prevCellState, value: cellValue};
            if (tmp.id) {
                updateCellValue({id: tmp.id, value: cellValue.toString()})
                let copy = JSON.parse(JSON.stringify(record));
                //@ts-ignore
                copy[prevCellState?.column?.id].value = cellValue
                handleSave(copy);
            } else console.log('Save failed');
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };
    const cancel = () => {
        toggleEdit();
    }
    // -----

    // Useful utils
    let childNode = children;
    // -----

    if (editable) {
        childNode = editing ? (
            <Flex gap={'small'} justify={'center'} style={{width: "97%", padding: 5 }}>
                {prevCellState?.column.data_type == "integer" ?
                    <Input value={cellValue}
                           onChange={(e) => setCellValue(e.target.value)}
                    /> :
                    prevCellState?.column.data_type == "text" ?
                        <Input value={cellValue}
                               onChange={(e) => setCellValue(e.target.value)}
                        /> :
                    prevCellState?.column.data_type == "float" ?
                    <Input value={cellValue}
                           onChange={(e) => setCellValue(e.target.value)}
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
                style={{width: '100%', height: 24 }}
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