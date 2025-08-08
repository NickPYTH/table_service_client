import {UserModel} from "entities/UserModel";

export type RowModel = {
    id: number;
    order: number;
    created_by: UserModel;
}