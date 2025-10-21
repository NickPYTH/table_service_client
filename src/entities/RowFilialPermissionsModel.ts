import {FilialModel} from "entities/FilialModel";

export type RowFilialPermissionsModel = {
    id: number;
    filial_id: number;
    filial: FilialModel;
    row: number;
}