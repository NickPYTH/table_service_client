import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {TableFilialPermissionsModel} from "entities/TableFilialPermissionsModel";

export const tableFilialPermissionsAPI = createApi({
    reducerPath: 'tableFilialPermissionsAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/tbfilialpermissions`,
    }),
    tagTypes: ['tableFilialPermissions'],
    endpoints: (build) => ({
        getAllByTableId: build.mutation<TableFilialPermissionsModel[], string>({
            query: (table_id) => ({
                url: `/?table_id=${table_id}`,
                method: 'GET'
            }),
            invalidatesTags: ['tableFilialPermissions']
        }),
        create: build.mutation<TableFilialPermissionsModel, {tableId: string, userId: number}>({
            query: ({tableId, userId}) => ({
                url: `/`,
                method: 'POST',
                body: {
                    table: tableId,
                    filial_id: userId,
                    can_view: true
                }
            }),
            invalidatesTags: ['tableFilialPermissions']
        }),
        delete: build.mutation<void, number>({
            query: (tablePermissionId) => ({
                url: `/${tablePermissionId}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['tableFilialPermissions']
        }),
    })
});
