import {DataGridPremium, gridClasses, GridColDef} from "@mui/x-data-grid-premium";
import {ruRU} from "@mui/x-data-grid-premium/locales";
import {Flex, Spin} from "antd";

type PropsType = {
    columns: GridColDef[],
    gridData: any[] | undefined,
    setSelected: Function,
    setModalVisible: Function,
    pageSize?: number,
    onRowClick?: any
}

export const DataGrid = (props:PropsType) => {

    // Handlers
    const onRowDoubleClickHandler = (data:any) => {
        props.setSelected(data.row);
        props.setModalVisible(true);
    }
    // -----

    return(
        <div style={{width: '100%'}}>
            {props.gridData ?
                <DataGridPremium
                    pagination
                    showCellVerticalBorder
                    showColumnVerticalBorder
                    columns={props.columns}
                    rows={props.gridData ?? []}
                    getRowHeight={() => 'auto'}
                    sx={{
                        [`& .${gridClasses.cell}`]: {
                            p: "1px",
                        },
                    }}
                    localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                    onRowDoubleClick={onRowDoubleClickHandler}
                    onRowClick={props.onRowClick ? props.onRowClick : () => {}}
                    initialState={{
                        sorting: {
                            sortModel: [{field: 'id', sort: 'desc'}]
                        },
                        pagination: {
                            paginationModel: {pageSize: props.pageSize ? props.pageSize : 25, page: 0}
                        }
                    }}
                    pageSizeOptions={[25, 50, 100, 200, 300, 400, 500, 600]}
                />
                :
                <Flex style={{height: '100vh', width: '100vw'}} justify={'center'} align={'center'}>
                    <Spin size={'large'}/>
                </Flex>
            }
        </div>
    )
}
