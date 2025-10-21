import {UserModel} from "entities/UserModel";
import {CellModel} from "entities/CellModel";

export type RowModel = {
    id: number;
    order: number;
    created_by: UserModel;
    cells_list: CellModel[];

    // Для вставки
    position?: number;
}