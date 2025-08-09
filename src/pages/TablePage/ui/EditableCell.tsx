import React, {useState} from 'react';
import type {GetRef} from 'antd';
import {Button, Flex, Form, Input} from 'antd';
import {cellAPI} from "service/CellService";
import {CellModel} from "entities/CellModel";
import {CheckOutlined, CloseOutlined, SaveOutlined} from "@ant-design/icons";

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
    const [cellValue, setCellValue] = useState<string>("");
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
        setCellValue(record[dataIndex].value);
    };
    const save = async () => {
        try {
            toggleEdit();
            let tmp = {...prevCellState, value: cellValue};
            if (tmp.id) {
                updateCellValue({id: tmp.id, value: cellValue})
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
            <Flex gap={'small'} style={{width: "100%"}}>
                    <Input value={cellValue}
                           onChange={(e) => setCellValue(e.target.value)}
                    />
                <Button icon={<SaveOutlined />} onClick={save}/>
                <Button danger icon={<CloseOutlined />} onClick={cancel}/>
            </Flex>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{ paddingInlineEnd: 0, width: '100%', height: 24 }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};