import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {TablePermissionsModel} from "entities/TablePermissionsModel";

export const tablepermissionsAPI = createApi({
    reducerPath: 'tablepermissionsAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/tablepermissions`,
    }),
    tagTypes: ['tablepermissions'],
    endpoints: (build) => ({
        getAllByTableId: build.mutation<TablePermissionsModel[], string>({
            query: (table_id) => ({
                url: `/?table_id=${table_id}`,
                method: 'GET'
            }),
            invalidatesTags: ['tablepermissions']
        }),
        create: build.mutation<TablePermissionsModel, {tableId: string, userId: number}>({
            query: ({tableId, userId}) => ({
                url: `/`,
                method: 'POST',
                body: {
                    table: tableId,
                    user_id: userId,
                    can_view: true
                }
            }),
            invalidatesTags: ['tablepermissions']
        }),
        delete: build.mutation<void, number>({
            query: (tablePermissionId) => ({
                url: `/${tablePermissionId}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['tablepermissions']
        }),
    })
});
