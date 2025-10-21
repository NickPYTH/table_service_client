import {MessageModel} from "entities/MessageModel";
import {RootStateType} from "store/store";
import {useSelector} from "react-redux";
import "./ChatMessageStyles.scss";
import {useState} from "react";

type PropsType = {
    message: MessageModel;
}

export const ChatMessage = (props:PropsType) => {

    // Store
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    const [isOwn] = useState(() => currentUser?.id == props.message.user_info.id);
    // -----

    return(
        <div className={`message-container ${isOwn ? 'own-message' : 'other-message'}`}>
            <div className="message-wrapper">
                <div className="message-bubble">
                    <div className="sender-name">{props.message.user_info.last_name} {props.message.user_info.first_name}</div>
                    <div className="message-content">
                        {props.message.text}
                    </div>
                    <div className="message-footer">
                        <span className="message-time">{props.message.send_at_formatted}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}