import {UserModel} from "entities/UserModel";

export type MessageModel = {
    id: number;
    user_info: UserModel;
    text: string;
    send_at_formatted: string;
    is_deleted: boolean;
    edit_at_formatted: string | null;
    chat: number;
}