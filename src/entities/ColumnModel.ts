
export type ColumnModel = {
    id?: number;
    name: string;
    order?: number;
    data_type: any;
    table?: string;
    select_values?: string[];
    related_column_ids: number[];
}