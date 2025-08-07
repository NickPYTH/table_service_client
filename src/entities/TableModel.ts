import {UserModel} from "entities/UserModel";

export type TableModel = {
    id: number;
    title: string;
    owner: UserModel;
    created_at: number;
}