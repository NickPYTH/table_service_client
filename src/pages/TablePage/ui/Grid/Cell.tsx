import {ColumnModel} from "entities/ColumnModel";
import {useContext, useEffect, useState} from "react";
import {TableContext} from "pages/TablePage/ui/TablePage";
import {RootStateType} from "store/store";
import {useSelector} from "react-redux";
import {PermissionModel} from "entities/PermissionModel";
import {Tag} from "antd";

type PropsType = {
    formattedValue: string,
    column: ColumnModel,
    row: any,
}
export const Cell = (props: PropsType) => {

    // Store
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    // ----

    // Context
    const tableContext = useContext(TableContext);
    // -----

    // States
    const [isLocked, setIsLocked] = useState(false);
    // -----

    // Effects
    useEffect(() => {
        if (tableContext) {
            let columnId: number = props.column.id as number;
            setIsLocked(
                !!tableContext.lockedCellsIds.find((lock => lock.cell_id == props.row[columnId].id && currentUser?.id != lock.user_id))
                ||
                (
                tableContext.rowPermissions?.find((rp: PermissionModel) => rp.row == props.row.id) == undefined
                    ||
                tableContext.columnPermissions?.find((cp: PermissionModel) => cp.column == props.column.id) == undefined
                )
                ||
                (
                    tableContext.withCellConfirm && props.formattedValue.length > 0 && tableContext.owner?.id != currentUser?.id
                )
            );
        }
    }, [tableContext]);
    // -----

    // Handlers
    const demonLinkHandler = (path: string) => {
        if (tableContext?.demonWS && currentUser)
            tableContext?.demonWS.send(JSON.stringify({username: currentUser.username, path}));
    }
    // -----
    if (typeof props.formattedValue == 'string') {
        if (props.formattedValue.includes("/sgp.ru/data/"))
            return (
                <div
                    style={{minHeight: 30, background: isLocked ? "#c4c4c4" : "inherit"}}>
                    <a onClick={() => demonLinkHandler(props.formattedValue)}>{props.formattedValue}</a>
                </div>
            )
    }

    return (
        <div
            style={{height: "100%", background: isLocked ? "#c4c4c4" : "inherit"}}>
            {props.row[props.column.id ?? "123"] ?
                props.row[props.column.id ?? "123"].formula_value ?
                    <>
                        <Tag>F</Tag>
                        {props.row[props.column.id ?? "123"].formula_value}
                    </>
                    :
                    props.formattedValue
                :
                props.formattedValue}
        </div>
    )
}