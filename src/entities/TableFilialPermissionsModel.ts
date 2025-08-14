import {FilialModel} from "entities/FilialModel";

export type TableFilialPermissionsModel = {
    id: number;
    filial_id: number;
    filial: FilialModel;
    table: number;
}