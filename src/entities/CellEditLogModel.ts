
export type CellEditLogModel = {
    id?: number;
    user_id: number;
    old_value: string;
    new_value: string;
    cell_id: number;
}