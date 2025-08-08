import {RowModel} from "entities/RowModel";
import {ColumnModel} from "entities/ColumnModel";

export type CellModel = {
    id: number;
    row: RowModel;
    column: ColumnModel;
    value: "string";
}