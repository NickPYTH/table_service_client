import React, {useEffect, useState} from 'react';
import {Flex, Input, Modal, UploadFile, UploadProps} from 'antd';
import {tableAPI} from "service/TableService";
import {useNavigate} from "react-router-dom";
import {InboxOutlined} from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";

type ModalProps = {
    visible: boolean,
    setVisible: Function,
}

export const ImportTableModal = (props: ModalProps) => {

    // States
    const [tableName, setTableName] = useState("");
    const [file, setFile] = useState<any | null>(null);
    const navigate = useNavigate();
    // -----

    // Web requests
    const [createTable, {
        data: createdTable,
        isSuccess: isCreateTableSuccess,
        isLoading: isCreateTableLoading
    }] = tableAPI.useCreateMutation();
    // -----

    // Effects
    useEffect(() => {
        if (isCreateTableSuccess && createdTable) {
            let tableId = createdTable.id;
            navigate(`${tableId}`);
        }
    }, [isCreateTableSuccess, createdTable]);
    // -----

    // Handlers
    const updateTableNameHandler = (value: string) => {
        setTableName(value);
    };

    const importDataHandler = () => {
        if (tableName && file) {
            const formData = new FormData();
            formData.append("table_name", tableName);
            formData.append("file", file, "file.xlsx");

            const requestOptions = {
                method: "POST",
                body: formData,
                redirect: "follow"
            };

            //@ts-ignore
            fetch("http://localhost:8000/api/file/upload/", requestOptions)
                .then((response) => response.text())
                .then((result) => console.log(result))
                .catch((error) => console.error(error));
        }
    }
    // -----

    // Useful
    const uploadProps: UploadProps = {
        accept: ".xls,.xlsx",
        maxCount: 1,
        customRequest: (e) => {
            setFile(e.file);
        },
        onRemove: () => setFile(null),
        fileList: file ? [file] : []
    };
    // -----

    return (
        <Modal title={"Импорт таблицы"}
               maskClosable={false}
               open={props.visible}
               onOk={importDataHandler}
               onCancel={() => props.setVisible(false)}
               okText={"Создать"}
               width={'500px'}
               loading={isCreateTableLoading}
               confirmLoading={isCreateTableLoading}
        >
            <Flex gap={'small'} vertical>
                <Flex align={'center'} gap={'small'} >
                    <div style={{width: 200}}>Название таблицы</div>
                    <Input
                        placeholder={"Название таблицы"}
                        value={tableName}
                        onChange={(e) => updateTableNameHandler(e.target.value)}
                    />
                </Flex>
                <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined/>
                    </p>
                    <p className="ant-upload-text">Нажмите или перетащите файл в эту область для загрузки</p>
                    <p className="ant-upload-hint">
                        Внимательно проверяйте загружаемые файлы, принимаются только плоские таблицы
                    </p>
                </Dragger>
            </Flex>
        </Modal>
    );
};
