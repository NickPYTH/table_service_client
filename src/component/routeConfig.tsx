import {RouteProps} from "react-router-dom";
import React from "react";
import {TablesListPage} from "pages/TablesListPage";
import {TablePage} from "pages/TablePage";
import Error403Page from "pages/Error403Page/ui/Error403Page";

export enum AppRoutes {
    TABLES_LIST_PAGE = 'TABLES_LIST_PAGE',
    TABLE_PAGE = 'TABLE_PAGE',
    ERROR_403_PAGE = 'ERROR_403_PAGE',
}

export const RoutePath: Record<AppRoutes, string> = {
    [AppRoutes.TABLES_LIST_PAGE]: '/table_service/tables_list',
    [AppRoutes.TABLE_PAGE]: '/table_service/tables_list/:id',
    [AppRoutes.ERROR_403_PAGE]: '/table_service/error_403',
}

export const routeConfig: Record<AppRoutes, RouteProps> = {
    [AppRoutes.TABLES_LIST_PAGE]: {
        path: RoutePath.TABLES_LIST_PAGE,
        element: <TablesListPage/>
    },
    [AppRoutes.TABLE_PAGE]: {
        path: RoutePath.TABLE_PAGE,
        element: <TablePage/>
    },
    [AppRoutes.ERROR_403_PAGE]: {
        path: RoutePath.ERROR_403_PAGE,
        element: <Error403Page />
    },
}