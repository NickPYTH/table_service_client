import {RouteProps} from "react-router-dom";
import React from "react";
import {TablesListPage} from "pages/TablesListPage";

export enum AppRoutes {
    TABLES_LIST_PAGE = 'TABLES_LIST_PAGE',
}

export const RoutePath: Record<AppRoutes, string> = {
    [AppRoutes.TABLES_LIST_PAGE]: '/table_service/tables_list',
}

export const routeConfig: Record<AppRoutes, RouteProps> = {
    [AppRoutes.TABLES_LIST_PAGE]: {
        path: RoutePath.TABLES_LIST_PAGE,
        element: <TablesListPage/>
    },
}