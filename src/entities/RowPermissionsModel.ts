import {UserModel} from "entities/UserModel";

export type RowPermissionsModel = {
    id: number;
    row_id: number;
    user_id: number;
    can_edit: boolean;
    can_delete: boolean;
    user: UserModel;
}