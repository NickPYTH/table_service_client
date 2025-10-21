import React, {useState} from 'react';
import {Flex, Modal, UploadProps} from 'antd';
import {useParams} from "react-router-dom";
import {InboxOutlined} from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";
import {host} from "shared/config/constants";

type ModalProps = {
    visible: boolean,
    setVisible: Function,
    refresh: Function,
}

export const ImportRowsModal = (props: ModalProps) => {

    // States
    let {id} = useParams();
    const [file, setFile] = useState<any | null>(null);
    const [loading, setIsLoading] = useState(false);
    // -----

    // Web requests

    // -----

    // Effects

    // -----

    // Handlers
    const importDataHandler = () => {
        if (file && id) {
            const formData = new FormData();
            formData.append("table_id", id);
            formData.append("file", file, "file.xlsx");

            const requestOptions = {
                method: "POST",
                body: formData,
                redirect: "follow"
            };

            setIsLoading(true);

            //@ts-ignore
            fetch(`${host}/api/rowfile/upload/`, requestOptions)
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
        <Modal title={"Импорт строк"}
               maskClosable={false}
               open={props.visible}
               onOk={importDataHandler}
               onCancel={() => props.setVisible(false)}
               okText={"Добавить"}
               loading={loading}
               confirmLoading={loading}
               width={'500px'}
        >
            <Flex gap={'small'} vertical>
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
