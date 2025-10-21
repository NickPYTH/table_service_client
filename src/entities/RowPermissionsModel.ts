import {UserModel} from "entities/UserModel";

export type RowPermissionsModel = {
    id: number;
    row: number;
    user: number;
    table: number;
    can_edit: boolean;
    can_delete: boolean;
    user_model: UserModel;
}