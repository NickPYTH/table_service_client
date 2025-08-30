import React, {useEffect, useState} from 'react';
import {Flex, Input, Modal, UploadFile, UploadProps} from 'antd';
import {tableAPI} from "service/TableService";
import {useNavigate} from "react-router-dom";
import {InboxOutlined} from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";
import {host} from "shared/config/constants";

type ModalProps = {
    visible: boolean,
    setVisible: Function,
    refresh: Function,
}

export const ImportTableModal = (props: ModalProps) => {

    // States
    const [tableName, setTableName] = useState("");
    const [file, setFile] = useState<any | null>(null);
    const navigate = useNavigate();
    const [loading ,setIsLoading] = useState(false);
    // -----

    // Web requests

    // -----

    // Effects

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

            setIsLoading(true);

            //@ts-ignore
            fetch(`${host}/api/file/upload/`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    console.log(result);
                    props.setVisible(false);
                    props.refresh();
                })
                .catch((error) => {
                    console.error(error);
                    setIsLoading(false);
                });
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
               loading={loading}
               confirmLoading={loading}
               width={'500px'}
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
