export type CellModel = {
    id: number;
    row: number;
    column: number;
    value: string;

    // Вычисляемые поля
    type?: string
}