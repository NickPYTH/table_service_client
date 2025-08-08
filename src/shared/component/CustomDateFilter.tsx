import {Button, DatePicker, Select} from "antd";
import {useState} from "react"
import dayjs from "dayjs";

export const CustomDateFilter = ({setSelectedKeys, selectedKeys, confirm, clearFilters}: any) => {

    // States
    const [date, setDate] = useState(selectedKeys[0]?.date || null);
    const [operator, setOperator] = useState(selectedKeys[0]?.operator || '=');
    // -----

    // Handlers
    const handlerFilter = () => {
        setSelectedKeys([{date, operator}]);
        confirm();
    }
    const handleReset = () => {
        setDate(null);
        setOperator('=');
        clearFilters();
    }

    // -----

    return (
        <div style={{padding: 8}}>
            <Select
                value={operator}
                onChange={setOperator}
                style={{width: '100%', marginBottom: 8}}
            >
                <Select.Option value="=">Равно</Select.Option>
                <Select.Option value=">">После</Select.Option>
                <Select.Option value="<">До</Select.Option>
                <Select.Option value=">=">После или равно</Select.Option>
                <Select.Option value="<=">До или равно</Select.Option>
            </Select>
            <DatePicker
                value={date ? dayjs(date) : null}
                onChange={(date) => setDate(date ? date.toDate() : null)}
                style={{width: '100%', marginBottom: 8}}
            />
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <Button onClick={handleReset} size="small" style={{width: '48%'}}>
                    Сбросить
                </Button>
                <Button
                    type="primary"
                    onClick={handlerFilter}
                    size="small"
                    style={{width: '48%'}}
                >
                    Применить
                </Button>
            </div>
        </div>
    )

}