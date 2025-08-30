import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {TablePermissionsModel} from "entities/TablePermissionsModel";
import {RowPermissionsModel} from "entities/RowPermissionsModel";

export const rowPermissionsAPI = createApi({
    reducerPath: 'rowPermissionsAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/rowpermissions`,
    }),
    tagTypes: ['rowPermissions'],
    endpoints: (build) => ({
        getAllByRowId: build.mutation<RowPermissionsModel[], number>({
            query: (row_id) => ({
                url: `/?row_id=${row_id}`,
                method: 'GET'
            }),
            invalidatesTags: ['rowPermissions']
        }),
        create: build.mutation<RowPermissionsModel, {rowId: number, userId: number}>({
            query: ({rowId, userId}) => ({
                url: `/`,
                method: 'POST',
                body: {
                    row_id: rowId,
                    user_id: userId,
                    can_view: true
                }
            }),
            invalidatesTags: ['rowPermissions']
        }),
        delete: build.mutation<void, number>({
            query: (rowPermissionId) => ({
                url: `/${rowPermissionId}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['rowPermissions']
        }),
    })
});
