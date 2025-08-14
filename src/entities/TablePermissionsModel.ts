import {UserModel} from "entities/UserModel";

export type TablePermissionsModel = {
    id: number;
    user_id: number;
    user: UserModel;
    table: number;
}