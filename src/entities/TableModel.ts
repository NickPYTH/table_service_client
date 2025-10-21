import {UserModel} from "entities/UserModel";
import {CellModel} from "entities/CellModel";

export type TableModel = {
    id: number;
    title: string;
    owner: UserModel;
    created_at: number;
    cells: CellModel[] | null;
    with_cell_confirm: boolean;
    with_cell_logging: boolean;
}