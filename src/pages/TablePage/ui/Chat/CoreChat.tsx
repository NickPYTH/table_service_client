import {Button, Empty, Flex, Input, Modal} from "antd"
import React, {useCallback, useEffect, useRef, useState} from "react";
import {TableModel} from "entities/TableModel";
import {wsHost} from "shared/config/constants";
import {MessageModel} from "entities/MessageModel";
import {ChatMessage} from "pages/TablePage/ui/Chat/ChatMessage";
import {SendOutlined} from "@ant-design/icons";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";
import {TableContextType} from "pages/TablePage/ui/TablePage";
import {useParams} from "react-router-dom";
//@ts-ignore
import {debounce} from "lodash";

type PropsType = {
    visible: boolean;
    setVisible: Function;
    table: TableModel;
    setContext: Function;
}
export const CoreChat = (props: PropsType) => {

    // Params
    let {id} = useParams();
    // -----

    // Store
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    // -----

    // States
    const chatBoxRef = useRef<HTMLElement>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<MessageModel[] | null>(null);
    const [messageText, setMessageText] = useState("");
    const [printingUser, setPrintingUser] = useState<string | null>(null);
    // -----

    // Effects
    useEffect(() => {
        // Подключение к чату
        const socket = new WebSocket(`${wsHost}/ws/chats/`);

        socket.onopen = () => {
            console.log('WebSocket chats connected');
            setSocket(socket);
        };

        socket.onmessage = (event) => {
            const message: { type: string, messages: string, user_name: string } = JSON.parse(event.data);
            if (message.type == 'get_chat_data') {
                let messagesList: MessageModel[] = JSON.parse(message.messages);
                setMessages((prevMessages) => {
                    // Если новые сообщения, то доблавяем их в контекст
                    if (prevMessages != null) {
                        let unread_message_count = localStorage.getItem(`unread_message_count_${id}`);
                        if (unread_message_count != "0" && unread_message_count != null) {
                            return messagesList;
                        }
                        // Берем разницу сообщений и записываем в конкест
                        let newMessages: MessageModel[] = messagesList.reduce((acc: MessageModel[], messageNew) => {
                            if (!prevMessages.find((messageOld: MessageModel) => messageNew.id == messageOld.id)) return acc.concat([messageNew]);
                            return acc;
                        }, []).filter((m: MessageModel) => m.user_info.id !== currentUser?.id);
                        if (unread_message_count == "0") {
                            localStorage.setItem(`unread_message_count_${id}`, newMessages.length.toString());
                        }
                        props.setContext((context: TableContextType) => ({...context, newMessages, unreadMessageCount: newMessages.length}));
                        // -----
                    }
                    // -----
                    return messagesList;
                });
            } else if (message.type == 'user_typing') {
                setPrintingUser(prev => {
                    if (currentUser) {
                        if (`${currentUser.last_name} ${currentUser.first_name}` != message.user_name) {
                            return message.user_name;
                        }
                    }
                    return null;
                })
                setTimeout(() => {
                    setPrintingUser(null);
                }, 3000);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket chats disconnected');
        };

        socket.onerror = (error) => {
            console.error('WebSocket chats error:', error);
        };

        return () => {
            socket.close();
        };
    }, []);
    useEffect(() => {
        if (socket) {
            socket.send(JSON.stringify({table_id: props.table.id, type: 'get_chat_data'}));
        }
    }, [socket]);
    useEffect(() => {
        if (messages && chatBoxRef?.current && props.visible) {
            // При получении списка сообщений скролим вниз
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages, chatBoxRef, props.visible]);
    // -----

    // Handlers
    const sendMessageHandler = () => {
        if (messageText.trim() && socket && currentUser) {
            socket.send(JSON.stringify({type: 'send_message', table_id: props.table.id, user_id: currentUser.id, message: messageText}));
            setMessageText("");
        }
    };
    const debouncedInputHandler = useCallback(
        debounce((value: string) => {
            if (socket && currentUser)
                socket.send(JSON.stringify({type: 'user_typing', table_id: props.table.id, user_name: `${currentUser.last_name} ${currentUser.first_name}`}));
        }, 500), [socket, currentUser]);

    const inputHandler = (e: any) => {
        setMessageText(e.target.value);
        debouncedInputHandler(e.target.value);
    };
    // -----

    return (
        <Modal title={`Обсуждение таблицы`}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'650px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex style={{height: window.innerHeight * 0.5}} gap={'small'} vertical justify={'space-between'}>
                <Flex ref={chatBoxRef} style={{height: window.innerHeight * 0.5 - 60, overflowY: 'scroll', padding: 10}} gap={'small'} vertical>
                    {messages ?
                        messages.map((message: MessageModel) => <ChatMessage message={message}/>)
                        :
                        <Empty description={"Нет сообщений"}/>
                    }
                    {printingUser && <div style={{fontSize: 12, color: '#797979', position: 'absolute', bottom: 65}}>{printingUser} печатает...</div>}
                </Flex>
                <Flex gap={'small'}>
                    <Input placeholder={"Сообщение"} variant={'outlined'} value={messageText} onChange={inputHandler}/>
                    <Button onClick={sendMessageHandler} icon={<SendOutlined/>}/>
                </Flex>
            </Flex>
        </Modal>
    )
}