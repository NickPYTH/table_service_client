import {UserModel} from "entities/UserModel";

export type PermissionModel = {
    id: number;
    row?: number;
    column?: number;
    user: number;
    table: number;
    can_edit: boolean;
    can_delete: boolean;
    user_model: UserModel;
}